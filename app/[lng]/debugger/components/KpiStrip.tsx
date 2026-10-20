'use client';

import { useMemo } from "react";
import { useAnalyzerT } from "./useAnalyzerT";
import { LogParser } from "../log_parser";
import { formatDuration } from "../time";
import { formatNumber } from "./format";

const last = <T,>(events: { timestamp: Date, value: T }[]): T | undefined => {
    let found: { timestamp: Date, value: T } | undefined = undefined;
    for (const e of events) {
        if (!found || e.timestamp >= found.timestamp) found = e;
    }
    return found?.value;
};

const KpiStrip: React.FC<{ parser: LogParser, thermostat: string }> = ({ parser, thermostat }) => {
    const { t, i18n } = useAnalyzerT();
    const lng = i18n.language;

    const kpis = useMemo(() => {
        const vtherm = parser.getThermostat(thermostat);
        const counts = parser.getLevelCounts(thermostat);
        const total = counts.DEBUG + counts.INFO + counts.WARNING + counts.ERROR;
        const period = parser.header?.period ?? parser.getTimeBounds();
        const temp = (v?: number) => v === undefined ? '—' : `${formatNumber(v, lng)} °C`;

        const room = vtherm?.room_temps.map(e => e.value) ?? [];
        const hvac = vtherm ? last(vtherm.hvac_mode) : undefined;
        const preset = vtherm ? last(vtherm.preset) : undefined;
        const ext = vtherm ? last(vtherm.ext_temps) : undefined;

        return [
            {
                id: 'period',
                value: period ? formatDuration(period.end.getTime() - period.start.getTime()) : '—',
                sub: parser.header?.period ? t('kpi.from_header') : t('kpi.from_timestamps'),
            },
            {
                id: 'entries',
                value: total.toLocaleString(lng),
                sub: t('kpi.entries_detail', { debug: counts.DEBUG.toLocaleString(lng), info: counts.INFO.toLocaleString(lng) }),
            },
            {
                id: 'problems',
                value: `${counts.WARNING} / ${counts.ERROR}`,
                sub: counts.WARNING + counts.ERROR === 0 ? t('kpi.no_problem') : t('kpi.problems_detail'),
                alert: counts.ERROR > 0,
            },
            {
                id: 'hvac_mode',
                value: hvac ?? '—',
                sub: preset ? t('kpi.preset', { preset }) : '',
            },
            {
                id: 'target',
                value: temp(vtherm ? last(vtherm.target_temps) : undefined),
                sub: t('kpi.last_value'),
            },
            {
                id: 'room',
                value: room.length > 0 ? `${formatNumber(Math.min(...room), lng)} – ${formatNumber(Math.max(...room), lng)} °C` : '—',
                sub: ext !== undefined ? t('kpi.ext', { value: temp(ext) }) : '',
            },
        ];
    }, [parser, thermostat, t, lng]);

    return (
        <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
            {kpis.map(k => (
                <div key={k.id} className="flex flex-col gap-0.5 px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{t(`kpi.${k.id}`)}</span>
                    <span className={`text-lg font-semibold ${k.alert ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{k.value}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{k.sub}</span>
                </div>
            ))}
        </div>
    );
};

export default KpiStrip;
