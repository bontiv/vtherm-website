import type { Metadata } from 'next';
import { GitHubAPI } from "@/lib/github";
import StatsPageDetails from "./statsPageDetails";
import { SWRConfig } from 'swr';

export const metadata: Metadata = {
    robots: {
        index: false,
    },
    title: "Statistiques Versatile Thermostat"
};

const StatsPage: React.FC = async () => {
    const githubapi = GitHubAPI.getInstance()

    const releases = (await githubapi.getReleases()).filter(x => x.prerelease == false)
    const ha_analytics = await (await (await fetch('https://analytics.home-assistant.io/custom_integrations.json')).json())

    const downloads_by_version: Record<string, number> = {}
    for (const release of releases) {
        const assets = await githubapi.getAssets(release.id)
        if (assets && assets.length > 0)
            downloads_by_version[release.tag_name] = assets[0]?.download_count || 0
    }

    // console.log('SS Github assets:', downloads_by_version)

    return <SWRConfig
        value={{
            fallback: {
                '/stats/ha_stats.json': ha_analytics.versatile_thermostat.versions,
                'https://api.github.com/repos/jmcollin78/versatile_thermostat/releases': releases,
                'github/assets': downloads_by_version,
            },
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }}
    >
        <main className='min-h-dvh'><StatsPageDetails /></main>
    </SWRConfig>
}

export default StatsPage;
