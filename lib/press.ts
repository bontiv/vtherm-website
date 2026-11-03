/**
 * Articles, videos and podcasts about Versatile Thermostat, shown on the home page.
 * Titles and sources are kept in their original language.
 * Only content where Versatile Thermostat is the main subject, at most 6 per language.
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
        title: 'Home Assistant & Versatile thermostat',
        source: 'My Canaletto',
        logo: '/press/canaletto.jpg',
        url: 'https://www.canaletto.fr/home-assistant-and-versatile-thermostat/',
        date: '2024-01-02',
    },
    // English
    {
        type: 'article',
        lang: 'en',
        title: 'Versatile Thermostat vs Better Thermostat: 10 Days of Data Changed My Mind',
        source: 'PRO IT Rocks',
        logo: '/press/pro-it-rocks.png',
        url: 'https://pro-it.rocks/versatile-thermostat-vs-better-thermostat-10-days-of-data-changed-my-mind/',
        date: '2026-01-11',
    },
    // German
    {
        type: 'article',
        lang: 'de',
        title: 'Versatile Thermostat in Home Assistant: Heizung per TPI regeln',
        source: 'Technikheim',
        logo: '/press/technikheim.svg',
        url: 'https://technikheim.de/artikel/versatile-thermostat-home-assistant-heizkoerper-regeln/',
        date: '2026-10-19',
    },
];

/** References in the given language, most recent first */
export function getPressReferences(lang: string): PressReference[] {
    return PRESS_REFERENCES
        .filter(reference => reference.lang === lang)
        .sort((a, b) => b.date.localeCompare(a.date));
}
