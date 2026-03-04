import type { MetadataRoute } from 'next'
import { fallbackLng, languages } from './i18n/settings'
import devicesDB from '@/devicesdb/devices.json'
import { GitHubAPI } from '@/lib/github';

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const sitemap: MetadataRoute.Sitemap = []
    const github = GitHubAPI.getInstance()

    function addPage(path: string, opts: {
        priority?: number,
        changeFrequency?: "monthly",
        lastModified?: Date | string
    } = {}) {
        sitemap.push({
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/${fallbackLng}${path}`,
            changeFrequency: opts.changeFrequency ?? 'monthly',
            priority: opts.priority ?? 0.7,
            lastModified: opts.lastModified,
            alternates: {
                languages: Object.fromEntries(languages.map(lng => [lng, `${process.env.NEXT_PUBLIC_SITE_URL}/${lng}${path}`]))
            }
        })
    }

    addPage('/', { priority: 1 });
    addPage('/devices/', { priority: 0.8 });


    for (const device of devicesDB.map(x => x.slug).filter((x, i, a) => a.indexOf(x) === i)) {
        addPage(`/devices/${device}/`);
    }


    const page_lng_tree = await github.getGitTreePath(`main/documentation/en`);
    if (page_lng_tree) {
        const pages_docs = await github.getGitTree(page_lng_tree.sha)

        for (const page_meta of pages_docs.tree.filter(x => x.path.endsWith('.md'))) {
            const last_commit = await github.getFileCommit(`/documentation/en/${page_meta.path}`)
            addPage(`/docs/${page_meta.path.slice(0, -3)}/`, {
                priority: 0.6,
                lastModified: last_commit[0].commit.author?.date
            })
        }
    }

    return sitemap
}