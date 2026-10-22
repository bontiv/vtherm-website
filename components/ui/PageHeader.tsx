import React from 'react';

interface PageHeaderProps {
    /** Small label above the title (section name) */
    eyebrow?: string;
    icon?: React.ReactNode;
    title: string;
    intro: string;
}

/** Centered header of a content page */
export const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, icon, title, intro }) => (
    <header className="pt-8 text-center space-y-4 max-w-4xl mx-auto">
        {icon && <div className="flex justify-center text-vtherm-secondary">{icon}</div>}
        {eyebrow && <p className="text-sm uppercase tracking-widest text-vtherm-secondary">{eyebrow}</p>}
        <h1 className="text-4xl md:text-5xl font-light text-vtherm-dark dark:text-vtherm-light">{title}</h1>
        <p className="text-lg md:text-xl leading-relaxed text-[#71717a] dark:text-[#a1a1aa]">{intro}</p>
    </header>
);
