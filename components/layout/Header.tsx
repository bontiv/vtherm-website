'use client';

import React, { ChangeEventHandler, Suspense } from 'react';
import Link from 'next/link';
import { CodeBracketIcon } from '@heroicons/react/24/outline';
import { useT } from '@/app/i18n/client';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Chargement dynamique pour éviter les erreurs SSR
const PagefindSearch = dynamic(
    () => import('@/components/search/PagefindSearch').then(mod => ({ default: mod.PagefindSearch })),
    {
        ssr: false,
        loading: () => <div className="h-10 animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-full max-w-md" />
    }
);

export const Header: React.FC = () => {
    const { t, i18n } = useT('common');
    const pathname = usePathname();
    const router = useRouter();

    const handleLangChange: ChangeEventHandler<HTMLSelectElement> = (evt) => {
        const lang = evt.target.value;
        if (pathname.startsWith(`/${i18n.language}`)) {
            router.push(`/${lang}${pathname.slice(3, -1)}`)
        } else {
            i18n.changeLanguage(lang)
        }
    }

    return (
        <header className="sticky top-0 z-40 w-full border-b border-blue-900 dark:border-vtherm-secondary/60 backdrop-blur bg-vtherm-quaternary text-vtherm-dark dark:bg-vtherm-primary dark:text-slate-50">
            <div className="container flex h-16 items-center justify-between px-6 gap-4">
                {/* Sélecteur de langue */}
                <div className="pl-12">
                    <select
                        value={i18n.language}
                        onChange={handleLangChange}
                        className="px-2 py-1 "
                    >
                        <option value='en'>EN</option>
                        <option value='fr'>FR</option>
                        <option value='de'>DE</option>
                    </select>
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
