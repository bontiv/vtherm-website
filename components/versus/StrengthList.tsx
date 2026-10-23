import React from 'react';
import { ArrowRightIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { LinkLocale } from '@/components/LinkLocale';

export interface Strength {
    title: string;
    description: string;
    /** Optional page detailing the strength */
    href?: string;
}

/** Grid of Versatile Thermostat strengths */
export const StrengthList: React.FC<{ items: Strength[], moreLabel?: string }> = ({ items, moreLabel }) => (
    <ul className="grid md:grid-cols-2 gap-6">
        {items.map((item, i) => <li key={i} className="flex gap-4 p-5 rounded-xl bg-vtherm-quaternary/30 dark:bg-vtherm-tertiary/30">
            <CheckBadgeIcon className="w-7 h-7 shrink-0 text-vtherm-secondary" aria-hidden="true" />
            <div>
                <h3 className="py-0 text-lg leading-7 font-medium text-vtherm-primary dark:text-vtherm-light mb-1">{item.title}</h3>
                <p className="leading-relaxed dark:text-vtherm-light/70">{item.description}</p>
                {item.href && moreLabel && <LinkLocale href={item.href} className="inline-flex items-center gap-1 mt-2 text-cyan-600 hover:text-cyan-400 transition-colors">
                    {moreLabel}
                    <ArrowRightIcon className="w-4 h-4" />
                </LinkLocale>}
            </div>
        </li>)}
    </ul>
);
