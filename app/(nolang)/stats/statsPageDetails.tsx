'use client';

import { useEffect, useState } from "react";
import Chart from "react-apexcharts";

export type ReleaseInfos = {
    tag_name: string,
    downloads: number,
    installs: number
}

const StatsPageDetails: React.FC<{ data: ReleaseInfos[] }> = ({ data }) => {
    const formater = new Intl.NumberFormat('fr', {})
    const [isDark, setDark] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        return document.documentElement.classList.contains('dark') || mq.matches
    });

    const series = [
        {
            name: 'Downloads',
            type: 'line',
            data: data.map(x => ({ x: x.tag_name, y: x.downloads })).reverse()
        },
        {
            name: 'Actives Installs',
            data: data.map(x => ({ x: x.tag_name, y: x.installs })).reverse()
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
                        formatter: (val, opts) => `Verison ${val}`,
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
                {data.map(relinfo =>
                    <tr className="border-t" key={relinfo.tag_name}>
                        <td className="px-4">{relinfo.tag_name}</td>
                        <td className="px-4 text-right">{formater.format(relinfo.downloads)}</td>
                        <td className="px-4 text-right">{formater.format(relinfo.installs)}</td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
}


export default StatsPageDetails;