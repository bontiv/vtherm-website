import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { LinkLocale } from '@/components/LinkLocale';

interface HeatingTypeCardProps {
    href: string;
    icon: React.ReactNode;
    title: string;
    description: string;
}

/** Clickable tile leading to the quick-start page of a heating type */
export const HeatingTypeCard: React.FC<HeatingTypeCardProps> = ({ href, icon, title, description }) => (
    <LinkLocale
        href={href}
        className="group flex flex-col items-center text-center gap-3 p-6 rounded-xl bg-white dark:bg-vtherm-dark/60 border border-blue-200 dark:border-vtherm-tertiary/60 hover:border-vtherm-secondary/60 hover:shadow-lg transition-all duration-300"
    >
        <span className="text-vtherm-secondary group-hover:scale-110 transition-transform">{icon}</span>
        <span className="text-lg font-medium text-vtherm-primary dark:text-vtherm-light">{title}</span>
        <span className="text-sm leading-relaxed dark:text-vtherm-light/70">{description}</span>
        <ArrowRightIcon className="w-5 h-5 mt-auto text-vtherm-primary dark:text-vtherm-light group-hover:translate-x-1 transition-transform" />
    </LinkLocale>
);
