'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

import { fallbackLng, languages } from '@/app/i18n/settings';
import { LinkLocale } from '../LinkLocale';

interface NavItemProps {
    href: string;
    label: string;
    isExternal?: boolean;
}

function getCurrentLanguage(pathname: string): string {
    const pathSegments = pathname.split('/');
    if (pathSegments.length < 2) {
        return fallbackLng;
    }

    const lng = pathSegments[1];
    if (lng && languages.includes(lng)) {
        return lng;
    }
    return fallbackLng;
}

export const NavItem: React.FC<NavItemProps> = ({
    href,
    label,
    isExternal = false,
}) => {
    const pathname = usePathname();
    const lng = getCurrentLanguage(pathname);

    const isActive = pathname === `/${lng}${href}/` || pathname === `/${lng}${href}`;

    const baseStyles = `
    flex items-center justify-between
    px-4 py-2.5
    text-[0.95rem]
    rounded-lg
    transition-all duration-200
    group
  `;

    const activeStyles = isActive
        ? 'bg-blue-100/10 text-blue-200 font-medium'
        : 'text-gray-200 hover:text-sky-200 hover:bg-sky-100/5';

    const content = (
        <>
            <span>{label}</span>
            {isExternal && (
                <ArrowTopRightOnSquareIcon
                    className="w-[14px] h-[14px] opacity-60 group-hover:opacity-100 transition-opacity"
                />
            )}
        </>
    );

    if (isExternal) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${baseStyles} ${activeStyles}`}
            >
                {content}
            </a>
        );
    }

    return (
        <LinkLocale
            href={href}
            className={`${baseStyles} ${activeStyles}`}
        >
            {content}
        </LinkLocale>
    );
};
