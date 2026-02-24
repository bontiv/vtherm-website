import { GitHubAPI } from '@/lib/github';
import DocVersionLink from './DocVersionLink';

async function getReleases() {
    const githubApi = GitHubAPI.getInstance();
    const releases = await githubApi.getReleases().then(data => data.filter(x => !x.prerelease));
    return releases.slice(0, 3);
}

export async function generateStaticParams() {
    const releases = await getReleases()
    return releases.map((release) => ({ docrefs: release.tag_name }))
}

export default async function Layout({ children, params }: { children: React.ReactNode, params: Promise<{ docrefs: string }> }) {
    const releases = await getReleases();
    const { docrefs } = await params;

    return <div className=''>
        <div className='bg-slate-200 w-full rounded-xs px-4 py-2 mb-5'>
            <span className='underline'>Version :</span>
            <ul className='inline-block'>
                {releases.map((x, i) =>
                    <li key={i} className={'inline ml-3 transition-all duration-300 ' + (docrefs == x.tag_name ? 'font-semibold text-blue-700' : 'hover:text-blue-500 hover:underline')}>
                        {
                            docrefs == x.tag_name ? x.tag_name :
                                <DocVersionLink toVersion={x.tag_name}>{x.tag_name}</DocVersionLink>
                        }
                    </li>
                )}
            </ul>
        </div>
        {children}
    </div>
}
