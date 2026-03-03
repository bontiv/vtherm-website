'use client';

import React, { ChangeEventHandler } from 'react';
import Link from 'next/link';
import { CodeBracketIcon } from '@heroicons/react/24/outline';
import { useT } from '@/app/i18n/client';
import { usePathname, useRouter } from 'next/navigation';

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
            <div className="container flex h-16 items-center justify-between px-6">
                {/* Barre de recherche */}
                <div className="flex-1 max-w-md pl-12 md:pl-0">
                    {/* <SearchBar
                        placeholder="Search ..."
                        onSearch={handleSearch}
                    /> */}
                    <select value={i18n.language} onChange={handleLangChange}>
                        <option value='en'>EN</option>
                        <option value='fr'>FR</option>
                        <option value='de'>DE</option>
                    </select>
                </div>

                {/* Lien GitHub */}
                <Link
                    href="https://github.com/jmcollin78/versatile_thermostat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:text-orange-200 dark:hover:text-vtherm-quaternary dark:text-vtherm-light transition-colors"
                >
                    <CodeBracketIcon className="w-[18px] h-[18px]" />
                    <span className="hidden sm:inline">{t('on-github')}</span>
                </Link>
            </div>
        </header>
    );
};
