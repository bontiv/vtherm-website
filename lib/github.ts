import { Octokit } from "octokit";
import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods'

export type GithubReleases = RestEndpointMethodTypes['repos']['listReleases']['response']['data']

async function cachedFetch(input: RequestInfo, init?: RequestInit): Promise<Response | undefined> {
    const response = await fetch(input, {
        cache: 'force-cache',
        next: { revalidate: 3600 },
        ...init,
    });
    return response;
}

export class GitHubAPI {
    private octokit: Octokit;
    private owner: string;
    private repo: string;

    private static instance: GitHubAPI;
    private releasesCache: GithubReleases | null = null;
    private treeCache: { [key: string]: any } = {};
    private blobCache: { [key: string]: any } = {};

    static getInstance(owner: string = 'jmcollin78', repo: string = 'versatile_thermostat'): GitHubAPI {
        if (!GitHubAPI.instance) {
            GitHubAPI.instance = new GitHubAPI(owner, repo);
        }
        return GitHubAPI.instance;
    }

    private constructor(owner: string = 'jmcollin78', repo: string = 'versatile_thermostat') {
        this.owner = owner;
        this.repo = repo;
        this.octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN,
            request: {
                timeout: 5000,
                fetch: cachedFetch,
            },
        });
    }

    async getReleases(): Promise<GithubReleases> {
        if (this.releasesCache) {
            return this.releasesCache;
        }
        try {
            const releases = await this.octokit.rest.repos.listReleases({
                owner: this.owner,
                repo: this.repo,
            });
            this.releasesCache = releases.data;
            return releases.data;
        } catch (error) {
            console.error('Error fetching releases:', error);
            throw error;
        }
    }

    async getGitTree(tag: string) {
        if (this.treeCache[tag]) {
            return this.treeCache[tag];
        }
        try {
            const tree = await this.octokit.rest.git.getTree({
                owner: this.owner,
                repo: this.repo,
                tree_sha: tag,
            });
            this.treeCache[tag] = tree.data;
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
                last_item = last_query.tree.find((item: any) => item.path === segment);
                sha = last_item?.sha;
            }

            return last_item;

        } catch (error) {
            console.error('Error fetching git tree path:', error);
            throw error;
        }
    }

    async getGitBlob(sha: string, raw: boolean = false) {
        if (this.blobCache[sha]) {
            return this.blobCache[sha];
        }
        try {
            const blob = await this.octokit.rest.git.getBlob({
                owner: this.owner,
                repo: this.repo,
                file_sha: sha,
                headers: {
                    accept: raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json',
                },
            });
            this.blobCache[sha] = blob.data;
            return blob.data;
        } catch (error) {
            console.error('Error fetching git blob:', error);
            throw error;
        }
    }
}
