'use client';

import { useEffect, useMemo, useState } from "react";
import { ArrowDownTrayIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useAnalyzerT } from "./useAnalyzerT";
import { advFilterLog, LogParser, yieldToMain, ZoomType } from "../log_parser";
import { LOG_LEVELS, NO_THERMOSTAT } from "../log_index";
import { formatTime, TimeZoneMode } from "../time";
import VirtualList from "./VirtualList";

const ROW_HEIGHT = 24;
const FILTER_SLICE = 50_000;
const LINE_RE = /^\S+ \S+\s+\w+\s+(?:\(\w+\)\s+)?\[\s*([^\]]*?)\s*\]\s?(.*)$/;

const LEVEL_STYLES = [
    'text-slate-500 dark:text-slate-400',
    'text-green-700 dark:text-green-400',
    'text-amber-700 dark:text-amber-400',
    'text-red-700 dark:text-red-400 font-bold',
];
const LEVEL_DOTS = ['bg-slate-400', 'bg-green-600', 'bg-amber-500', 'bg-red-600'];

type LogViewerProps = {
    parser: LogParser,
    thermostat: string,
    zoom: ZoomType,
    /** Position in the parser index of the selected line */
    selected?: number,
    onSelect: (index: number) => void,
    displayTz: TimeZoneMode,
    fileName: string,
}

function splitLine(line: string): { source: string, message: string } {
    const match = line.match(LINE_RE);
    if (!match) return { source: "", message: line };
    const source = match[1].replace(/^custom_components\.versatile_thermostat\.?/, '') || 'versatile_thermostat';
    return { source, message: match[2] };
}

