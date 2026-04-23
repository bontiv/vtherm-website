/**
 * add-plugin-from-issue.mjs
 *
 * Reads a GitHub issue created from the new_plugin.yml template,
 * builds a VTPlugin entry, inserts it into pluginsdb/plugins.json (re-sorting
 * the entire array), then opens a Pull Request against the `stable` branch
 * (or `latest` if specified).
 *
 * Usage:
 *   # Automatically (GitHub Actions – issue number comes from GITHUB_EVENT_PATH)
 *   node scripts/add-plugin-from-issue.mjs
 *
 *   # Manually (defaults to stable branch)
 *   GITHUB_TOKEN=ghp_xxx GITHUB_REPOSITORY=owner/repo \
 *     node scripts/add-plugin-from-issue.mjs 42
 *
 *   # Manually targeting the latest branch
 *   GITHUB_TOKEN=ghp_xxx GITHUB_REPOSITORY=owner/repo \
 *     node scripts/add-plugin-from-issue.mjs 42 --branch latest
 */

import { Octokit } from 'octokit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALLOWED_BRANCHES = ['stable', 'latest'];
const DEFAULT_BRANCH = 'stable';
const PLUGINS_PATH = 'pluginsdb/plugins.json';

/** Certification sort order – lower index = higher priority */
const CERT_ORDER = ['official', 'recommended', 'community'];

/** Maps the issue form field labels to internal keys */
const FIELD_MAP = {
    'Name of your plugin': 'title',
    'GitHub URL': 'github_url',
    'Plugin type': 'type',
    'Plugin family': 'family',
    'Plugin description': 'description',
};

/** Maps the dropdown display values to schema enum values */
const TYPE_MAP = {
    Integration: 'integration',
    Interface: 'interface',
    'Add-on': 'addon',
    Blueprint: 'blueprint',
};

