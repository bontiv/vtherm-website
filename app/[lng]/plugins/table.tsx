'use client';

import { Suspense, useState } from 'react';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { PluginCard } from './card';
import { useT } from '@/app/i18n/client';
import { VTCertificationLevel, VTPlugin, VTPluginType } from '@/lib/plugindb';
import { Trans } from 'react-i18next';
import dynamic from 'next/dynamic';
const PluginModal = dynamic(() => import('./modal'), { ssr: false });


const PluginTable: React.FC<{ plugins: VTPlugin[] }> = ({ plugins }) => {
    const [selectedType, setSelectedType] = useState<VTPluginType | 'all'>('all');
    const [selectedCert, setSelectedCert] = useState<VTCertificationLevel | 'all'>('all');
    const [modalPlugin, setModalPlugin] = useState<VTPlugin | undefined>(undefined);
    const { t } = useT('plugins');

    const filteredPlugins = plugins.filter(plugin => {
        const typeMatch = selectedType === 'all' || plugin.type === selectedType;
        const certMatch = selectedCert === 'all' || plugin.certification === selectedCert;
        return typeMatch && certMatch;
    });

    return (
        <div className="size-full min-h-screen overflow-auto">
            <Suspense>
                <PluginModal plugin={modalPlugin} onClose={() => setModalPlugin(undefined)} />
            </Suspense>
            <div className="max-w-[1400px] mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <h1 className='p-0 text-orange-500'
                        >
                            {t('title')}
                        </h1>
                        <div
                            className="px-3 py-1 rounded-full self-start text-xs font-medium text-white bg-(--color-primary) tracking-wide"
                        >
                            {filteredPlugins.length}
                        </div>
                    </div>
                    <p className="m-0 max-w-3xl dark:text-slate-300 text-slate-800">
                        <Trans i18nKey="description_short" t={t} components={[
                            <a key="0" href='https://github.com/bontiv/vtherm-website/issues/new?template=new_plugin.yml' className='underline' />
                        ]} />
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-slate-300">
                    {/* Type filter */}
                    <FilterSelect<VTPluginType | 'all'>
                        value={selectedType}
                        onChange={setSelectedType}
                        options={[
                            { value: 'all', label: t('types.all') },
                            { value: 'blueprint', label: t('types.blueprint'), color: 'var(--color-blue-500)' },
                            { value: 'integration', label: t('types.integration'), color: 'var(--color-orange-400)' },
                            { value: 'addon', label: t('types.addon'), color: 'var(--color-purple-500)' },
                            { value: 'interface', label: t('types.interface'), color: 'var(--color-sky-500)' },
                        ]}
                    />
                    <div className="w-px h-8 bg-slate-300" />
                    {/* Certification filter */}
                    <FilterSelect<VTCertificationLevel | 'all'>
                        value={selectedCert}
                        onChange={setSelectedCert}
                        options={[
                            { value: 'all', label: t('certification.all') },
                            { value: 'official', label: `★ ${t('certification.official')}`, color: 'var(--color-vtherm-tertiary)' },
                            { value: 'recommended', label: `◆ ${t('certification.recommended')}`, color: 'var(--color-vtherm-quaternary)' },
                            { value: 'community', label: `● ${t('certification.community')}`, color: 'var(--color-vtherm-secondary)' },
                        ]}
                    />
                </div>

                {/* Plugin Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {filteredPlugins.map((plugin, index) => (
                        <button
                            key={plugin.slug}
                            onClick={() => setModalPlugin(plugin)}
                            className='cursor-pointer text-left'
                        >
                            <PluginCard plugin={plugin} index={index} />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PluginTable;

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
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-(--color-primary) min-w-[9rem]"
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
                    anchor="bottom start"
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