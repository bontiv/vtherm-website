import React from 'react';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';

export interface Strength {
    title: string;
    description: string;
}

/** Grid of Versatile Thermostat strengths */
export const StrengthList: React.FC<{ items: Strength[] }> = ({ items }) => (
    <ul className="grid md:grid-cols-2 gap-6">
        {items.map((item, i) => <li key={i} className="flex gap-4 p-5 rounded-xl bg-vtherm-quaternary/30 dark:bg-vtherm-tertiary/30">
            <CheckBadgeIcon className="w-7 h-7 shrink-0 text-vtherm-secondary" aria-hidden="true" />
            <div>
                <h3 className="py-0 text-lg leading-7 font-medium text-vtherm-primary dark:text-vtherm-light mb-1">{item.title}</h3>
                <p className="leading-relaxed dark:text-vtherm-light/70">{item.description}</p>
            </div>
        </li>)}
    </ul>
);