/** Maps the family dropdown display values to schema enum values */
const FAMILY_MAP = {
    Algorithm: 'algorithm',
    'Device helper': 'device-helper',
    Interface: 'interface',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse a GitHub issue body produced by a GitHub Forms template.
 * Sections look like:
 *
 *   ### Field label
 *   Field value
 *
 * @param {string} body
 * @returns {Record<string, string>}
 */
function parseIssueBody(body) {
    const fields = {};
    if (!body) return fields;

    // Split on "### " headings
    const sections = body.split(/^### /m);
    for (const section of sections) {
        const firstNewline = section.indexOf('\n');
        if (firstNewline === -1) continue;

        const label = section.slice(0, firstNewline).trim();
        const value = section.slice(firstNewline + 1).trim();

        // Skip "_No response_" placeholders that GitHub injects for empty optionals
        if (label && value && value !== '_No response_') {
            fields[label] = value;
        }
    }
    return fields;
}

/**
 * Extract a `owner/repo` slug from a GitHub URL.
 * Accepts:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo/
 *   https://gist.github.com/owner/id   (gists)
 *
 * @param {string} url
 * @returns {string}
 */
function slugFromUrl(url) {
    const cleaned = url.trim().replace(/\/$/, '');
    const match = cleaned.match(/github\.com\/([^/]+\/[^/]+)/);
    if (!match) throw new Error(`Cannot extract slug from URL: ${url}`);
    return match[1];
}

/**
 * Strip a GitHub "render: Markdown" code-fence wrapper that GitHub injects
 * around textarea fields declared with `render: Markdown` in issue templates.
 * The body value arrives as:
 *
 *   ```Markdown
 *   <actual content>
 *   ```
 *
 * This function returns the inner content unchanged when no such fence is present.
 *
 * @param {string} value
 * @returns {string}
 */
function stripMarkdownFence(value) {
    // Match an opening fence of the form ```<lang> (case-insensitive) at the very
    // start of the string, then capture everything up to the closing ```.
    const match = value.match(/^```[^\n]*\n([\s\S]*?)```\s*$/);
    return match ? match[1].trim() : value;
}

/**
 * Convert a Markdown string to an HTML string.
 * Uses remark-gfm so GitHub Flavored Markdown (tables, strikethrough, etc.) is supported.
 *
 * @param {string} markdown
 * @returns {Promise<string>}
 */
async function markdownToHtml(markdown) {
    const file = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeStringify)
        .process(markdown);
    return String(file).trim();
}

/**
 * Sort a plugin array: official → recommended → community, then a-z by name.
 *
 * @param {object[]} plugins
 * @returns {object[]}
 */
function sortPlugins(plugins) {
    return [...plugins].sort((a, b) => {
        const certA = CERT_ORDER.indexOf(a.certification);
        const certB = CERT_ORDER.indexOf(b.certification);
        if (certA !== certB) return certA - certB;
        return (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' });
    });
}

// ---------------------------------------------------------------------------
// Configuration resolution
// ---------------------------------------------------------------------------

/**
 * Try to retrieve the GitHub token from the `gh` CLI (requires `gh auth login`).
 * Returns `null` if the CLI is not available or not authenticated.
 *
 * @returns {string|null}
 */
function tokenFromGhCli() {
    try {
        return execSync('gh auth token', { stdio: ['pipe', 'pipe', 'pipe'] })
            .toString()
            .trim();
    } catch {
        return null;
    }
}

/**
 * Try to retrieve the current repository slug (`owner/repo`) from the `gh` CLI.
 * Returns `null` if the CLI is not available or not inside a GitHub repository.
 *
 * @returns {string|null}
 */
function repositoryFromGhCli() {
    try {
        return execSync('gh repo view --json nameWithOwner -q .nameWithOwner', {
            stdio: ['pipe', 'pipe', 'pipe'],
        })
            .toString()
            .trim();
    } catch {
        return null;
    }
}

function resolveConfig() {
    // --- Token -----------------------------------------------------------
    let token = process.env.GITHUB_TOKEN;

    if (!token) {
        console.log('ℹ️   GITHUB_TOKEN not set – trying `gh auth token` …');
        token = tokenFromGhCli();
    }

    if (!token) {
        console.error(
            '❌  No GitHub token found.\n' +
            '   Either set the GITHUB_TOKEN environment variable or run `gh auth login`.'
        );
        process.exit(1);
    }

    // --- Repository ------------------------------------------------------
    let repository = process.env.GITHUB_REPOSITORY;

    if (!repository || !repository.includes('/')) {
        console.log('ℹ️   GITHUB_REPOSITORY not set – trying `gh repo view` …');
        repository = repositoryFromGhCli();
    }

    if (!repository || !repository.includes('/')) {
        console.error(
            '❌  Could not determine the repository.\n' +
            '   Either set GITHUB_REPOSITORY="owner/repo" or run inside a GitHub repository with `gh` configured.'
        );
        process.exit(1);
    }

    const [owner, repo] = repository.split('/');

    // Branch: read --branch <value> from CLI args, default to stable
    const branchFlagIndex = process.argv.indexOf('--branch');
    let baseBranch = DEFAULT_BRANCH;
    if (branchFlagIndex !== -1) {
        const branchValue = process.argv[branchFlagIndex + 1];
        if (!branchValue || !ALLOWED_BRANCHES.includes(branchValue)) {
            console.error(
                `❌  Invalid --branch value: "${branchValue}".\n` +
                `   Allowed values: ${ALLOWED_BRANCHES.join(', ')}`
            );
            process.exit(1);
        }
        baseBranch = branchValue;
    }

    // Issue number: prefer CLI argument (first non-flag arg), fall back to the event payload
    const firstArg = process.argv.slice(2).find(a => !a.startsWith('--') && !/^(stable|latest)$/.test(a));
    let issueNumber = parseInt(firstArg, 10);

    if (!issueNumber && process.env.GITHUB_EVENT_PATH) {
        try {
            const eventPayload = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
            issueNumber = eventPayload?.issue?.number;
        } catch {
            // ignore – will be caught below
        }
    }

    if (!issueNumber || isNaN(issueNumber)) {
        console.error(
            '❌  Could not determine the issue number.\n' +
            '   Pass it as the first argument:  node scripts/add-plugin-from-issue.mjs <number>\n' +
            '   Or run from a GitHub Actions "issues" event.'
        );
        process.exit(1);
    }

    console.log(`🌿  Using base branch: "${baseBranch}"`);
    return { token, owner, repo, issueNumber, baseBranch };
}

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

async function run() {
    const { token, owner, repo, issueNumber, baseBranch } = resolveConfig();

    const octokit = new Octokit({ auth: token });

    // ------------------------------------------------------------------
    // 1. Fetch the issue
    // ------------------------------------------------------------------
    console.log(`🔍  Fetching issue #${issueNumber} from ${owner}/${repo} …`);
    const { data: issue } = await octokit.rest.issues.get({
        owner,
        repo,
        issue_number: issueNumber,
    });

    if (!issue.title.startsWith('[Plugin]')) {
        console.error(
            `❌  Issue #${issueNumber} does not appear to be a plugin request.\n` +
            `   Title: "${issue.title}"`
        );
        process.exit(1);
    }

    // ------------------------------------------------------------------
    // 2. Parse the issue body
    // ------------------------------------------------------------------
    const rawFields = parseIssueBody(issue.body);
    console.log('📋  Parsed issue fields:', rawFields);

    // Remap to internal keys using FIELD_MAP
    const fields = {};
    for (const [label, key] of Object.entries(FIELD_MAP)) {
        if (rawFields[label] !== undefined) {
            fields[key] = rawFields[label];
        }
    }

    // ------------------------------------------------------------------
    // 3. Build the VTPlugin object
    // ------------------------------------------------------------------
    const { title, github_url, type: rawType, family: rawFamily, description } = fields;

    if (!title || !github_url || !rawType || !description) {
        console.error('❌  Missing required fields in the issue form. Got:', fields);
        process.exit(1);
    }

    const pluginType = TYPE_MAP[rawType];
    if (!pluginType) {
        console.error(`❌  Unknown plugin type: "${rawType}". Expected one of: ${Object.keys(TYPE_MAP).join(', ')}`);
        process.exit(1);
    }

    const pluginFamily = rawFamily ? FAMILY_MAP[rawFamily] : undefined;
    if (rawFamily && !pluginFamily) {
        console.warn(`⚠️   Unknown plugin family: "${rawFamily}". Expected one of: ${Object.keys(FAMILY_MAP).join(', ')}. The field will be omitted.`);
    }

    const slug = slugFromUrl(github_url);
    const authorFromSlug = slug.split('/')[0];

    const descriptionHtml = await markdownToHtml(stripMarkdownFence(description));
    console.log('📝  Description converted to HTML.');

    /** @type {import('../lib/plugindb.js').VTPlugin} */
    const newPlugin = {
        name: title,
        description: descriptionHtml,
        certification: 'community',
        type: pluginType,
        ...(pluginFamily && { family: pluginFamily }),
        slug,
        author: authorFromSlug,
    };

    // Blueprints often have a raw download URL different from the repo URL;
    // keep the github_url as-is if it looks like a raw/gist content URL.
    if (pluginType === 'blueprint' && github_url.includes('raw.githubusercontent')) {
        newPlugin.url = github_url;
    }

    console.log('🧩  New plugin entry:', newPlugin);

    // ------------------------------------------------------------------
    // 4. Read, merge and sort plugins.json
    // ------------------------------------------------------------------
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const pluginsFilePath = path.join(__dirname, '..', PLUGINS_PATH);

    const existing = JSON.parse(fs.readFileSync(pluginsFilePath, 'utf8'));
    const merged = sortPlugins([...existing, newPlugin]);
    const updatedContent = JSON.stringify(merged, null, 4) + '\n';

    console.log(`✅  Sorted plugin list (${merged.length} entries total).`);

    // ------------------------------------------------------------------
    // 5. Get the base SHA from the target branch
    // ------------------------------------------------------------------
    console.log(`🌿  Getting latest SHA from branch "${baseBranch}" …`);
    const { data: baseBranchData } = await octokit.rest.repos.getBranch({
        owner,
        repo,
        branch: baseBranch,
    });
    const baseSha = baseBranchData.commit.sha;

    // ------------------------------------------------------------------
    // 6. Create a new branch
    // ------------------------------------------------------------------
    const sanitizedSlug = slug.replace(/[^a-zA-Z0-9-]/g, '-');
    const branchName = `plugin/add-${sanitizedSlug}-${issueNumber}`;

    console.log(`🌱  Creating branch "${branchName}" …`);
    try {
        await octokit.rest.git.createRef({
            owner,
            repo,
            ref: `refs/heads/${branchName}`,
            sha: baseSha,
        });
    } catch (err) {
        if (err.status === 422 && err.response?.data?.message === 'Reference already exists') {
            console.log(`⚠️   Branch "${branchName}" already exists – resetting it to base SHA …`);
            await octokit.rest.git.updateRef({
                owner,
                repo,
                ref: `heads/${branchName}`,
                sha: baseSha,
                force: true,
            });
        } else {
            throw err;
        }
    }

    // ------------------------------------------------------------------
    // 7. Commit the updated plugins.json
    // ------------------------------------------------------------------
    console.log(`💾  Committing updated ${PLUGINS_PATH} …`);

    // Fetch the current blob SHA so GitHub accepts the update.
    // If the file doesn't exist on the base branch yet, omit sha (creates the file).
    let existingFileSha;
    try {
        const { data: currentFile } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: PLUGINS_PATH,
            ref: branchName,
        });
        existingFileSha = currentFile.sha;
    } catch (err) {
        if (err.status === 404) {
            console.log(`ℹ️   ${PLUGINS_PATH} not found on branch "${branchName}" – will create it.`);
        } else {
            throw err;
        }
    }

    const commitPayload = {
        owner,
        repo,
        path: PLUGINS_PATH,
        message: `feat(plugins): add plugin "${title}" (#${issueNumber})`,
        content: Buffer.from(updatedContent).toString('base64'),
        branch: branchName,
    };
    if (existingFileSha) commitPayload.sha = existingFileSha;

    await octokit.rest.repos.createOrUpdateFileContents(commitPayload);

    // ------------------------------------------------------------------
    // 8. Open a Pull Request
    // ------------------------------------------------------------------
    console.log('📬  Opening Pull Request …');
    const { data: pr } = await octokit.rest.pulls.create({
        owner,
        repo,
        title: `[Plugin] Add ${title}`,
        body: [
            `Closes #${issueNumber}`,
            '',
            `Adds the **${title}** plugin (\`${pluginType}\`) to the database.`,
            '',
            '| Field | Value |',
            '|-------|-------|',
            `| Name | ${title} |`,
            `| Type | ${pluginType} |`,
            ...(pluginFamily ? [`| Family | ${pluginFamily} |`] : []),
            `| Certification | community |`,
            `| Slug | \`${slug}\` |`,
            `| GitHub URL | ${github_url} |`,
            '',
            '> ⚠️ The certification level is set to `community` by default.',
            '> A maintainer can upgrade it after review.',
        ].join('\n'),
        head: branchName,
        base: baseBranch,
    });

    // Apply the `documentation` label to the PR
    await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: pr.number,
        labels: ['documentation'],
    });

    console.log(`🎉  Pull Request created: ${pr.html_url}`);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

run().catch((err) => {
    console.error('❌  Unexpected error:', err);
    process.exit(1);
});
