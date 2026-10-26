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

export type Support = 'yes' | 'partial' | 'no';

export interface VersusPage {
    slug: string;
    /** Root key in the `versus` i18n namespace */
    key: string;
    competitor: string;
    competitorUrl: string;
    /** Competitor version(s) the comparison was checked against */
    checkedVersion: string;
    /** Rows of the comparison table, labelled by `versus.features.<key>` and `versus.<page>.notes.<key>` */
    features: { key: string, vtherm: Support, competitor: Support }[];
    /** Keys of `versus.<page>.strengths` */
    strengths: string[];
    /** Keys of `versus.<page>.when_competitor` */
    whenCompetitor: string[];
}

export const VERSUS_PAGES: VersusPage[] = [
    {
        slug: 'better-thermostat',
        key: 'better_thermostat',
        competitor: 'Better Thermostat',
        competitorUrl: 'https://github.com/KartoffelToby/better_thermostat',
        checkedVersion: '1.9.3 / 2.0.0 Beta 1',
        features: [
            { key: 'switch_devices', vtherm: 'yes', competitor: 'no' },
            { key: 'climate_devices', vtherm: 'yes', competitor: 'yes' },
            { key: 'valve', vtherm: 'yes', competitor: 'yes' },
            { key: 'trv_calibration', vtherm: 'yes', competitor: 'yes' },
            { key: 'learning', vtherm: 'yes', competitor: 'yes' },
            { key: 'outdoor', vtherm: 'yes', competitor: 'yes' },
            { key: 'presence', vtherm: 'yes', competitor: 'no' },
            { key: 'motion', vtherm: 'yes', competitor: 'no' },
            { key: 'window', vtherm: 'yes', competitor: 'yes' },
            { key: 'window_auto', vtherm: 'yes', competitor: 'no' },
            { key: 'power', vtherm: 'yes', competitor: 'no' },
            { key: 'central_boiler', vtherm: 'yes', competitor: 'no' },
            { key: 'central_mode', vtherm: 'yes', competitor: 'no' },
            { key: 'auto_start_stop', vtherm: 'yes', competitor: 'no' },
            { key: 'heat_cool', vtherm: 'yes', competitor: 'partial' },
            { key: 'failure', vtherm: 'yes', competitor: 'no' },
            { key: 'safety', vtherm: 'yes', competitor: 'yes' },
            { key: 'lock', vtherm: 'yes', competitor: 'partial' },
            { key: 'valve_maintenance', vtherm: 'no', competitor: 'yes' },
            { key: 'ui_card', vtherm: 'yes', competitor: 'yes' },
            { key: 'log_analyzer', vtherm: 'yes', competitor: 'no' },
            { key: 'plugins', vtherm: 'yes', competitor: 'no' },
        ],
        strengths: ['all_heating', 'presence', 'power', 'central', 'auto_tpi', 'safety'],
        whenCompetitor: ['trv_only', 'homematic', 'maintenance', 'google'],
    },
    {
        slug: 'smart-autotune-thermostat',
        key: 'smart_autotune_thermostat',
        competitor: 'Smart Autotune Thermostat',
        competitorUrl: 'https://github.com/Alexwijn/SAT',
        checkedVersion: '4.2.1',
        features: [
            { key: 'opentherm', vtherm: 'no', competitor: 'yes' },
            { key: 'switch_devices', vtherm: 'yes', competitor: 'yes' },
            { key: 'climate_devices', vtherm: 'yes', competitor: 'partial' },
            { key: 'valve', vtherm: 'yes', competitor: 'no' },
            { key: 'outdoor', vtherm: 'yes', competitor: 'yes' },
            { key: 'learning', vtherm: 'yes', competitor: 'yes' },
            { key: 'presence', vtherm: 'yes', competitor: 'no' },
            { key: 'motion', vtherm: 'yes', competitor: 'no' },
            { key: 'window', vtherm: 'yes', competitor: 'yes' },
            { key: 'window_auto', vtherm: 'yes', competitor: 'no' },
            { key: 'power', vtherm: 'yes', competitor: 'no' },
            { key: 'central_mode', vtherm: 'yes', competitor: 'partial' },
            { key: 'auto_start_stop', vtherm: 'yes', competitor: 'no' },
            { key: 'heat_cool', vtherm: 'yes', competitor: 'no' },
            { key: 'failure', vtherm: 'yes', competitor: 'no' },
            { key: 'lock', vtherm: 'yes', competitor: 'no' },
            { key: 'ui_card', vtherm: 'yes', competitor: 'no' },
            { key: 'log_analyzer', vtherm: 'yes', competitor: 'no' },
            { key: 'plugins', vtherm: 'yes', competitor: 'no' },
        ],
        strengths: ['per_room', 'all_heating', 'cooling', 'presence', 'power', 'ecosystem'],
        whenCompetitor: ['opentherm', 'dhw', 'complementary'],
    },
    {
        slug: 'generic-thermostat',
        key: 'generic_thermostat',
        competitor: 'Generic Thermostat',
        competitorUrl: 'https://www.home-assistant.io/integrations/generic_thermostat/',
        checkedVersion: 'Home Assistant 2026.10',
        features: [
            { key: 'builtin', vtherm: 'no', competitor: 'yes' },
            { key: 'switch_devices', vtherm: 'yes', competitor: 'yes' },
            { key: 'climate_devices', vtherm: 'yes', competitor: 'no' },
            { key: 'valve', vtherm: 'yes', competitor: 'no' },
            { key: 'multi', vtherm: 'yes', competitor: 'no' },
            { key: 'proportional', vtherm: 'yes', competitor: 'no' },
            { key: 'learning', vtherm: 'yes', competitor: 'no' },
            { key: 'outdoor', vtherm: 'yes', competitor: 'no' },
            { key: 'presets', vtherm: 'yes', competitor: 'yes' },
            { key: 'presence', vtherm: 'yes', competitor: 'no' },
            { key: 'motion', vtherm: 'yes', competitor: 'no' },
            { key: 'window', vtherm: 'yes', competitor: 'no' },
            { key: 'power', vtherm: 'yes', competitor: 'no' },
            { key: 'central_boiler', vtherm: 'yes', competitor: 'no' },
            { key: 'safety', vtherm: 'yes', competitor: 'no' },
            { key: 'heat_cool', vtherm: 'yes', competitor: 'partial' },
            { key: 'ui_card', vtherm: 'yes', competitor: 'no' },
            { key: 'log_analyzer', vtherm: 'yes', competitor: 'no' },
            { key: 'plugins', vtherm: 'yes', competitor: 'no' },
        ],
        strengths: ['tpi', 'devices', 'automation', 'window', 'power', 'safety'],
        whenCompetitor: ['builtin', 'simple', 'low_inertia'],
    },
];

/** Strengths shown on every comparison page, `versus.common.strengths.<key>` */
export const VERSUS_SHARED_STRENGTHS: { key: string, href: string }[] = [
    { key: 'debugger', href: '/debugger/' },
    { key: 'plugins', href: '/plugins/' },
];

export function getQuickStartPage(slug: HeatingType): QuickStartPage {
    return QUICKSTART_PAGES.find(page => page.slug === slug)!;
}

export function getVersusPage(slug: string): VersusPage {
    return VERSUS_PAGES.find(page => page.slug === slug)!;
}
