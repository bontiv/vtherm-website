import { GitHubAPI } from "@/lib/github";
import StatsPageDetails, { ReleaseInfos } from "./statsPageDetails";

const StatsPage: React.FC = async () => {
    const githubapi = GitHubAPI.getInstance()

    const releases = (await githubapi.getReleases()).filter(x => x.prerelease == false)

    const data: ReleaseInfos[] = []

    for (const release of releases) {
        const assets = await githubapi.getAssets(release.id);
        console.log(assets);
        data.push({
            tag_name: release.tag_name,
            downloads: assets && assets.length > 0 ? assets[0].download_count : 0
        })
    }

    return <StatsPageDetails data={data} />
}

export default StatsPage;
