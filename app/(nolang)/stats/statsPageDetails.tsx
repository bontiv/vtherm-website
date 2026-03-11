'use client';

import { group } from "console";
import Chart from "react-apexcharts";

export type ReleaseInfos = {
    tag_name: string,
    downloads: number,
    installs: number
}

const StatsPageDetails: React.FC<{ data: ReleaseInfos[] }> = ({ data }) => {
    const formater = new Intl.NumberFormat('fr', {})

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

    return <main className="container mx-auto">
        <h1>Statistiques Versatile Thermostat</h1>
        <Chart
            series={series}
            type="bar"
            height={400}
            options={{
                chart: {
                    id: 'mainchart',
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
                yaxis: [
                    {
                        seriesName: 'Downloads',
                        labels: {
                            style: {
                                colors: 'blue'
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
                    <tr className="border-t-1">
                        <td className="px-4">{relinfo.tag_name}</td>
                        <td className="px-4 text-right">{formater.format(relinfo.downloads)}</td>
                        <td className="px-4 text-right">{formater.format(relinfo.installs)}</td>
                    </tr>
                )}
            </tbody>
        </table>
    </main>
}


export default StatsPageDetails;