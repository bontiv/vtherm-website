/**
 * Static pages of the "quick-start" and "versus" sections.
 * Sitemap, footer, home page and index pages iterate over these lists.
 */

export type HeatingType = 'trv' | 'pilot-wire' | 'heat-pump' | 'pellet-stove';

export interface QuickStartPage {
    slug: HeatingType;
    /** Root key in the `quickstart` and `home` i18n namespaces */
    key: string;
}

export const QUICKSTART_PAGES: QuickStartPage[] = [
    { slug: 'trv', key: 'trv' },
    { slug: 'pilot-wire', key: 'pilot_wire' },
    { slug: 'heat-pump', key: 'heat_pump' },
    { slug: 'pellet-stove', key: 'pellet_stove' },
];

export interface VersusPage {
    slug: string;
    /** Root key in the `versus` i18n namespace */
    key: string;
    competitor: string;
    competitorUrl: string;
    /** Competitor version(s) the comparison was checked against */
    checkedVersion: string;
}

export const VERSUS_PAGES: VersusPage[] = [
    {
        slug: 'better-thermostat',
        key: 'better_thermostat',
        competitor: 'Better Thermostat',
        competitorUrl: 'https://github.com/KartoffelToby/better_thermostat',
        checkedVersion: '1.9.3 / 2.0.0 Beta 1',
    },
    {
        slug: 'smart-autotune-thermostat',
        key: 'smart_autotune_thermostat',
        competitor: 'Smart Autotune Thermostat',
        competitorUrl: 'https://github.com/Alexwijn/SAT',
        checkedVersion: '4.2.1',
    },
    {
        slug: 'generic-thermostat',
        key: 'generic_thermostat',
        competitor: 'Generic Thermostat',
        competitorUrl: 'https://www.home-assistant.io/integrations/generic_thermostat/',
        checkedVersion: 'Home Assistant 2026.10',
    },
];

export function getQuickStartPage(slug: HeatingType): QuickStartPage {
    return QUICKSTART_PAGES.find(page => page.slug === slug)!;
}

export function getVersusPage(slug: string): VersusPage {
    return VERSUS_PAGES.find(page => page.slug === slug)!;
}
