import type { Metadata } from 'next';
import { GitHubAPI, getRepoLatestReleaseDownloads, getRepoStars } from "@/lib/github";
import StatsPageDetails from "./statsPageDetails";
import type { PluginStat } from "./statsPageDetails";
import { SWRConfig } from 'swr';
import plugins from '@/pluginsdb/plugins.json';
import type { VTPlugin } from '@/lib/plugindb';

type HAAnalyticsEntry = { total?: number; versions?: Record<string, number> };

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
    const addons_analytics: Record<string, HAAnalyticsEntry> = await (await fetch('https://analytics.home-assistant.io/addons.json', { next: { revalidate: 3600 } })).json()

    const custom_integrations: Record<string, HAAnalyticsEntry> = ha_analytics
    const vthermTotal = custom_integrations['versatile_thermostat']?.total ?? 0

    const pluginStats: PluginStat[] = await Promise.all(
        (plugins as VTPlugin[])
            .filter((plugin): plugin is VTPlugin & { type: 'integration' | 'addon' } => plugin.type === 'integration' || plugin.type === 'addon')
            .map(async (plugin) => {
                const repoName = plugin.slug?.split('/')[1] ?? ''
                let actives = 0
                if (plugin.type === 'integration') {
                    actives = custom_integrations[plugin.ha_domain ?? repoName]?.total ?? 0
                } else {
                    const suffix = `_${repoName}`
                    actives = Object.entries(addons_analytics)
                        .filter(([key]) => key.endsWith(suffix))
                        .reduce((max, [, entry]) => Math.max(max, entry.total ?? 0), 0)
                }
                const downloads = plugin.slug ? await getRepoLatestReleaseDownloads(plugin.slug) : 0
                const stars = plugin.slug ? (await getRepoStars(plugin.slug)) ?? 0 : 0
                return {
                    name: plugin.name,
                    type: plugin.type,
                    stars,
                    downloads,
                    actives,
                    percent: vthermTotal > 0 ? actives / vthermTotal : 0,
                }
            })
    )
    pluginStats.sort((a, b) => b.actives - a.actives)

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
        <main className='min-h-dvh'><StatsPageDetails pluginStats={pluginStats} vthermTotal={vthermTotal} /></main>
    </SWRConfig>
}

export default StatsPage;
