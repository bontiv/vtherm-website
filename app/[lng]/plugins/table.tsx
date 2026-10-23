'use client';

import { Suspense, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PluginCard } from './card';
import { useT } from '@/app/i18n/client';
import { certConfig, familyConfig, pluginAnchor, typeConfig, VTCertificationLevel, VTPlugin, VTPluginFamily, VTPluginType } from '@/lib/plugindb';
import { Trans } from 'react-i18next';
import dynamic from 'next/dynamic';
import { push } from '@socialgouv/matomo-next';
const PluginModal = dynamic(() => import('./modal'), { ssr: false });

type SortOrder = 'certification' | 'stars' | 'name';
type Facet = 'type' | 'certification' | 'family';

const pluginTypes: VTPluginType[] = ['integration', 'interface', 'blueprint', 'addon'];
const certificationLevels: VTCertificationLevel[] = ['official', 'recommended', 'community'];
const pluginFamilies: VTPluginFamily[] = ['algorithm', 'feature', 'interface', 'device-helper'];

const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    if (next.has(value)) {
        next.delete(value);
    } else {
        next.add(value);
    }
    return next;
};

interface Filters {
    type: VTPluginType | 'all';
    certs: Set<VTCertificationLevel>;
    families: Set<VTPluginFamily>;
    query: string;
    sort: SortOrder;
}

const sortOrders: SortOrder[] = ['certification', 'stars', 'name'];

const listParam = <T extends string,>(params: URLSearchParams, name: string, allowed: T[]): Set<T> =>
    new Set((params.get(name)?.split(',') ?? []).filter((value): value is T => allowed.includes(value as T)));

// Unknown values are ignored, so that a hand-edited or outdated link still shows a valid page.
const parseFilters = (search: string): Filters => {
    const params = new URLSearchParams(search);
    const type = params.get('type') as VTPluginType;
    const sort = params.get('sort') as SortOrder;
    return {
        type: pluginTypes.includes(type) ? type : 'all',
        certs: listParam(params, 'cert', certificationLevels),
        families: listParam(params, 'family', pluginFamilies),
        query: params.get('q') ?? '',
        sort: sortOrders.includes(sort) ? sort : 'certification',
    };
};

// Default values are left out and lists keep their display order, so that a given selection always gives the same URL.
const serializeFilters = (filters: Filters): string => {
    const params: string[] = [];
    if (filters.families.size > 0) {
        params.push(`family=${pluginFamilies.filter(family => filters.families.has(family)).join(',')}`);
    }
    if (filters.certs.size > 0) {
        params.push(`cert=${certificationLevels.filter(level => filters.certs.has(level)).join(',')}`);
    }
    if (filters.type !== 'all') {
        params.push(`type=${filters.type}`);
    }
    if (filters.query !== '') {
        params.push(`q=${encodeURIComponent(filters.query)}`);
    }
    if (filters.sort !== 'certification') {
        params.push(`sort=${filters.sort}`);
    }
    return params.length > 0 ? `?${params.join('&')}` : '';
};

// The page state is kept in the URL so that it can be shared: the filters in the query string
// (e.g. ?family=algorithm&cert=official) and the opened plugin in the hash (e.g. #kipk/vtherm_smartpi).
// The URL is updated with replaceState, which fires no event: local listeners are notified explicitly.
const locationListeners = new Set<() => void>();

const subscribeToLocation = (onChange: () => void) => {
    locationListeners.add(onChange);
    window.addEventListener('hashchange', onChange);
    window.addEventListener('popstate', onChange);
    return () => {
        locationListeners.delete(onChange);
        window.removeEventListener('hashchange', onChange);
        window.removeEventListener('popstate', onChange);
    };
};

const replaceUrl = (url: string) => {
    window.history.replaceState(window.history.state, '', url);
    locationListeners.forEach(listener => listener());
};

const setHash = (anchor: string) =>
    replaceUrl(window.location.pathname + window.location.search + (anchor ? `#${anchor}` : ''));

