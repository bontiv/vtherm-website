import { GitHubAPI } from "@/lib/github";

/** Reading order of the documentation pages. Pages missing from this list come after, in repository order. */
const DOC_ORDERING = [
    'presentation',
    'installation',
    'quick-start',
    'creation',
    'base-attributes',
    'over-switch',
    'over-climate',
    'over-valve',
    'feature-presets',
    'feature-window',
    'feature-presence',
    'feature-motion',
    'feature-power',
    'feature-auto-start-stop',
    'feature-central-mode',
    'feature-central-boiler',
    'feature-advanced',
    'feature-heating-failure-detection',
    'self-regulation',
    'feature-autotpi',
    'feature-lock',
    'feature-sync_device_temp',
    'feature-timed-preset',
    'tuning-examples',
    'algorithms',
    'reference',
    'troubleshooting',
    'releases'
];

/**
 * Documentation pages (file names without `.md`) available in the `main` branch for a language, in reading order.
 */
export async function getOrderedDocFiles(lng: string): Promise<string[]> {
    const githubapi = GitHubAPI.getInstance();
    const filesDir = (await githubapi.getGitTreePath(`main/documentation/${lng}`))?.sha;
    if (!filesDir) {
        return [];
    }
    const files = (await githubapi.getGitTree(filesDir)).tree
        .filter((x) => x.type === 'blob' && x.path.endsWith('.md'))
        .map((item) => item.path.slice(0, -3));

    return DOC_ORDERING.filter(x => files.includes(x)).concat(files.filter(x => !DOC_ORDERING.includes(x)));
}
