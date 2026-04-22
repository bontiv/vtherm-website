'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { CodeBracketIcon, ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { useT } from '@/app/i18n/client';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import "flag-icons/css/flag-icons.min.css";

// Chargement dynamique pour éviter les erreurs SSR
const PagefindSearch = dynamic(
    () => import('@/components/search/PagefindSearch').then(mod => ({ default: mod.PagefindSearch })),
    {
        ssr: false,
        loading: () => <div className="h-10 animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-full max-w-md" />
    }
);

const LANGUAGES = [
    { value: 'en', label: <span className="fi fi-gb"></span> },
    { value: 'fr', label: <span className="fi fi-fr"></span> },
    { value: 'de', label: <span className="fi fi-de"></span> },
];

export const Header: React.FC = () => {
    const { t, i18n } = useT('common');
    const pathname = usePathname();
    const router = useRouter();

    const handleLangChange = (lang: string) => {
        if (pathname.startsWith(`/${i18n.language}`)) {
            router.push(`/${lang}${pathname.slice(3, -1)}`);
        } else {
            i18n.changeLanguage(lang);
        }
    };

    const currentLang = LANGUAGES.find(l => l.value === i18n.language) ?? LANGUAGES[0];

    return (
        <header className="sticky top-0 z-40 w-full border-b border-blue-900 dark:border-vtherm-secondary/60 backdrop-blur bg-vtherm-quaternary text-vtherm-dark dark:bg-vtherm-primary dark:text-slate-50">
            <div className="container flex h-16 items-center justify-between px-6 gap-4">
                {/* Sélecteur de langue */}
                <div className="pl-12 relative">
                    <Listbox value={i18n.language} onChange={handleLangChange}>
                        <ListboxButton
                            className="
                                relative flex items-center gap-1 cursor-pointer rounded-md
                                px-3 py-1.5 text-sm font-semibold
                                bg-white/80 text-gray-800 border border-gray-300
                                hover:bg-white hover:border-blue-500
                                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                                dark:bg-vtherm-primary/60 dark:text-slate-100 dark:border-vtherm-secondary/50
                                dark:hover:bg-vtherm-secondary/30 dark:hover:border-vtherm-secondary
                                transition-colors duration-150
                            "
                            aria-label="Select language"
                        >
                            <span>{currentLang.label}</span>
                            <ChevronUpDownIcon className="w-4 h-4 text-gray-500 dark:text-slate-400" aria-hidden="true" />
                        </ListboxButton>

                        <ListboxOptions
                            anchor="bottom start"
                            className="
                                z-50 mt-1 min-w-[4rem] overflow-hidden rounded-md shadow-lg
                                bg-white border border-gray-200
                                dark:bg-gray-900 dark:border-vtherm-secondary/50
                                focus:outline-none
                                transition duration-100 ease-in
                                data-leave:opacity-0
                            "
                        >
                            {LANGUAGES.map((lang) => (
                                <ListboxOption
                                    key={lang.value}
                                    value={lang.value}
                                    className="
                                        group relative flex items-center gap-2 cursor-pointer select-none
                                        px-3 py-2 text-sm font-medium
                                        text-gray-800 data-focus:bg-blue-50 data-focus:text-blue-700
                                        dark:text-slate-100 dark:data-focus:bg-vtherm-secondary/30 dark:data-focus:text-white
                                        data-selected:font-bold data-selected:text-blue-700 dark:data-selected:text-vtherm-quaternary
                                        transition-colors duration-100
                                    "
                                >
                                    <span>{lang.label}</span>
                                    <CheckIcon
                                        className="w-3.5 h-3.5 invisible group-data-selected:visible text-blue-600 dark:text-vtherm-quaternary shrink-0"
                                        aria-hidden="true"
                                    />
                                </ListboxOption>
                            ))}
                        </ListboxOptions>
                    </Listbox>
                </div>

                {/* Barre de recherche Pagefind */}
                <div className="flex-1 md:pl-0  self-start mt-1">
                    <Suspense fallback={<div className="h-10 animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-full" />}>
                        <PagefindSearch />
                    </Suspense>
                </div>


                {/* Lien GitHub */}
                <Link
                    href="https://github.com/jmcollin78/versatile_thermostat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="md:flex hidden items-center gap-2 px-4 py-2 text-sm font-medium hover:text-orange-200 dark:hover:text-vtherm-quaternary dark:text-vtherm-light transition-colors"
                >
                    <CodeBracketIcon className="w-[18px] h-[18px]" />
                    <span className="hidden sm:inline">{t('on-github')}</span>
                </Link>
            </div>
        </header>
    );
};