// Statistics only tracks the path and query string, so opening a plugin is tracked here as a page view.
// A shared link is not tracked again: its hash is already part of the initial page view.
const openPlugin = (plugin: VTPlugin) => {
    const listUrl = window.location.pathname + window.location.search;
    setHash(pluginAnchor(plugin));
    push(['setReferrerUrl', listUrl]);
    push(['setCustomUrl', listUrl + window.location.hash]);
    push(['setDocumentTitle', `${plugin.name} - ${document.title}`]);
    push(['trackPageView']);
};

// Later events (outlinks, heartbeat) are attributed back to the list once the plugin is closed.
const closePlugin = () => {
    setHash('');
    push(['setCustomUrl', window.location.pathname + window.location.search]);
    push(['setDocumentTitle', document.title]);
};

// Changes are applied to the filters currently in the URL rather than to a render-time copy,
// so that a delayed update (the search input) does not revert a filter changed in the meantime.
const updateFilters = (changes: Partial<Filters>) =>
    replaceUrl(window.location.pathname + serializeFilters({ ...parseFilters(window.location.search), ...changes }) + window.location.hash);

const decodeHash = (hash: string): string => {
    try {
        return decodeURIComponent(hash.replace(/^#/, ''));
    } catch {
        return '';
    }
};

const searchableText = (plugin: VTPlugin): string =>
    [
        plugin.name, plugin.name_fr, plugin.name_de,
        plugin.description, plugin.description_fr, plugin.description_de,
        plugin.author, plugin.slug,
    ]
        .filter(Boolean)
        .join(' ')
        .replace(/<[^>]+>/g, ' ')
        .toLowerCase();

const PluginTable: React.FC<{ plugins: VTPlugin[] }> = ({ plugins }) => {
    const search = useSyncExternalStore(subscribeToLocation, () => window.location.search, () => '');
    const hash = useSyncExternalStore(subscribeToLocation, () => window.location.hash, () => '');
    const filters = useMemo(() => parseFilters(search), [search]);
    const { type: selectedType, certs: selectedCerts, families: selectedFamilies, sort: sortOrder } = filters;
    const { t } = useT('plugins');

    // The search input is filtered on immediately but written to the URL once typing pauses,
    // as browsers throttle replaceState. It follows the URL when the query is changed from elsewhere.
    const [query, setQuery] = useState(filters.query);
    const [urlQuery, setUrlQuery] = useState(filters.query);
    if (filters.query !== urlQuery) {
        setUrlQuery(filters.query);
        setQuery(filters.query);
    }

    useEffect(() => {
        if (query === filters.query) {
            return;
        }
        const timer = setTimeout(() => updateFilters({ query }), 300);
        return () => clearTimeout(timer);
    }, [query, filters.query]);

    const modalPlugin = useMemo(() => {
        const anchor = decodeHash(hash).toLowerCase();
        return anchor ? plugins.find(plugin => pluginAnchor(plugin).toLowerCase() === anchor) : undefined;
    }, [hash, plugins]);

    const searchIndex = useMemo(() => new Map(plugins.map(plugin => [plugin, searchableText(plugin)])), [plugins]);
    const normalizedQuery = query.trim().toLowerCase();

    // A plugin matches when it satisfies every active filter, except the one given in `ignore`.
    // Ignoring its own facet lets each chip show how many results it would give once selected.
    const matches = (plugin: VTPlugin, ignore?: Facet) =>
        (ignore === 'type' || selectedType === 'all' || plugin.type === selectedType)
        && (ignore === 'certification' || selectedCerts.size === 0 || selectedCerts.has(plugin.certification))
        && (ignore === 'family' || selectedFamilies.size === 0 || (!!plugin.family && selectedFamilies.has(plugin.family)))
        && (normalizedQuery === '' || !!searchIndex.get(plugin)?.includes(normalizedQuery));

    const filteredPlugins = plugins
        .filter(plugin => matches(plugin))
        .sort((a, b) => {
            if (sortOrder === 'name') {
                return a.name.localeCompare(b.name);
            }
            const byStars = (b.stars ?? 0) - (a.stars ?? 0);
            if (sortOrder === 'stars') {
                return byStars || a.name.localeCompare(b.name);
            }
            return (certConfig[a.certification].rank - certConfig[b.certification].rank) || byStars;
        });

    const countFor = (facet: Facet, predicate: (plugin: VTPlugin) => boolean) =>
        plugins.filter(plugin => predicate(plugin) && matches(plugin, facet)).length;

    const hasActiveFilters = selectedType !== 'all' || selectedCerts.size > 0 || selectedFamilies.size > 0 || normalizedQuery !== '';

    const resetFilters = () => {
        setQuery('');
        updateFilters({ type: 'all', certs: new Set(), families: new Set(), query: '' });
    };

    return (
        <div className="size-full min-h-screen overflow-auto">
            <Suspense>
                <PluginModal plugin={modalPlugin} onClose={closePlugin} />
            </Suspense>
            <div className="max-w-[1400px] mx-auto sm:px-6 py-12">
                {/* Header */}
                <div className="mb-10">
                    <h1 className='p-0 mb-4 text-orange-500'>
                        {t('title')}
                    </h1>
                    <p className="m-0 max-w-3xl dark:text-slate-300 text-slate-800">
                        <Trans i18nKey="description_short" t={t} components={[
                            <a key="0" href='https://github.com/bontiv/vtherm-website/issues/new?template=new_plugin.yml' className='underline' />
                        ]} />
                    </p>
                </div>

                {/* Search and sort */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="relative flex-1 min-w-60">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                        <input
                            type="search"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder={t('search_placeholder')}
                            aria-label={t('search_label')}
                            className="w-full pl-9 pr-9 py-2 rounded-lg text-sm border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white placeholder:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-(--color-primary) [&::-webkit-search-cancel-button]:hidden"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                aria-label={t('search_clear')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                            >
                                <XMarkIcon className="size-4" />
                            </button>
                        )}
                    </div>

                    <FilterSelect<SortOrder>
                        value={sortOrder}
                        onChange={sort => updateFilters({ sort })}
                        options={[
                            { value: 'certification', label: t('sort.certification') },
                            { value: 'stars', label: t('sort.stars') },
                            { value: 'name', label: t('sort.name') },
                        ]}
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">

                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400 me-1">{t('filters.family')}</span>
                        {pluginFamilies.map(family => {
                            const FamilyIcon = familyConfig[family].icon;
                            return (
                                <Chip
                                    key={family}
                                    active={selectedFamilies.has(family)}
                                    count={countFor('family', plugin => plugin.family === family)}
                                    onClick={() => updateFilters({ families: toggle(selectedFamilies, family) })}
                                >
                                    <FamilyIcon className="size-4" style={{ color: selectedFamilies.has(family) ? undefined : familyConfig[family].color }} aria-hidden="true" />
                                    {t(`families.${family}`)}
                                </Chip>
                            );
                        })}

                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400 me-1">{t('filters.certification')}</span>
                            {certificationLevels.map(level => {
                                const CertIcon = certConfig[level].Icon;
                                return (
                                    <Chip
                                        key={level}
                                        active={selectedCerts.has(level)}
                                        count={countFor('certification', plugin => plugin.certification === level)}
                                        onClick={() => updateFilters({ certs: toggle(selectedCerts, level) })}
                                    >
                                        <CertIcon className="size-4" style={{ color: selectedCerts.has(level) ? undefined : certConfig[level].color }} aria-hidden="true" />
                                        {t(`certification.${level}`)}
                                    </Chip>
                                );
                            })}
                        </div>

                        <span className="hidden sm:block w-px h-5 bg-slate-300 dark:bg-slate-600" aria-hidden="true" />

                        <div className="md:flex flex-wrap items-center gap-2 hidden">
                            <Chip
                                active={selectedType === 'all'}
                                count={countFor('type', () => true)}
                                onClick={() => updateFilters({ type: 'all' })}
                            >
                                {t('types.all')}
                            </Chip>
                            {pluginTypes.map(type => {
                                const TypeIcon = typeConfig[type].icon;
                                return (
                                    <Chip
                                        key={type}
                                        active={selectedType === type}
                                        count={countFor('type', plugin => plugin.type === type)}
                                        onClick={() => updateFilters({ type: selectedType === type ? 'all' : type })}
                                    >
                                        <TypeIcon className="size-4" style={{ color: selectedType === type ? undefined : typeConfig[type].color }} aria-hidden="true" />
                                        {t(`types.${type}`)}
                                    </Chip>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Results summary */}
                <div className="flex items-center justify-between gap-4 mb-4 text-sm text-slate-600 dark:text-slate-400">
                    <span aria-live="polite">{t('results', { count: filteredPlugins.length })}</span>
                    {hasActiveFilters && (
                        <button type="button" onClick={resetFilters} className="text-(--color-primary) hover:underline cursor-pointer">
                            {t('reset_filters')}
                        </button>
                    )}
                </div>

                {/* Plugin Grid */}
                {filteredPlugins.length > 0 ? (
                    <div className="@container">
                        <div className="grid grid-cols-1 @2xl:grid-cols-2 @6xl:grid-cols-3 gap-4">
                            {filteredPlugins.map(plugin => (
                                <button
                                    key={pluginAnchor(plugin)}
                                    onClick={() => openPlugin(plugin)}
                                    className='h-full cursor-pointer text-left rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2'
                                >
                                    <PluginCard plugin={plugin} />
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="py-16 text-center text-slate-600 dark:text-slate-400">
                        <p className="m-0 mb-3">{t('no_results')}</p>
                        <button type="button" onClick={resetFilters} className="text-sm text-(--color-primary) hover:underline cursor-pointer">
                            {t('reset_filters')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PluginTable;

function Chip({
    active,
    count,
    onClick,
    children,
}: {
    active: boolean;
    count: number;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            aria-pressed={active}
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border cursor-pointer transition-colors duration-150
                ${active
                    ? 'border-transparent bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500'}
                ${!active && count === 0 ? 'opacity-50' : ''}`}
        >
            {children}
            <span className={`text-xs ${active ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400'}`}>{count}</span>
        </button>
    );
}

interface FilterOption<T> {
    value: T;
    label: string;
    color?: string;
}

function FilterSelect<T extends string>({
    value,
    onChange,
    options,
}: {
    value: T;
    onChange: (v: T) => void;
    options: FilterOption<T>[];
}) {
    const selected = options.find(o => o.value === value) ?? options[0];

    return (
        <div className="relative">
            <Listbox value={value} onChange={onChange}>
                <ListboxButton
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200 border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-(--color-primary) min-w-[9rem]"
                >
                    <span
                        className="flex-1 text-left truncate"
                        style={{ color: selected.color ?? 'inherit' }}
                    >
                        {selected.label}
                    </span>
                    <svg className="w-4 h-4 shrink-0 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                </ListboxButton>

                <ListboxOptions
                    className="absolute z-20 mt-1 w-max rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black/10 dark:ring-white/10 focus:outline-none py-1"
                    anchor="bottom end"
                >
                    {options.map(option => (
                        <ListboxOption
                            key={option.value}
                            value={option.value}
                            className="flex dark:text-white items-center gap-2 px-3 py-1.5 text-sm cursor-pointer select-none data-focus:bg-slate-100 dark:data-focus:bg-slate-700 data-selected:font-semibold"
                        >
                            {({ selected: isSelected }) => (
                                <>
                                    <span
                                        className="flex-1 truncate"
                                        style={{ color: option.color ?? 'inherit' }}
                                    >
                                        {option.label}
                                    </span>
                                    {isSelected && (
                                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" style={{ color: option.color ?? 'var(--color-primary)' }} aria-hidden="true">
                                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </>
                            )}
                        </ListboxOption>
                    ))}
                </ListboxOptions>
            </Listbox>
        </div>
    );
}
