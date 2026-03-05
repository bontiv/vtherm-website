import type { MetadataRoute } from 'next'
import { languages } from './i18n/settings'

export const dynamic = "force-static";
const allowing = !('APP_ENV' in process.env) || process.env.APP_ENV == 'production'

export default function robots(): MetadataRoute.Robots {
    const rules: MetadataRoute.Robots['rules'] = []

    if (allowing) {
        rules.push({
            userAgent: '*',
            allow: '/',
            disallow: languages.map(lng => `/${lng}/debugger/`)
        })
    } else {
        rules.push({
            userAgent: '*',
            disallow: '/'
        })
    }

    return {
        rules: rules,
        sitemap: allowing ? `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml` : undefined
    }
}