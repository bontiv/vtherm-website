'use client';

export type ReleaseInfos = {
    tag_name: string,
    downloads: number,
}

const StatsPageDetails: React.FC<{ data: ReleaseInfos[] }> = ({ data }) => {
    const formater = new Intl.NumberFormat('fr', {})
    return <main className="container mx-auto">
        <h1>Statistiques Versatile Thermostat</h1>
        <table border={1} className="border">
            <thead>
                <tr>
                    <th className="px-4">Version</th>
                    <th className="px-4">Téléchargements</th>
                </tr>
            </thead>
            <tbody>
                {data.map(relinfo =>
                    <tr className="border-t-1">
                        <td className="px-4">{relinfo.tag_name}</td>
                        <td className="px-4 text-right">{formater.format(relinfo.downloads)}</td>
                    </tr>
                )}
            </tbody>
        </table>
    </main>
}


export default StatsPageDetails;