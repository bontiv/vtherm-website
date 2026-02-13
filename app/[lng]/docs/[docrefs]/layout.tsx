import { GitHubAPI } from '@/lib/github';

export async function generateStaticParams() {
    const githubApi = new GitHubAPI();
    const releases = await githubApi.getReleases().then(data => data.filter(x => !x.prerelease).map((release: any) => ({ docrefs: release.tag_name })));
    return releases.slice(0, 3);
}

export default async function Layout({ children }: { children: React.ReactNode }) {
    return children
}
