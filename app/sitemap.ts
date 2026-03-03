import type { MetadataRoute } from 'next'
import { languages } from './i18n/settings'
import devicesDB from '@/devicesdb/devices.json'
import { GitHubAPI } from '@/lib/github';

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const sitemap: MetadataRoute.Sitemap = []
    const github = GitHubAPI.getInstance()

    for (const lng of languages) {
        sitemap.push({
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/${lng}/`,
            changeFrequency: 'monthly',
            priority: 1,
        })

        for (const device of devicesDB.map(x => x.slug).filter((x, i, a) => a.indexOf(x) === i)) {
            sitemap.push({
                url: `${process.env.NEXT_PUBLIC_SITE_URL}/${lng}/devices/${device}/`,
                priority: 0.7,
            })
        }

        const page_lng_tree = await github.getGitTreePath(`main/documentation/${lng}`);
        if (!page_lng_tree)
            continue;

        const pages_docs = await github.getGitTree(page_lng_tree.sha)

        for (const page_meta of pages_docs.tree.filter(x => x.path.endsWith('.md'))) {
            const last_commit = await github.getFileCommit(`/documentation/${lng}/${page_meta.path}`)

            sitemap.push({
                url: `${process.env.NEXT_PUBLIC_SITE_URL}/${lng}/docs/${page_meta.path.slice(0, -3)}/`,
                priority: 0.6,
                changeFrequency: 'weekly',
                lastModified: last_commit[0].commit.author?.date
            })
        }
    }

    return sitemap
}