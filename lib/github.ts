import { Octokit } from "octokit";

export class GitHubAPI {
    private octokit: Octokit;
    private owner: string;
    private repo: string;

    constructor(owner: string = 'jmcollin78', repo: string = 'versatile_thermostat') {
        this.owner = owner;
        this.repo = repo;
        this.octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN,
            request: {
                timeout: 5000,
                fetch: async (input: RequestInfo, init?: RequestInit) => fetch(input, {
                    ...init,
                    cache: 'force-cache',
                    next: { revalidate: 3600 },
                }),
            },
        });
    }

    async getReleases() {
        try {
            const releases = await this.octokit.rest.repos.listReleases({
                owner: this.owner,
                repo: this.repo,
            });
            return releases.data;
        } catch (error) {
            console.error('Error fetching releases:', error);
            throw error;
        }
    }

    async getGitTree(tag: string) {
        try {
            const tree = await this.octokit.rest.git.getTree({
                owner: this.owner,
                repo: this.repo,
                tree_sha: tag,
            });
            return tree.data;
        } catch (error) {
            console.error('Error fetching git tree:', error);
            throw error;
        }
    }

    async getGitTreePath(path: string) {
        try {
            const paths = path.split('/');
            let sha = paths.shift();
            let last_query = undefined;
            let last_item = undefined;

            for (const segment of paths) {
                last_query = await this.getGitTree(sha!);
                last_item = last_query.tree.find((item) => item.path === segment);
                sha = last_item?.sha;
            }

            return last_item;

        } catch (error) {
            console.error('Error fetching git tree path:', error);
            throw error;
        }
    }

    async getGitBlob(sha: string, raw: boolean = false) {
        try {
            const blob = await this.octokit.rest.git.getBlob({
                owner: this.owner,
                repo: this.repo,
                file_sha: sha,
                headers: {
                    accept: raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json',
                },
            });
            return blob.data;
        } catch (error) {
            console.error('Error fetching git blob:', error);
            throw error;
        }
    }
}
