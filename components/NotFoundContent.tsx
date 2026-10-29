'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { ArrowRightIcon, BookOpenIcon, CpuChipIcon, PresentationChartLineIcon, PuzzlePieceIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import i18n from '@/app/i18n/i18next';
import { fallbackLng, languages } from '@/app/i18n/settings';
import { Button } from '@/components/ui/Button';
import logo from '@/public/logo-nav.webp';
import en from '@/public/locales/en/notfound.json';
import fr from '@/public/locales/fr/notfound.json';
import de from '@/public/locales/de/notfound.json';
import "flag-icons/css/flag-icons.min.css";

// Plain <a> links: the exported 404.html is served under any URL and the Next router can't soft-navigate from it
// Translations are bundled: the 404 page lives outside /[lng] and is rendered for any unknown URL
const TRANSLATIONS: Record<string, typeof en> = { en, fr, de };

const FLAGS: Record<string, string> = { en: 'us', fr: 'fr', de: 'de' };

type Icon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

/** Quick links (`notfound.links.<key>`) */
const LINKS: { key: 'quickstart' | 'devices' | 'plugins' | 'debugger', icon: Icon, href: string }[] = [
    { key: 'quickstart', icon: RocketLaunchIcon, href: '/quick-start/' },
    { key: 'devices', icon: CpuChipIcon, href: '/devices/' },
    { key: 'plugins', icon: PuzzlePieceIcon, href: '/plugins/' },
    { key: 'debugger', icon: PresentationChartLineIcon, href: '/debugger/' },
];

/** Language from the requested URL (`/fr/...`), else the detected browser language */
function detectLanguage(): string {
    const segment = window.location.pathname.split('/')[1];
    if (languages.includes(segment)) return segment;
    const detected = i18n.resolvedLanguage;
    if (detected && languages.includes(detected)) return detected;
    return fallbackLng;
}

const subscribeNothing = () => () => { };

export const NotFoundContent: React.FC = () => {
    // The static HTML is rendered with the fallback language, the client then switches to the detected one
    const detected = useSyncExternalStore(subscribeNothing, detectLanguage, () => fallbackLng);
    const [chosen, setLng] = useState<string>();
    const lng = chosen ?? detected;

    useEffect(() => {
        document.documentElement.lang = lng;
    }, [lng]);

    const t = TRANSLATIONS[lng] ?? en;

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-linear-to-b from-blue-50 to-white dark:from-sky-950 dark:to-[#0d1117]">
            <div className="w-full max-w-4xl space-y-12">
                <section className="text-center space-y-6">
                    <a href={`/${lng}/`} className="inline-block">
                        <Image loading="eager" src={logo} alt="Versatile Thermostat" width={160} height={160} className="mx-auto w-32 h-auto" />
                    </a>
                    <p className="text-8xl md:text-9xl font-light leading-none bg-linear-to-r from-vtherm-tertiary to-vtherm-secondary bg-clip-text text-transparent select-none" aria-hidden="true">
                        404
                    </p>
                    <h1 className="text-3xl md:text-4xl font-light text-vtherm-dark dark:text-vtherm-light">{t.title}</h1>
                    <p className="text-lg md:text-xl leading-relaxed text-[#52525b] dark:text-[#a1a1aa] max-w-2xl mx-auto">{t.desc}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
                        <a href={`/${lng}/`}>
                            <Button size="lg">{t.home}</Button>
                        </a>
                        <a href={`/${lng}/docs/presentation/`}>
                            <Button variant="secondary" size="lg">
                                <BookOpenIcon className="w-5 h-5 mr-2" />
                                {t.docs}
                            </Button>
                        </a>
                    </div>
                </section>

                <section className="space-y-6 rounded-2xl p-6 md:p-10 bg-blue-50 dark:bg-sky-950/60 border border-blue-200 dark:border-vtherm-tertiary/60">
                    <h2 className="text-center text-2xl font-normal">{t.explore}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {LINKS.map(link => <a
                            key={link.key}
                            href={`/${lng}${link.href}`}
                            className="group flex flex-col items-center text-center gap-3 p-6 rounded-xl bg-white dark:bg-vtherm-dark/60 border border-blue-200 dark:border-vtherm-tertiary/60 hover:border-vtherm-secondary/60 hover:shadow-lg transition-all duration-300"
                        >
                            <link.icon className="w-10 h-10 text-vtherm-secondary group-hover:scale-110 transition-transform" />
                            <span className="text-lg font-medium text-vtherm-primary dark:text-vtherm-light">{t.links[link.key]}</span>
                            <span className="text-sm leading-relaxed dark:text-vtherm-light/70">{t.links[`${link.key}-desc`]}</span>
                            <ArrowRightIcon className="w-5 h-5 mt-auto text-vtherm-primary dark:text-vtherm-light group-hover:translate-x-1 transition-transform" />
                        </a>)}
                    </div>
                </section>

                <nav aria-label="Languages" className="flex justify-center gap-4">
                    {languages.map(l => <button
                        key={l}
                        type="button"
                        onClick={() => setLng(l)}
                        lang={l}
                        aria-pressed={l === lng}
                        className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${l === lng
                            ? 'border-vtherm-tertiary bg-white dark:bg-vtherm-primary/60 dark:border-vtherm-secondary'
                            : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                        <span className={`fi fi-${FLAGS[l]}`} aria-hidden="true"></span>
                        <span className="sr-only">{l}</span>
                    </button>)}
                </nav>
            </div>
        </main>
    );
};
