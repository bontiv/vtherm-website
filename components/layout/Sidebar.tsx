'use client';

import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { NavItem } from '../navigation/NavItem';
import { NavAccordion } from '../navigation/NavAccordion';
import Image from 'next/image';
import { useT } from '@/app/i18n/client';
import logo from '@/public/logo.webp';

export const Sidebar: React.FC<{ docfiles?: (string | undefined)[] }> = ({ docfiles }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { t } = useT('common');

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const qnaSubItems = docfiles?.map(file => ({
        href: `/docs/${file}`,
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
                    <Image loading='eager' src={logo} alt="Logo" width={256} height={256} style={{ width: '100%', height: 'auto' }} />
                </div>
                <div>
                    <p className="text-lg font-semibold text-[#ffffff]">Versatile Thermostat</p>
                    {/* <p className="text-xs text-[#71717a]">Smart Climate Control</p> */}
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="vtherm-navigation flex-1 px-3 py-6 space-y-1 overflow-y-auto" aria-label="Main navigation">
                <NavItem
                    href="/"
                    label={t('menu.home')}
                    onClick={closeMobileMenu}
                />
                <NavAccordion
                    label={t('menu.docs')}
                    subItems={qnaSubItems}
                    onClick={closeMobileMenu}
                />
                <NavItem
                    href="/devices"
                    label={t('menu.devices')}
                    onClick={closeMobileMenu}
                />
                <NavItem
                    href="/plugins"
                    label={t('menu.plugins')}
                    onClick={closeMobileMenu}
                />
                <NavItem
                    href="/debugger"
                    label={t('menu.log-analyzer')}
                    onClick={closeMobileMenu}
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
          bg-vtherm-dark/90
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
