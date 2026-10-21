'use client';

import { DocumentTextIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAnalyzerT } from "./useAnalyzerT";
import { LogParser, ZoomType } from "../log_parser";
import { formatTime, TimeZoneMode } from "../time";
import { formatFileSize } from "./format";

type ToolbarProps = {
    file: File,
    parser: LogParser,
    thermostat?: string,
    onThermostat: (name: string) => void,
    zoom: ZoomType,
    onZoomReset: () => void,
    displayTz: TimeZoneMode,
    onDisplayTz: (tz: TimeZoneMode) => void,
    onChangeFile: () => void,
}

const Toolbar: React.FC<ToolbarProps> = ({ file, parser, thermostat, onThermostat, zoom, onZoomReset, displayTz, onDisplayTz, onChangeFile }) => {
    const { t, i18n } = useAnalyzerT();
    const { header } = parser;
    const period = parser.getAnalysisPeriod();
    const fmt = (d: Date) => formatTime(d, { tz: displayTz, lng: i18n.language, withSeconds: false });
    const thermostats = parser.getThermostats();
    const singleFromHeader = header && thermostats.length === 1 && thermostats[0] === header.thermostatName;

    return (
        <div className="md:sticky md:top-[4.5rem] z-30 flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
            <div className="flex items-center gap-2.5 min-w-0 flex-[1_1_260px]">
                <DocumentTextIcon className="size-5 shrink-0 text-slate-500" aria-hidden="true" />
                <div className="min-w-0">
                    <div className="truncate font-mono text-sm font-medium text-slate-900 dark:text-white" title={file.name}>{file.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        {t('toolbar.file_meta', { size: formatFileSize(file.size, i18n.language), lines: parser.index.length.toLocaleString(i18n.language) })}
                    </div>
                </div>
                {header && <span className="shrink-0 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200">{t('toolbar.export_badge')}</span>}
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">{t('toolbar.thermostat')}</span>
                {singleFromHeader ? (
                    <div className="flex flex-col leading-tight">
                        <strong className="text-sm text-slate-900 dark:text-white">{header.thermostatName}</strong>
                        {header.entityId && <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{header.entityId}</span>}
                    </div>
                ) : (
                    <select
                        aria-label={t('toolbar.thermostat')}
                        value={thermostat ?? ''}
                        onChange={(e) => onThermostat(e.target.value)}
                        className="min-h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                    >
                        {thermostats.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {period && <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {t('toolbar.period', { start: fmt(period.start), end: fmt(period.end) })}
                </span>}
                {zoom.enabled && zoom.mindate && zoom.maxdate && (
                    <button type="button" onClick={onZoomReset} title={t('toolbar.zoom_reset')}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-blue-300 dark:border-blue-700 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer">
                        {t('toolbar.zoom', { start: fmt(zoom.mindate), end: fmt(zoom.maxdate) })}
                        <XMarkIcon className="size-3.5" aria-label={t('toolbar.zoom_reset')} />
                    </button>
                )}
            </div>

            {parser.timezone === 'UTC' && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400" title={t('toolbar.tz_hint')}>{t('toolbar.tz')}</span>
                    <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden" role="group" aria-label={t('toolbar.tz')}>
                        {(['UTC', 'local'] as TimeZoneMode[]).map(tz => (
                            <button key={tz} type="button" aria-pressed={displayTz === tz} onClick={() => onDisplayTz(tz)}
                                className={`min-h-8 px-3 text-sm font-medium cursor-pointer ${displayTz === tz ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-slate-950' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                {tz === 'UTC' ? 'UTC' : t('toolbar.tz_local')}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <button type="button" onClick={onChangeFile}
                className="min-h-10 px-4 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                {t('toolbar.change_file')}
            </button>
        </div>
    );
};

export default Toolbar;
