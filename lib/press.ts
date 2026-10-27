/**
 * Articles, videos and podcasts about Versatile Thermostat, shown on the home page.
 * Titles and sources are kept in their original language.
 * Keep at most 6 references per language: the most relevant and positive ones.
 */

export type PressType = 'video' | 'article' | 'podcast';

export interface PressReference {
    type: PressType;
    /** Language of the content (not of the page) */
    lang: string;
    title: string;
    /** YouTube channel or website name */
    source: string;
    /** Square logo of the source, in `public/press/` */
    logo: string;
    url: string;
    /** Publication date, ISO format */
    date: string;
}

export const PRESS_REFERENCES: PressReference[] = [
    // French
    {
        type: 'video',
        lang: 'fr',
        title: 'Tuto complet, chauffage intelligent par pièce avec Home Assistant + Blueprint',
        source: 'Domotique pour tous',
        logo: '/press/domotique-pour-tous.jpg',
        url: 'https://www.youtube.com/watch?v=YTo5_KFHlFg',
        date: '2026-03-26',
    },
    {
        type: 'video',
        lang: 'fr',
        title: 'Vieille chaudière + Home Assistant = chauffage connecté',
        source: 'Makernix',
        logo: '/press/makernix.jpg',
        url: 'https://www.youtube.com/watch?v=HphhDi5ZIZE',
        date: '2025-11-30',
    },
    {
        type: 'video',
        lang: 'fr',
        title: 'Home Assistant : automatise ton chauffage avec agenda et gestion intelligente',
        source: 'DomotiK',
        logo: '/press/domotik.jpg',
        url: 'https://www.youtube.com/watch?v=SYiBOJPi3tE',
        date: '2025-11-28',
    },
    {
        type: 'article',
        lang: 'fr',
        title: 'Sonoff TRVZB et Versatile Thermostat : le combo gagnant',
        source: 'HACF',
        logo: '/press/hacf.jpg',
        url: 'https://www.hacf.fr/tete-thermo-sonoff-trvzb/',
        date: '2025-03-14',
    },
    {
        type: 'article',
        lang: 'fr',
        title: 'Baissez vos factures de chauffage avec Versatile Thermostat',
        source: 'HACF',
        logo: '/press/hacf.jpg',
        url: 'https://www.hacf.fr/optimisation-versatile-thermostat/',
        date: '2024-09-29',
    },
    {
        type: 'article',
        lang: 'fr',
        title: 'Test du module Nodon fil pilote SIN-4-FP-21 : contrôle du radiateur électrique en ZigBee',
        source: 'Maison et Domotique',
        logo: '/press/maison-et-domotique.png',
        url: 'https://www.maison-et-domotique.com/146502-test-module-nodon-fil-pilote-sin-4-fp-21/',
        date: '2024-04-09',
    },
    // English
    {
        type: 'article',
        lang: 'en',
        title: 'Save on heating in 2026: smart TRVs',
        source: 'HomeBrainz',
        logo: '/press/homebrainz.png',
        url: 'https://www.homebrainz.shop/en/a/save-on-heating-2026-smart-radiator-valves',
        date: '2026-10-10',
    },
    {
        type: 'article',
        lang: 'en',
        title: 'Home Assistant heating control: UK guide 2026',
        source: 'Smart Home Assistant',
        logo: '/press/smarthomeassistant-uk.png',
        url: 'https://smarthomeassistant.co.uk/articles/smart-heating/home-assistant-heating-control-uk',
        date: '2026-06-19',
    },
    {
        type: 'podcast',
        lang: 'en',
        title: 'Artem’s Energy‑Smart Automations Without the Chaos',
        source: 'Home Assistant Podcast',
        logo: '/press/ha-podcast.jpg',
        url: 'https://www.youtube.com/watch?v=krxBE-4MIFY',
        date: '2026-01-13',
    },
    {
        type: 'article',
        lang: 'en',
        title: 'Versatile Thermostat vs Better Thermostat: 10 Days of Data Changed My Mind',
        source: 'PRO IT Rocks',
        logo: '/press/pro-it-rocks.png',
        url: 'https://pro-it.rocks/versatile-thermostat-vs-better-thermostat-10-days-of-data-changed-my-mind/',
        date: '2026-01-11',
    },
    {
        type: 'article',
        lang: 'en',
        title: 'Another Year, Another Thermostat',
        source: "Scargill's Tech Blog",
        logo: '/press/scargill.jpg',
        url: 'https://tech.scargill.net/another-year-another-thermostat/',
        date: '2025-12-24',
    },
    // German
    {
        type: 'article',
        lang: 'de',
        title: 'Acht Thermostat Cards für Home Assistant im Überblick',
        source: 'smarthome-assistant.info',
        logo: '/press/smarthome-assistant-info.jpg',
        url: 'https://smarthome-assistant.info/acht-thermostat-cards-fuer-home-assistant-im-ueberblick/',
        date: '2026-10-13',
    },
    {
        type: 'article',
        lang: 'de',
        title: 'Heizkosten sparen 2026: smarte Heizkörperthermostate mit Home Assistant',
        source: 'HomeBrainz',
        logo: '/press/homebrainz.png',
        url: 'https://www.homebrainz.de/a/heizkosten-sparen-2026-smarte-heizkoerperthermostate',
        date: '2026-10-10',
    },
];

/** References in the given language, most recent first */
export function getPressReferences(lang: string): PressReference[] {
    return PRESS_REFERENCES
        .filter(reference => reference.lang === lang)
        .sort((a, b) => b.date.localeCompare(a.date));
}
