'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LANGUAGE_NAMES: Record<string, string> = {
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
};

/**
 * Plain links to the current page in every language, so crawlers can reach
 * all the translations (the header language selector only works with JavaScript).
 */
export const LanguageLinks: React.FC<{ lng: string, label: string }> = ({ lng, label }) => {
    const pathname = usePathname();
    const rest = pathname.startsWith(`/${lng}/`) ? pathname.slice(lng.length + 1) : '/';

    return (
        <nav aria-label={label} className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mx-auto">
            {Object.entries(LANGUAGE_NAMES).map(([code, name], index) => <React.Fragment key={code}>
                {index > 0 && <span className="hidden sm:inline">•</span>}
                {code === lng
                    ? <span lang={code} className="font-medium" aria-current="page">{name}</span>
                    : <Link href={`/${code}${rest}`} hrefLang={code} lang={code} className="hover:text-[#7CFC00] transition-colors">{name}</Link>}
            </React.Fragment>)}
        </nav>
    );
};
