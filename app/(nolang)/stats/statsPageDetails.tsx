'use client';

import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import useSWR from 'swr';

export type ReleaseInfos = {
    tag_name: string,
    assets_url: string,
    prerelease: boolean,
}

const StatsPageDetails: React.FC = () => {
    const formater = new Intl.NumberFormat('fr', {})

    const [isDark, setDark] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        return document.documentElement.classList.contains('dark') || mq.matches
    })

    const releases = useSWR('https://api.github.com/repos/jmcollin78/versatile_thermostat/releases', {
        fetcher: (url) => fetch(url).then(res => res.json()).then(releases => releases.filter((x: ReleaseInfos) => x.prerelease == false)),
    })

    const ha_analytics = useSWR('/stats/ha_stats.json', {
        fetcher: (url) => fetch(url).then(res => res.json()).then(json => json.ha_analytics.versatile_thermostat.versions),
    })

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
                y: ha_analytics.data[release.tag_name] || 0
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
                        <td className="px-4 text-right">{formater.format(ha_analytics.data[relinfo.tag_name] || 0)}</td>
                    </tr>
                )}
            </tbody>
            <tfoot>
                <tr className="border-t font-bold">
                    <td className="px-4">Total</td>
                    <td className="px-4 text-right">{formater.format((Object.values(github_assets.data) as number[]).reduce((a, b) => a + b, 0))}</td>
                    <td className="px-4 text-right">{formater.format((Object.values(ha_analytics.data) as number[]).reduce((a, b) => a + b, 0))}</td>
                </tr>
            </tfoot>
        </table>
    </div>
}


export default StatsPageDetails;