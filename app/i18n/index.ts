import { Metadata } from 'next'
import i18next from './i18next'
import { fallbackLng, languages } from './settings'

export async function getT(ns: string, options: { keyPrefix?: string, lng?: string } = {}) {
    const lng = options.lng || i18next.resolvedLanguage || fallbackLng

    if (lng && i18next.resolvedLanguage !== lng) {
        await i18next.changeLanguage(lng)
    }

    if (ns && !i18next.hasLoadedNamespace(ns)) {
        await i18next.loadNamespaces(ns)
    }


    return {
        t: i18next.getFixedT(
            lng,
            Array.isArray(ns) ? ns[0] : ns,
            options?.keyPrefix
        ),
        i18n: i18next
    }
}

export function getAlternatesMetadata(path: string, lng?: string, params: {
    canonical?: string,
    x_default?: string,
} = {}): Metadata['alternates'] {
    const lang_pages = Object.fromEntries(languages.map(lng => [lng, `${process.env.NEXT_PUBLIC_SITE_URL}/${lng}${path}`]))

    return {
        canonical: params.canonical ?? `${process.env.NEXT_PUBLIC_SITE_URL}/${lng ?? fallbackLng}${path}`,
        languages: {
            ...lang_pages,
            'x-default': params.x_default ?? `${process.env.NEXT_PUBLIC_SITE_URL}/${fallbackLng}${path}`
        }
    }
}

type AsyncMetadata = ({ params }: { params: Promise<{ lng: string }> }) => Promise<Metadata>;
export function generateMetadataBuilder(path: string): AsyncMetadata {
    return async ({ params }) => {
        const { lng } = await params
        const alternates = getAlternatesMetadata(path, lng);
        return { alternates }
    }
}