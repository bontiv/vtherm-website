'use client';

import { useMemo, useState } from "react";
import { CheckIcon, ClipboardDocumentIcon, ExclamationTriangleIcon, InformationCircleIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { useAnalyzerT } from "./useAnalyzerT";
import { LogParser } from "../log_parser";
import { formatTime, TimeZoneMode } from "../time";
import { formatConfigValue, groupConfig, isEntityId } from "../config_schema";

type ConfigPanelProps = {
    parser: LogParser,
    thermostat: string,
    displayTz: TimeZoneMode,
    onlyChanged: boolean,
    onOnlyChanged: (value: boolean) => void,
    onBack: () => void,
}

const Value: React.FC<{ value: unknown, yes: string, no: string }> = ({ value, yes, no }) => {
    if (value === true) return <span className="inline-block px-2 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200">{yes}</span>;
    if (value === false) return <span className="inline-block px-2 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{no}</span>;
    const mono = typeof value === 'string' || Array.isArray(value) || isEntityId(value);
    return <span className={`text-sm break-all ${mono ? 'font-mono text-xs' : ''} text-slate-900 dark:text-slate-100`}>{formatConfigValue(value)}</span>;
};

const ConfigPanel: React.FC<ConfigPanelProps> = ({ parser, thermostat, displayTz, onlyChanged, onOnlyChanged, onBack }) => {
    const { t, i18n } = useAnalyzerT();
    const [query, setQuery] = useState('');
    const [raw, setRaw] = useState(false);
    const [copied, setCopied] = useState(false);

    const config = parser.getConfig(thermostat);
    const startup = parser.getStartupConfig(thermostat);
    const diff = useMemo(() => new Map(parser.getConfigDiff(thermostat).map(d => [d.key, d])), [parser, thermostat]);
    const fmt = (d?: Date) => d ? formatTime(d, { tz: displayTz, lng: i18n.language, withDate: true }) : '';
    const label = (key: string) => t(`config.keys.${key}`, { defaultValue: key });

    const groups = useMemo(() => {
        if (!config) return [];
        const q = query.trim().toLowerCase();
        return groupConfig(config.values).map(({ group, keys }) => {
            const featureValue = group.featureKey ? config.values[group.featureKey] : undefined;
            const rows = keys.filter(key => {
                if (onlyChanged && !diff.has(key)) return false;
                if (!q) return true;
                return `${label(key)} ${key} ${formatConfigValue(config.values[key])}`.toLowerCase().includes(q);
            });
            return { group, rows, total: keys.length, disabled: featureValue === false, enabled: featureValue === true };
        }).filter(g => g.rows.length > 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config, query, onlyChanged, diff, t]);

    if (!config) {
        return (
            <div className="flex flex-col items-center gap-3 px-6 py-10 text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <WrenchScrewdriverIcon className="size-10 text-slate-400" aria-hidden="true" />
                <h2 className="m-0 p-0 text-lg font-semibold text-slate-900 dark:text-white">{t('config.empty_title')}</h2>
                <p className="m-0 max-w-xl text-sm text-slate-600 dark:text-slate-300">{t('config.empty_text')}</p>
                <p className="m-0 max-w-xl text-sm text-slate-600 dark:text-slate-300">{t('config.empty_hint')}</p>
                <button type="button" onClick={onBack} className="min-h-10 px-4 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                    {t('config.back')}
                </button>
            </div>
        );
    }

    const fromHeader = config.source === 'header';
    const { header } = parser;
    const keyCount = Object.keys(config.values).length;
    const shownCount = groups.reduce((n, g) => n + g.rows.length, 0);
    const rawText = fromHeader && header ? header.rawText : JSON.stringify(config.values, null, 2);

    const meta = fromHeader && header ? [
        { label: t('config.meta.entity'), value: header.entityId ?? header.thermostatName },
        { label: t('config.meta.period'), value: header.period ? `${fmt(header.period.start)} → ${fmt(header.period.end)}` : '—' },
        { label: t('config.meta.level'), value: header.level ?? '—' },
        { label: t('config.meta.entries'), value: header.entries?.toLocaleString(i18n.language) ?? '—' },
        { label: t('config.meta.generated'), value: fmt(header.generated) || '—' },
    ] : [
        { label: t('config.meta.thermostat'), value: thermostat },
        { label: t('config.meta.line'), value: String(config.line ?? '—') },
        { label: t('config.meta.timestamp'), value: fmt(config.timestamp) || '—' },
        { label: t('config.meta.keys'), value: String(keyCount) },
    ];

    const copy = () => {
        navigator.clipboard.writeText(rawText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const smallButton = "inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer";

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3.5 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex flex-wrap justify-between items-center gap-2.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="m-0 p-0 text-lg font-semibold text-slate-900 dark:text-white">{t('config.title', { name: thermostat })}</h2>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${fromHeader
                            ? 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                            : 'bg-orange-50 text-orange-900 dark:bg-orange-950 dark:text-orange-200'}`}>
                            {fromHeader ? t('config.source_header') : t('config.source_setup')}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setRaw(r => !r)} className={smallButton}>
                            {raw ? t('config.grouped') : fromHeader ? t('config.raw_header') : t('config.raw_json')}
                        </button>
                        <button type="button" onClick={copy} className={smallButton}>
                            {copied ? <CheckIcon className="size-4" aria-hidden="true" /> : <ClipboardDocumentIcon className="size-4" aria-hidden="true" />}
                            {copied ? t('copied') : t('copy')}
                        </button>
                    </div>
                </div>
                <dl className="m-0 grid gap-x-5 gap-y-2.5 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                    {meta.map(m => (
                        <div key={m.label} className="flex flex-col">
                            <dt className="text-xs text-slate-500 dark:text-slate-400">{m.label}</dt>
                            <dd className="m-0 text-sm font-medium text-slate-900 dark:text-white break-words">{m.value}</dd>
                        </div>
                    ))}
                </dl>
                {fromHeader ? (
                    <div className="flex gap-2.5 items-start p-3 rounded-lg border text-sm border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
                        <InformationCircleIcon className="size-5 shrink-0" aria-hidden="true" />
                        <div>{diff.size > 0 && startup
                            ? t('config.header_diff', { line: startup.line, date: fmt(startup.timestamp) })
                            : t('config.header_info')}</div>
                    </div>
                ) : (
                    <div className="flex gap-2.5 items-start p-3 rounded-lg border text-sm border-orange-300 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-200">
                        <ExclamationTriangleIcon className="size-5 shrink-0" aria-hidden="true" />
                        <div>{t('config.setup_warning', { date: fmt(config.timestamp) })}</div>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('config.filter')}
                    aria-label={t('config.filter')}
                    className="flex-[1_1_260px] max-w-sm min-h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
                {diff.size > 0 && (
                    <label className="inline-flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                        <input type="checkbox" checked={onlyChanged} onChange={(e) => onOnlyChanged(e.target.checked)} />
                        {t('config.only_changed', { count: diff.size })}
                    </label>
                )}
                <span className="text-sm text-slate-500 dark:text-slate-400">{t('config.count', { shown: shownCount, total: keyCount })}</span>
            </div>

            {raw ? (
                <pre className="m-0 p-4 max-h-[60vh] overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200">{rawText}</pre>
            ) : groups.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">{t('config.no_match')}</div>
            ) : (
                <div className="grid gap-4 items-start grid-cols-[repeat(auto-fill,minmax(min(100%,360px),1fr))]">
                    {groups.map(({ group, rows, total, disabled, enabled }) => (
                        <section key={group.id} className="px-4 pt-3.5 pb-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-2 mb-1.5">
                                <h3 className="m-0 p-0 text-sm font-semibold text-slate-900 dark:text-white">{t(`config.groups.${group.id}`)}</h3>
                                {disabled && <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{t('config.disabled')}</span>}
                                {enabled && <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200">{t('config.enabled')}</span>}
                                <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">{rows.length} / {total}</span>
                            </div>
                            <dl className={`m-0 ${disabled ? 'opacity-60' : ''}`}>
                                {rows.map(key => {
                                    const changed = diff.get(key);
                                    return (
                                        <div key={key} className={`grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-center py-2 border-t
                                            ${changed ? '-mx-3 px-3 rounded-md border-transparent bg-orange-50 dark:bg-orange-950/40' : 'border-slate-100 dark:border-slate-800'}`}>
                                            <dt className="flex flex-col min-w-0">
                                                <span className="text-sm text-slate-800 dark:text-slate-100">{label(key)}</span>
                                                <span className="truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">{key}</span>
                                                {changed && <span className="text-xs font-medium text-orange-800 dark:text-orange-300">{t('config.at_startup', { value: formatConfigValue(changed.startup) })}</span>}
                                            </dt>
                                            <dd className="m-0 text-right max-w-56 min-w-0">
                                                <Value value={config.values[key]} yes={t('config.yes')} no={t('config.no')} />
                                            </dd>
                                        </div>
                                    );
                                })}
                            </dl>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ConfigPanel;
