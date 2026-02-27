'use client';

import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { NavItem } from '../navigation/NavItem';
import { NavAccordion } from '../navigation/NavAccordion';
import Image from 'next/image';
import { useT } from '@/app/i18n/client';
import logo from '@/public/logo.png';

export const Sidebar: React.FC<{ docref: string, docfiles?: (string | undefined)[] }> = ({ docref, docfiles }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { t } = useT('common');

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const qnaSubItems = docfiles?.map(file => ({
        href: `/docs/${docref}/${file}`,
        label: file ?? '--'
    })) || [];

    // [
    //     { href: `/docs/${docref}/quick-start`, label: 'General Questions' },
    //     { href: `/docs/${docref}/installation`, label: 'Installation' },
    //     { href: `/docs/${docref}/configuration`, label: 'Configuration' },
    //     { href: `/docs/${docref}/troubleshooting`, label: 'Troubleshooting' },
    // ];



    const sidebarContent = (
        <>
            {/* Logo / Branding */}
            <div className="flex flex-col items-center gap-3 px-4 py-6 border-b border-[#3a3a3a]">
                <div className="flex items-center justify-center">
                    <Image src={logo} alt="Logo" width={128} height={128} />
                </div>
                <div>
                    <h1 className="text-lg font-semibold text-[#ffffff]">Versatile Thermostat</h1>
                    {/* <p className="text-xs text-[#71717a]">Smart Climate Control</p> */}
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto" aria-label="Main navigation">
                <NavItem
                    href="/"
                    label={t('menu.home')}
                />
                <NavAccordion
                    label={t('menu.docs')}
                    subItems={qnaSubItems}
                />
                <NavItem
                    href="/devices"
                    label={t('menu.devices')}
                />
                <NavItem
                    href="/debugger"
                    label={t('menu.log-analyzer')}
                />

                {/* Separator */}
                <div className="my-4 border-t border-[#3a3a3a]" />

                {/* External Links */}
                <NavItem
                    href="https://github.com/jmcollin78/versatile_thermostat"
                    label={t('menu.github')}
                    isExternal
                />
            </nav>

            {/* Sidebar Footer */}
            <div className="px-4 py-4 border-t border-[#3a3a3a]">
                <p className="text-xs text-[#71717a] leading-relaxed">
                    { /* TOTO Slider footer content */}
                </p>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleMobileMenu}
                className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-300 dark:bg-[#2b2b2b] border border-blue-400 text-blue-600 dark:border-[#3a3a3a] dark:text-white md:hidden dark:hover:bg-[#3a3a3a] transition-colors"
                aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar - Desktop & Mobile Drawer */}
            <aside
                className={`
          fixed top-16 md:top-0 left-0 z-40 h-screen
          w-[247px]
          bg-sky-800
          dark:bg-sky-950
          dark:text-slate-400
          text-gray-200
          border-r border-[#3a3a3a]
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
                aria-label="Sidebar"
            >
                {sidebarContent}
            </aside>

            {/* Spacer for desktop layout */}
            <div className="hidden md:block w-[247px] shrink-0" aria-hidden="true" />
        </>
    );
};
