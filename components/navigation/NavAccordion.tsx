'use client';

import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { NavItem } from './NavItem';

interface SubItem {
    href: string;
    label: string;
}

interface NavAccordionProps {
    label: string;
    subItems: SubItem[];
}

export const NavAccordion: React.FC<NavAccordionProps> = ({
    label,
    subItems,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    const activeStyles = isOpen
        ? 'bg-blue-100/10 text-blue-200 font-medium'
        : 'text-gray-200 hover:text-sky-200 hover:bg-sky-100/5';

    //${isOpen ? 'text-[#7CFC00] bg-[#7CFC00]/5' : 'text-[#a1a1aa] hover:text-[#7CFC00] hover:bg-[#7CFC00]/5'}

    return (
        <div className="w-full">
            <button
                onClick={toggleAccordion}
                className={`
          w-full flex items-center justify-between
          px-4 py-2.5
          text-[0.95rem]
          rounded-lg
          transition-all duration-200
          group
          ${activeStyles}
        `}
                aria-expanded={isOpen}
                aria-label={`${label} menu`}
            >
                <span>{label}</span>
                <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="mt-1 ml-2 space-y-1 accordion-enter">
                    {subItems.map((item) => (
                        <NavItem
                            key={item.href}
                            href={item.href}
                            label={item.label}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
