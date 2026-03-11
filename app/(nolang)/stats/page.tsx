import type { Metadata } from 'next';
import { GitHubAPI } from "@/lib/github";
import StatsPageDetails, { ReleaseInfos } from "./statsPageDetails";

export const metadata: Metadata = {
    robots: {
        index: false,
    },
    title: "Statistiques Versatile Thermostat"
};

const StatsPage: React.FC = async () => {
    const githubapi = GitHubAPI.getInstance()

    const releases = (await githubapi.getReleases()).filter(x => x.prerelease == false)
    const ha_analytics = await (await fetch('https://analytics.home-assistant.io/custom_integrations.json')).json()
    const veratile_count = ha_analytics.versatile_thermostat.versions

    const data: ReleaseInfos[] = []

    for (const release of releases) {
        const assets = await githubapi.getAssets(release.id);
        data.push({
            tag_name: release.tag_name,
            downloads: assets && assets.length > 0 ? assets[0].download_count : 0,
            installs: veratile_count[release.tag_name] ?? 0
        })
    }

    return <StatsPageDetails data={data} />
}

export default StatsPage;