const LogViewer: React.FC<LogViewerProps> = ({ parser, thermostat, zoom, selected, onSelect, displayTz, fileName }) => {
    const { t, i18n } = useAnalyzerT();
    const { index } = parser;
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [regexMode, setRegexMode] = useState(false);
    const [levels, setLevels] = useState([true, true, true, true]);
    const [noise, setNoise] = useState(false);
    const [filtered, setFiltered] = useState<number[]>([]);
    const [filtering, setFiltering] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(timer);
    }, [query]);

    const thermoIdx = parser.getThermostatIndex(thermostat);

    const matcher = useMemo((): { test?: (line: string) => boolean, error: boolean } => {
        if (!debouncedQuery) return { error: false };
        if (regexMode) {
            try {
                const re = new RegExp(debouncedQuery, 'i');
                return { test: (line) => re.test(line), error: false };
            } catch {
                return { error: true };
            }
        }
        const needle = debouncedQuery.toLowerCase();
        return { test: (line) => line.toLowerCase().includes(needle), error: false };
    }, [debouncedQuery, regexMode]);

    const counts = useMemo(() => {
        const result = [0, 0, 0, 0];
        for (let i = 0; i < index.length; i++) {
            const th = index.thermo[i];
            if (isNaN(index.ts[i]) || (th !== NO_THERMOSTAT && th !== thermoIdx)) continue;
            result[index.level[i]]++;
        }
        return result;
    }, [index, thermoIdx]);

    useEffect(() => {
        let cancelled = false;
        const min = zoom.enabled ? zoom.mindate?.getTime() ?? -Infinity : -Infinity;
        const max = zoom.enabled ? zoom.maxdate?.getTime() ?? Infinity : Infinity;

        const run = async () => {
            setFiltering(true);
            const out: number[] = [];
            let lastTs = NaN;
            for (let i = 0; i < index.length; i++) {
                if (i > 0 && i % FILTER_SLICE === 0) {
                    await yieldToMain();
                    if (cancelled) return;
                }
                const ts = isNaN(index.ts[i]) ? lastTs : index.ts[i];
                lastTs = ts;
                const th = index.thermo[i];
                if (th !== NO_THERMOSTAT && th !== thermoIdx) continue;
                if (!levels[index.level[i]]) continue;
                if (!isNaN(ts) && (ts < min || ts > max)) continue;
                const line = index.lines[i];
                if (noise && advFilterLog(line)) continue;
                if (matcher.test && !matcher.test(line)) continue;
                out.push(i);
            }
            if (!cancelled) {
                setFiltered(out);
                setFiltering(false);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [index, thermoIdx, levels, noise, matcher, zoom]);

    const selectedPosition = useMemo(() => selected === undefined ? undefined : filtered.indexOf(selected), [filtered, selected]);

    const exportExtract = () => {
        const lines = filtered.map(i => index.lines[i]);
        const content = (parser.header ? parser.header.rawText + '\n\n' : '') + lines.join('\n') + '\n';
        const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName.replace(/\.(log|txt)$/i, '') + '_extract.log';
        a.click();
        URL.revokeObjectURL(url);
    };

    const renderRow = (position: number) => {
        const i = filtered[position];
        const line = index.lines[i];
        const ts = index.ts[i];
        const level = index.level[i];
        const { source, message } = isNaN(ts) ? { source: "", message: line } : splitLine(line);
        const isSelected = i === selected;
        return (
            <button
                key={i}
                type="button"
                onClick={() => onSelect(i)}
                aria-pressed={isSelected}
                className={`grid grid-cols-[56px_100px_72px_190px_auto] gap-2.5 items-center w-full px-3 text-left font-mono text-xs whitespace-nowrap cursor-pointer border-0
                    ${isSelected ? 'bg-blue-100 dark:bg-blue-900/60' : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                style={{ height: ROW_HEIGHT }}
            >
                <span className="text-right text-slate-400 dark:text-slate-500">{index.lineNo[i]}</span>
                <span className="text-slate-600 dark:text-slate-300">{isNaN(ts) ? '' : formatTime(ts, { tz: displayTz, lng: i18n.language, withMs: true })}</span>
                <span className={LEVEL_STYLES[level]}>{isNaN(ts) ? '' : LOG_LEVELS[level]}</span>
                <span className="truncate text-slate-500 dark:text-slate-400" title={source}>{source}</span>
                <span className={`pr-4 ${isNaN(ts) ? 'italic text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>{message}</span>
            </button>
        );
    };

    return (
        <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2.5 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <h2 className="m-0 p-0 mr-1 text-base font-semibold text-slate-900 dark:text-white">{t('logs.title')}</h2>
                <div className={`flex items-center flex-[1_1_220px] max-w-sm rounded-lg border bg-white dark:bg-slate-800 ${matcher.error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}>
                    <MagnifyingGlassIcon className="size-4 ml-2.5 shrink-0 text-slate-400" aria-hidden="true" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('logs.search')}
                        aria-label={t('logs.search')}
                        aria-invalid={matcher.error}
                        className="flex-1 min-w-0 min-h-10 px-2 bg-transparent text-sm text-slate-900 dark:text-white outline-none"
                    />
                    <button type="button" onClick={() => setRegexMode(r => !r)} aria-pressed={regexMode} title={t('logs.regex')}
                        className={`mr-1 px-2 py-1 rounded font-mono text-xs font-semibold cursor-pointer ${regexMode ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-slate-950' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                        .*
                    </button>
                </div>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('logs.levels')}>
                    {LOG_LEVELS.map((name, i) => (
                        <button key={name} type="button" disabled={counts[i] === 0} aria-pressed={levels[i] && counts[i] > 0}
                            onClick={() => setLevels(l => l.map((v, j) => j === i ? !v : v))}
                            className={`inline-flex items-center gap-1.5 min-h-8 px-2.5 rounded-full border text-xs font-semibold cursor-pointer disabled:opacity-45 disabled:cursor-default
                                ${levels[i] && counts[i] > 0 ? 'border-slate-400 bg-slate-100 text-slate-900 dark:border-slate-500 dark:bg-slate-800 dark:text-white' : 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400'}`}>
                            <span className={`size-2 rounded-full ${LEVEL_DOTS[i]}`} aria-hidden="true" />
                            {name}
                            <span className="font-normal text-slate-500 dark:text-slate-400">{counts[i].toLocaleString(i18n.language)}</span>
                        </button>
                    ))}
                </div>
                <label className="inline-flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                    <input type="checkbox" checked={noise} onChange={() => setNoise(n => !n)} />
                    {t('logs.noise')}
                </label>
                <span className="flex-1" />
                <button type="button" onClick={exportExtract} disabled={filtered.length === 0}
                    className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-45">
                    <ArrowDownTrayIcon className="size-4" aria-hidden="true" />
                    {t('logs.export')}
                </button>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 px-4 py-2 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <span aria-live="polite">{filtering ? t('logs.filtering') : t('logs.count', { shown: filtered.length.toLocaleString(i18n.language), total: index.length.toLocaleString(i18n.language) })}</span>
                {matcher.error && <span className="text-red-700 dark:text-red-400">{t('logs.regex_error')}</span>}
                {zoom.enabled && zoom.mindate && zoom.maxdate && <span>{t('logs.zoom', {
                    start: formatTime(zoom.mindate, { tz: displayTz, lng: i18n.language, withSeconds: false }),
                    end: formatTime(zoom.maxdate, { tz: displayTz, lng: i18n.language, withSeconds: false }),
                })}</span>}
                <span>{t('logs.click_hint')}</span>
            </div>
            {filtered.length === 0 && !filtering
                ? <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">{t('logs.empty')}</div>
                : <VirtualList count={filtered.length} rowHeight={ROW_HEIGHT} renderRow={renderRow} scrollToPosition={selectedPosition} className="h-[60vh] min-h-80" />}
        </div>
    );
};

export default LogViewer;
