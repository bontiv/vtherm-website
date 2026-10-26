import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { getT } from '@/app/i18n';
import { LinkLocale } from '@/components/LinkLocale';
import type { Crumb } from '@/lib/semantic';

/**
 * Visible breadcrumb from the home page to the current page.
 * Pass the same `items` as the `breadcrumb()` JSON-LD of the page.
 * @param items name and path of each level after home
 */
export const Breadcrumbs: React.FC<{ lng: string, items: Crumb[] }> = async ({ lng, items }) => {
    const { t } = await getT('common', { lng });
    const crumbs = [{ name: t('menu.home'), path: '/' }, ...items];

    return <nav aria-label={t('breadcrumb')} className="mb-6 text-sm text-[#71717a] dark:text-[#a1a1aa]" data-pagefind-ignore>
        <ol className="flex flex-wrap items-center gap-1">
            {crumbs.map((crumb, i) => {
                const last = i === crumbs.length - 1;
                // Two levels may share a path (e.g. the documentation entry page)
                return <li key={i} className="flex items-center gap-1">
                    {i > 0 && <ChevronRightIcon className="w-4 h-4 shrink-0" aria-hidden="true" />}
                    {last
                        ? <span aria-current="page" className="text-vtherm-dark dark:text-vtherm-light">{crumb.name}</span>
                        : <LinkLocale href={crumb.path} className="hover:text-vtherm-secondary transition-colors">{crumb.name}</LinkLocale>}
                </li>;
            })}
        </ol>
    </nav>;
};
