'use client';

import { useMemo } from "react";
import { useAnalyzerT } from "./useAnalyzerT";
import { FeatureState, LogParser } from "../log_parser";
import { buildFeatureSegments, buildSegments, Segment, underlyingEntities } from "../feature_series";
import { formatTime, TimeZoneMode } from "../time";

type TimelineProps = {
    parser: LogParser,
    thermostat: string,
    /** Visible range (zoom aware) */
    range: { start: number, end: number },
    /** Last timestamp of the file: end of the last segment of each row */
    dataEnd: number,
    noDataEnd?: number,
    marker?: number,
    displayTz: TimeZoneMode,
    config?: Record<string, unknown>,
}

type Row = {
    id: string,
    /** Translation key of the label (graph.<kind>) and kind of values */
    kind: string,
    sub?: string,
    segments: Segment<string | FeatureState>[],
    disabled: boolean,
}

const HVAC_COLORS: Record<string, string> = {
    heat: 'bg-orange-500 text-white',
    cool: 'bg-blue-600 text-white',
    off: 'bg-slate-500 text-white',
    auto: 'bg-teal-600 text-white',
    heat_cool: 'bg-teal-600 text-white',
    dry: 'bg-amber-300 text-slate-900',
    fan_only: 'bg-cyan-300 text-slate-900',
};
const HVAC_ACTION_COLORS: Record<string, string> = {
    heating: 'bg-orange-500 text-white',
    preheating: 'bg-orange-300 text-slate-950',
    cooling: 'bg-blue-600 text-white',
    drying: 'bg-amber-300 text-slate-900',
    fan: 'bg-cyan-300 text-slate-900',
    idle: 'bg-slate-300 text-slate-900 dark:bg-slate-600 dark:text-white',
    off: 'bg-slate-500 text-white',
};
const PRESET_COLORS = [
    'bg-indigo-300 text-indigo-950', 'bg-emerald-300 text-emerald-950', 'bg-sky-300 text-sky-950',
    'bg-pink-300 text-pink-950', 'bg-lime-300 text-lime-950', 'bg-violet-300 text-violet-950',
];

function presetColor(value: string): string {
    let hash = 0;
    for (const c of value) hash = (hash * 31 + c.charCodeAt(0)) | 0;
    return PRESET_COLORS[Math.abs(hash) % PRESET_COLORS.length];
}

