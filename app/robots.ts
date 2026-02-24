import type { MetadataRoute } from 'next'
import { languages } from './i18n/settings'

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
    const rules: MetadataRoute.Robots['rules'] = []

    rules.push({
        userAgent: '*',
        allow: '/',
        disallow: languages.map(lng => `/${lng}/debugger/`)
    })

    return {
        rules: rules,
        sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`
    }
}