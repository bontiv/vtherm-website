import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { LinkLocale } from '@/components/LinkLocale';

export interface RelatedLink {
    href: string;
    label: string;
}

const LinkList: React.FC<{ title: string, links: RelatedLink[] }> = ({ title, links }) => <div className="space-y-3">
    <h3 className="py-0 text-xl font-medium">{title}</h3>
    <ul className="space-y-2">
        {links.map(link => <li key={link.href}>
            <LinkLocale href={link.href} className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-400 transition-colors">
                <ArrowRightIcon className="w-4 h-4" />
                {link.label}
            </LinkLocale>
        </li>)}
    </ul>
</div>;

/** Two columns of internal links: documentation pages and compatible devices */
export const RelatedLinks: React.FC<{ docsTitle: string, docs: RelatedLink[], devicesTitle: string, devices: RelatedLink[] }> = ({ docsTitle, docs, devicesTitle, devices }) => (
    <div className="grid md:grid-cols-2 gap-8">
        <LinkList title={docsTitle} links={docs} />
        {devices.length > 0 && <LinkList title={devicesTitle} links={devices} />}
    </div>
);