const FeatureTimeline: React.FC<TimelineProps> = ({ parser, thermostat, range, dataEnd, noDataEnd, marker, displayTz, config }) => {
    const { t, i18n } = useAnalyzerT();
    const span = Math.max(1, range.end - range.start);
    const pct = (ts: number) => (ts - range.start) / span * 100;
    const fmt = (ts: number, withSeconds = true) => formatTime(ts, { tz: displayTz, lng: i18n.language, withSeconds });

    const rows: Row[] = useMemo(() => {
        const vtherm = parser.getThermostat(thermostat);
        if (!vtherm) return [];
        const disabled = (key: string) => config?.[key] === false;

        // One "HVAC action" row per underlying climate: a VTherm may drive several devices,
        // each one reporting its own hvac_action. Configured underlyings without any event still get a row.
        const isClimate = config?.thermostat_type === 'thermostat_over_climate';
        const entities = underlyingEntities(config, vtherm.underlying_hvac_actions);
        const actionRows: Row[] = entities.map(entity => ({
            id: `hvac_action:${entity}`,
            kind: 'hvac_action',
            sub: entity,
            segments: buildSegments(vtherm.underlying_hvac_actions.filter(a => a.entity === entity), dataEnd),
            disabled: false,
        }));
        if (actionRows.length === 0 && isClimate) {
            actionRows.push({ id: 'hvac_action', kind: 'hvac_action', sub: t('timeline.underlying'), segments: [], disabled: false });
        }

        return [
            { id: 'hvac_mode', kind: 'hvac_mode', segments: buildSegments(vtherm.hvac_mode, dataEnd), disabled: false },
            ...actionRows,
            { id: 'preset', kind: 'preset', segments: buildSegments(vtherm.preset, dataEnd), disabled: false },
            { id: 'startstop_state', kind: 'startstop_state', segments: buildFeatureSegments(vtherm.startstop_state, dataEnd), disabled: disabled('use_auto_start_stop_feature') },
            { id: 'safety', kind: 'safety', segments: buildFeatureSegments(vtherm.safety_state, dataEnd), disabled: false },
            { id: 'window', kind: 'window', segments: buildFeatureSegments(vtherm.window_state, dataEnd), disabled: disabled('use_window_feature') },
        ];
    }, [parser, thermostat, dataEnd, config, t]);

    const segmentStyle = (row: Row, value: string | FeatureState): string => {
        if (row.kind === 'hvac_mode') return HVAC_COLORS[String(value)] ?? 'bg-slate-300 text-slate-900';
        if (row.kind === 'hvac_action') return HVAC_ACTION_COLORS[String(value)] ?? 'bg-slate-300 text-slate-900';
        if (row.kind === 'preset') return presetColor(String(value));
        return value === FeatureState.BYPASS ? 'bg-amber-400 text-slate-950' : 'bg-red-600 text-white';
    };

    const segmentLabel = (row: Row, value: string | FeatureState): string => {
        if (row.kind === 'hvac_mode' || row.kind === 'hvac_action' || row.kind === 'preset') return String(value);
        return value === FeatureState.BYPASS ? t('graph.bypass') : t('graph.trigger');
    };

    const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => range.start + f * span);
    const noDataStart = Math.max(range.start, 0);
    const showNoData = noDataEnd !== undefined && noDataEnd > range.start;
    const markerVisible = marker !== undefined && marker >= range.start && marker <= range.end;

    return (
        <div className="flex flex-col gap-1.5">
            <h2 className="m-0 mb-1 p-0 text-base font-semibold text-slate-900 dark:text-white">{t('graph.title_feature')}</h2>
            {rows.map(row => {
                const visible = row.segments.filter(s => s.end > range.start && s.start < range.end);
                return (
                    <div key={row.id} className="grid grid-cols-[110px_minmax(0,1fr)] sm:grid-cols-[150px_minmax(0,1fr)] gap-1.5 items-center">
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{t(`graph.${row.kind}`)}</span>
                            {row.sub && <span className="truncate font-mono text-[11px] text-slate-500 dark:text-slate-400" title={row.sub}>{row.sub}</span>}
                            {row.disabled && <span className="text-xs text-slate-500 dark:text-slate-400">{t('timeline.disabled_short')}</span>}
                        </div>
                        <div className="relative h-7 rounded-md bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            {showNoData && <div className="absolute inset-y-0 vt-hatch" style={{ left: `${pct(noDataStart)}%`, width: `${pct(noDataEnd!) - pct(noDataStart)}%` }} title={t('graph.no_data', { time: fmt(noDataEnd!) })} />}
                            {row.disabled ? (
                                <div className="absolute inset-0 flex items-center px-2 vt-hatch text-xs whitespace-nowrap overflow-hidden text-slate-600 dark:text-slate-300">
                                    {t('timeline.disabled')}
                                </div>
                            ) : visible.length === 0 ? (
                                <span className="absolute inset-y-0 flex items-center pl-2 text-xs whitespace-nowrap text-slate-500 dark:text-slate-400" style={{ left: showNoData ? `${pct(noDataEnd!)}%` : 0 }}>{t('timeline.no_event')}</span>
                            ) : visible.map(s => {
                                const left = Math.max(0, pct(s.start));
                                const right = Math.min(100, pct(s.end));
                                const label = segmentLabel(row, s.value);
                                return (
                                    <div key={s.start}
                                        className={`absolute top-0.5 bottom-0.5 flex items-center px-1.5 rounded text-xs font-semibold whitespace-nowrap overflow-hidden ${segmentStyle(row, s.value)}`}
                                        style={{ left: `${left}%`, width: `${Math.max(0.3, right - left)}%` }}
                                        title={`${label} : ${fmt(s.start)} → ${fmt(s.end)}`}>
                                        {label}
                                    </div>
                                );
                            })}
                            {markerVisible && <div className="absolute -inset-y-px border-l-2 border-blue-600 dark:border-blue-400" style={{ left: `${pct(marker!)}%` }} />}
                        </div>
                    </div>
                );
            })}
            <div className="grid grid-cols-[110px_minmax(0,1fr)] sm:grid-cols-[150px_minmax(0,1fr)] gap-1.5">
                <span />
                <div className="relative h-5 text-xs text-slate-500 dark:text-slate-400">
                    {ticks.map((tick, i) => (
                        <span key={i} className={`absolute top-0.5 whitespace-nowrap ${i % 2 === 1 ? 'hidden sm:inline' : ''}`}
                            style={i === 0 ? { left: 0 } : i === ticks.length - 1 ? { right: 0 } : { left: `${pct(tick)}%`, transform: 'translateX(-50%)' }}>
                            {fmt(tick, false)}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeatureTimeline;
