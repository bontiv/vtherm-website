/**
 * add-plugin-from-issue.mjs
 *
 * Reads a GitHub issue created from the new_plugin.yml template,
 * builds a VTPlugin entry, inserts it into pluginsdb/plugins.json (re-sorting
 * the entire array), then opens a Pull Request against the `stable` branch.
 *
 * Usage:
 *   # Automatically (GitHub Actions – issue number comes from GITHUB_EVENT_PATH)
 *   node scripts/add-plugin-from-issue.mjs
 *
 *   # Manually
 *   GITHUB_TOKEN=ghp_xxx GITHUB_REPOSITORY=owner/repo \
 *     node scripts/add-plugin-from-issue.mjs 42
 */

import { Octokit } from 'octokit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_BRANCH = 'stable';
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

function resolveConfig() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        console.error('❌  GITHUB_TOKEN environment variable is required.');
        process.exit(1);
    }

    const repository = process.env.GITHUB_REPOSITORY;
    if (!repository || !repository.includes('/')) {
        console.error('❌  GITHUB_REPOSITORY environment variable must be set to "owner/repo".');
        process.exit(1);
    }
    const [owner, repo] = repository.split('/');

    // Issue number: prefer CLI argument, fall back to the event payload
    let issueNumber = parseInt(process.argv[2], 10);

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

    return { token, owner, repo, issueNumber };
}

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

async function run() {
    const { token, owner, repo, issueNumber } = resolveConfig();

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
    const { title, github_url, type: rawType, description } = fields;

    if (!title || !github_url || !rawType || !description) {
        console.error('❌  Missing required fields in the issue form. Got:', fields);
        process.exit(1);
    }

    const pluginType = TYPE_MAP[rawType];
    if (!pluginType) {
        console.error(`❌  Unknown plugin type: "${rawType}". Expected one of: ${Object.keys(TYPE_MAP).join(', ')}`);
        process.exit(1);
    }

    const slug = slugFromUrl(github_url);
    const authorFromSlug = slug.split('/')[0];

    /** @type {import('../lib/plugindb.js').VTPlugin} */
    const newPlugin = {
        name: title,
        description,
        certification: 'community',
        type: pluginType,
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
    // 5. Get the base SHA from the `stable` branch
    // ------------------------------------------------------------------
    console.log(`🌿  Getting latest SHA from branch "${BASE_BRANCH}" …`);
    const { data: baseBranch } = await octokit.rest.repos.getBranch({
        owner,
        repo,
        branch: BASE_BRANCH,
    });
    const baseSha = baseBranch.commit.sha;

    // ------------------------------------------------------------------
    // 6. Create a new branch
    // ------------------------------------------------------------------
    const sanitizedSlug = slug.replace(/[^a-zA-Z0-9-]/g, '-');
    const branchName = `plugin/add-${sanitizedSlug}-${issueNumber}`;

    console.log(`🌱  Creating branch "${branchName}" …`);
    await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: baseSha,
    });

    // ------------------------------------------------------------------
    // 7. Commit the updated plugins.json
    // ------------------------------------------------------------------
    console.log(`💾  Committing updated ${PLUGINS_PATH} …`);

    // Fetch the current blob SHA so GitHub accepts the update
    const { data: currentFile } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: PLUGINS_PATH,
        ref: BASE_BRANCH,
    });

    await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: PLUGINS_PATH,
        message: `feat(plugins): add plugin "${title}" (#${issueNumber})`,
        content: Buffer.from(updatedContent).toString('base64'),
        sha: currentFile.sha,
        branch: branchName,
    });

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
            `| Certification | community |`,
            `| Slug | \`${slug}\` |`,
            `| GitHub URL | ${github_url} |`,
            '',
            '> ⚠️ The certification level is set to `community` by default.',
            '> A maintainer can upgrade it after review.',
        ].join('\n'),
        head: branchName,
        base: BASE_BRANCH,
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
