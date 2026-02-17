'use client';

import Link, { LinkProps } from 'next/link';
import i18n from '@/app/i18n/i18next';
import { AnchorHTMLAttributes } from 'react';
import React from 'react';
import { usePathname } from 'next/navigation';
import { fallbackLng, languages } from '@/app/i18n/settings';

type LinkLocaleProps = LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>;

function getCurrentLanguage(pathname: string): string {
    const pathSegments = pathname.split('/');
    if (i18n.resolvedLanguage) {
        return i18n.resolvedLanguage;
    }
    if (pathSegments.length < 2) {
        return fallbackLng;
    }
    const lng = pathSegments[1];
    if (languages.includes(lng)) {
        return lng;
    }
    return fallbackLng;
}

export const LinkLocale = React.forwardRef<HTMLAnchorElement, LinkLocaleProps>(({ href, children, ...props }, ref) => {
    const pathname = usePathname();
    const lng = getCurrentLanguage(pathname);

    return (
        <Link href={`/${lng}${href}`} ref={ref} {...props}>
            {children}
        </Link>
    );
});

export const LinkDocs = React.forwardRef<HTMLAnchorElement, LinkLocaleProps>(({ href, children, ...props }, ref) => {
    const release = '9.0.0'

    return (
        <LinkLocale href={`/docs/${release}${href}`} ref={ref} {...props}>
            {children}
        </LinkLocale>
    );
});
