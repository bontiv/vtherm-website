'use client';

import { CheckIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAnalyzerT } from "./useAnalyzerT";
import { LogParser } from "../log_parser";
import { formatTime, TimeZoneMode } from "../time";
import { formatConfigValue, SUMMARY_FEATURES } from "../config_schema";

type SummaryProps = {
    parser: LogParser,
    thermostat: string,
    displayTz: TimeZoneMode,
    onShowConfig: () => void,
    onShowDiff: () => void,
}

const linkButton = "p-0 border-0 bg-transparent font-semibold underline cursor-pointer text-inherit";

const ThermostatSummary: React.FC<SummaryProps> = ({ parser, thermostat, displayTz, onShowConfig, onShowDiff }) => {
    const { t, i18n } = useAnalyzerT();
    const config = parser.getConfig(thermostat);

    if (!config) {
        return (
            <div className="flex gap-2.5 items-start p-3 rounded-lg border text-sm border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
                <InformationCircleIcon className="size-5 shrink-0" aria-hidden="true" />
                <div>{t('summary.no_config')} <button type="button" className={linkButton} onClick={onShowConfig}>{t('summary.how_to')}</button></div>
            </div>
        );
    }

    const v = config.values;
    const diff = parser.getConfigDiff(thermostat);
    const fmt = (d?: Date) => d ? formatTime(d, { tz: displayTz, lng: i18n.language, withDate: true }) : '';
    const badges: string[] = [];
    if (typeof v.thermostat_type === 'string') badges.push(t(`summary.type.${v.thermostat_type}`, { defaultValue: v.thermostat_type }));
    if (typeof v.ac_mode === 'boolean') badges.push(v.ac_mode ? t('summary.ac') : t('summary.heating'));
    if (typeof v.auto_regulation_mode === 'string') badges.push(t('summary.regulation', { mode: v.auto_regulation_mode.replace('auto_regulation_', '') }));
    if (typeof v.cycle_min === 'number') badges.push(t('summary.cycle', { value: v.cycle_min }));

    const features = SUMMARY_FEATURES
        .filter(f => f.keys.some(k => k in v))
        .map(f => ({ id: f.id, on: f.keys.some(k => v[k] === true) }));

    const sensors = [
        { label: t('summary.sensor_temp'), value: v.temperature_sensor_entity_id },
        { label: t('summary.sensor_ext'), value: v.external_temperature_sensor_entity_id },
        { label: t('summary.underlyings'), value: v.underlying_entity_ids },
    ].filter(s => s.value !== undefined && s.value !== null && s.value !== '');

    return (
        <div className="flex flex-col gap-3.5 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="flex flex-wrap justify-between items-start gap-3">
                <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <strong className="text-lg text-slate-900 dark:text-white">{thermostat}</strong>
                        {badges.map(b => <span key={b} className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{b}</span>)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        {config.source === 'header'
                            ? t('summary.source_header', { date: fmt(config.timestamp) })
                            : t('summary.source_setup', { line: config.line, date: fmt(config.timestamp) })}
                    </div>
                </div>
                <button type="button" onClick={onShowConfig}
                    className="min-h-10 px-4 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                    {t('summary.show_config')}
                </button>
            </div>

            {features.length > 0 && (
                <ul className="m-0 p-0 list-none flex flex-wrap gap-2" aria-label={t('summary.features')}>
                    {features.map(f => (
                        <li key={f.id} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-medium
                            ${f.on ? 'text-green-800 dark:text-green-300' : 'text-slate-500 dark:text-slate-400'}`}>
                            {f.on ? <CheckIcon className="size-3.5" aria-label={t('summary.enabled')} /> : <XMarkIcon className="size-3.5" aria-label={t('summary.disabled')} />}
                            {t(`summary.feature.${f.id}`)}
                        </li>
                    ))}
                </ul>
            )}

            {sensors.length > 0 && (
                <div className="grid gap-x-5 gap-y-2 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
                    {sensors.map(s => (
                        <div key={s.label} className="flex flex-col min-w-0">
                            <span className="text-xs text-slate-500 dark:text-slate-400">{s.label}</span>
                            <span className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all">{formatConfigValue(s.value)}</span>
                        </div>
                    ))}
                </div>
            )}

            {diff.length > 0 && (
                <div className="flex gap-2.5 items-start p-3 rounded-lg border text-sm border-orange-300 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-200">
                    <ExclamationTriangleIcon className="size-5 shrink-0" aria-hidden="true" />
                    <div>
                        {t('summary.diff', { count: diff.length, date: fmt(parser.getStartupConfig(thermostat)?.timestamp) })}{' '}
                        <button type="button" className={linkButton} onClick={onShowDiff}>{t('summary.show_diff')}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThermostatSummary;
