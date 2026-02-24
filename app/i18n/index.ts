import i18next from './i18next'
import { fallbackLng } from './settings'

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