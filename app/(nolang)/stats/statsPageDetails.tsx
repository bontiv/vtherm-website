'use client';

import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import useSWR from 'swr';

export type ReleaseInfos = {
    tag_name: string,
    assets_url: string,
    prerelease: boolean,
}

export type PluginStat = {
    name: string,
    type: 'integration' | 'addon',
    analyticsKey?: string,
    stars: number,
    downloads: number,
    actives: number,
    percent: number,
}

type HAStatsJson = Record<string, { total?: number; versions?: Record<string, number> }>

const StatsPageDetails: React.FC<{ pluginStats: PluginStat[], vthermTotal: number }> = ({ pluginStats, vthermTotal }) => {
    const formater = new Intl.NumberFormat('fr', {})
    const percentFormater = new Intl.NumberFormat('fr', { style: 'percent', maximumFractionDigits: 1 })

    const [isDark, setDark] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        return document.documentElement.classList.contains('dark') || mq.matches
    })

    const releases = useSWR('https://api.github.com/repos/jmcollin78/versatile_thermostat/releases', {
        fetcher: (url) => fetch(url).then(res => res.json()).then(releases => releases.filter((x: ReleaseInfos) => x.prerelease == false)),
    })

    const ha_stats = useSWR('/stats/ha_stats.json', {
        fetcher: async (url): Promise<HAStatsJson> => {
            const res = await fetch(url)
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            return res.json()
        },
    })

    const ha_analytics_versions = ha_stats.data?.versatile_thermostat?.versions ?? {}
    const live_vtherm_total = ha_stats.data?.versatile_thermostat?.total ?? vthermTotal
    const live_plugin_stats = pluginStats.map((plugin) => {
        const actives = plugin.analyticsKey != null
            ? ha_stats.data?.[plugin.analyticsKey]?.total ?? plugin.actives
            : plugin.actives
        return {
            ...plugin,
            actives,
            percent: live_vtherm_total > 0 ? actives / live_vtherm_total : 0,
        }
    }).sort((a, b) => b.actives - a.actives)

    const github_assets = useSWR('github/assets', {
        fetcher: async () => {
            const downloads_by_version: Record<string, number> = {}
            for (const release of releases.data) {
                try {
                    const assets = await (await fetch(release.assets_url)).json()
                    if (assets && assets.length > 0) {
                        downloads_by_version[release.tag_name] = assets[0]?.download_count || 0
                    } else {
                        throw new Error(`No assets found for release ${release.tag_name}`)
                    }
                } catch (error) {
                    console.error(`Error fetching assets for release ${release.tag_name}:`, error)
                    throw error
                }
            }
            return downloads_by_version
        }
    })

    const series = [
        {
            name: 'Downloads',
            type: 'line',
            data: releases.data.map((release: ReleaseInfos) => ({
                x: release.tag_name,
                y: github_assets.data[release.tag_name] || 0
            })).reverse()
        },
        {
            name: 'Actives Installs',
            data: releases.data.map((release: ReleaseInfos) => ({
                x: release.tag_name,
                y: ha_analytics_versions[release.tag_name] || 0
            })).reverse()
        }
    ]

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = (e: MediaQueryListEvent) => setDark(e.matches)
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, []);

    return <div className="container mx-auto">
        <h1>Statistiques Versatile Thermostat</h1>
        {ha_stats.error && (
            <p className="text-red-600">Impossible de charger les dernières statistiques ; valeurs issues du dernier build affichées.</p>
        )}
        <Chart
            series={series}
            type="bar"
            height={400}
            options={{
                chart: {
                    id: 'mainchart',
                },
                theme: {
                    mode: isDark ? 'dark' : 'light',
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                    }
                },
                stroke: {
                    width: 1,
                    curve: 'smooth'
                },
                dataLabels: {
                    enabled: true,
                    background: {
                        enabled: true,
                        borderRadius: 5,
                    },
                    style: {
                        colors: [isDark ? 'darkskyblue' : 'darkblue', 'green'],
                    }
                },
                tooltip: {
                    enabled: true,
                    shared: true,
                    intersect: false,
                    x: {
                        formatter: (val) => `Version ${val}`,
                    }
                },
                yaxis: [
                    {
                        seriesName: 'Downloads',
                        labels: {
                            style: {
                                colors: 'lightblue'
                            }
                        }
                    },
                    {
                        seriesName: 'Actives Installs',
                        opposite: true,
                        labels: {
                            style: {
                                colors: 'green'
                            }
                        }
                    }
                ]
            }}
        />
        <table border={1} className="border">
            <thead>
                <tr>
                    <th className="px-4">Version</th>
                    <th className="px-4">Téléchargements</th>
                    <th className="px-4">Actives</th>
                </tr>
            </thead>
            <tbody>
                {releases.data.map((relinfo: ReleaseInfos) =>
                    <tr className="border-t" key={relinfo.tag_name}>
                        <td className="px-4">{relinfo.tag_name}</td>
                        <td className="px-4 text-right">{formater.format(github_assets.data[relinfo.tag_name] || 0)}</td>
                        <td className="px-4 text-right">{formater.format(ha_analytics_versions[relinfo.tag_name] || 0)}</td>
                    </tr>
                )}
            </tbody>
            <tfoot>
                <tr className="border-t font-bold">
                    <td className="px-4">Total</td>
                    <td className="px-4 text-right">{formater.format((Object.values(github_assets.data) as number[]).reduce((a, b) => a + b, 0))}</td>
                    <td className="px-4 text-right">{formater.format((Object.values(ha_analytics_versions) as number[]).reduce((a, b) => a + b, 0))}</td>
                </tr>
            </tfoot>
        </table>
        <h2>Statistiques des plugins</h2>
        <table border={1} className="border">
            <thead>
                <tr>
                    <th className="px-4">Plugin</th>
                    <th className="px-4">Type</th>
                    <th className="px-4">Étoiles</th>
                    <th className="px-4">Nb. Téléchargements</th>
                    <th className="px-4">Nb. Actifs</th>
                    <th className="px-4">Pourcentage</th>
                </tr>
            </thead>
            <tbody>
                {live_plugin_stats.map((plugin) =>
                    <tr className="border-t" key={plugin.name}>
                        <td className="px-4">{plugin.name}</td>
                        <td className="px-4">{plugin.type === 'integration' ? 'Intégration' : 'Add-on'}</td>
                        <td className="px-4 text-right">{formater.format(plugin.stars)}</td>
                        <td className="px-4 text-right">{formater.format(plugin.downloads)}</td>
                        <td className="px-4 text-right">{formater.format(plugin.actives)}</td>
                        <td className="px-4 text-right">{percentFormater.format(plugin.percent)}</td>
                    </tr>
                )}
            </tbody>
        </table>
        <Chart
            series={[
                {
                    name: 'Installations actives',
                    data: live_plugin_stats.map((plugin) => plugin.actives),
                },
                {
                    name: 'Reste',
                    data: live_plugin_stats.map((plugin) => Math.max(live_vtherm_total - plugin.actives, 0)),
                },
            ]}
            type="bar"
            height={400}
            options={{
                chart: {
                    id: 'pluginschart',
                    stacked: true,
                    stackType: '100%',
                },
                theme: {
                    mode: isDark ? 'dark' : 'light',
                },
                plotOptions: {
                    bar: {
                        horizontal: true,
                    }
                },
                colors: ['#059669', '#9CA3AF'],
                xaxis: {
                    categories: live_plugin_stats.map((plugin) => plugin.name),
                    max: 100,
                    labels: {
                        formatter: (val) => `${val} %`,
                    },
                },
                dataLabels: {
                    enabled: true,
                    formatter: (val, { seriesIndex }) => seriesIndex === 0 ? `${Number(val).toFixed(1).replace('.', ',')} %` : '',
                    style: {
                        fontSize: '13px',
                        fontWeight: 700,
                        // With background enabled, ApexCharts uses style.colors as the badge fill and background.foreColor as the text color
                        colors: ['#1F2937'],
                    },
                    background: {
                        enabled: true,
                        foreColor: '#FFFFFF',
                        borderColor: '#1F2937',
                        borderRadius: 5,
                        opacity: 0.9,
                        dropShadow: { enabled: false },
                    },
                    dropShadow: { enabled: false },
                },
                tooltip: {
                    y: {
                        formatter: (val, { seriesIndex, dataPointIndex }) => {
                            const percent = seriesIndex === 0 ? live_plugin_stats[dataPointIndex].percent : 1 - live_plugin_stats[dataPointIndex].percent
                            return seriesIndex === 0
                                ? `${formater.format(val)} actifs / ${formater.format(live_vtherm_total)} VTherm (${percentFormater.format(percent)})`
                                : `${formater.format(val)} (${percentFormater.format(percent)})`
                        },
                    },
                },
                legend: {
                    position: 'top',
                },
            }}
        />
    </div>
}


export default StatsPageDetails;