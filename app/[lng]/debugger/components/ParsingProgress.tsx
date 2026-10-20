'use client';

import { CheckCircleIcon, DocumentTextIcon, ExclamationTriangleIcon, MinusCircleIcon } from "@heroicons/react/24/outline";
import { useAnalyzerT } from "./useAnalyzerT";
import { LogHeader } from "../header_parser";
import { formatTime } from "../time";
import { formatFileSize } from "./format";

export const BIG_FILE_SIZE = 150 * 1024 * 1024;

export type ParsingState = {
    read: number,
    thermostats: string[],
    header?: LogHeader,
    /** Thermostats whose configuration was found in an async_setup_entry log */
    setupConfigs: string[],
}

const Step: React.FC<{ ok: boolean, title: string, detail?: string }> = ({ ok, title, detail }) => (
    <li className="flex gap-2.5 items-start">
        {ok
            ? <CheckCircleIcon className="size-5 shrink-0 text-green-700 dark:text-green-400" aria-hidden="true" />
            : <MinusCircleIcon className="size-5 shrink-0 text-slate-400" aria-hidden="true" />}
        <div>
            <div className="font-medium text-slate-900 dark:text-white">{title}</div>
            {detail && <div className="text-sm text-slate-500 dark:text-slate-400">{detail}</div>}
        </div>
    </li>
);

const ParsingProgress: React.FC<{ file: File, state: ParsingState, onCancel: () => void }> = ({ file, state, onCancel }) => {
    const { t, i18n } = useAnalyzerT();
    const percent = file.size > 0 ? Math.min(100, Math.round(state.read / file.size * 100)) : 100;
    const { header } = state;

    return (
        <div className="flex flex-col gap-4 max-w-3xl p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="flex flex-wrap items-center gap-3">
                <DocumentTextIcon className="size-6 shrink-0 text-slate-500" aria-hidden="true" />
                <div className="flex-[1_1_260px] min-w-0">
                    <div className="truncate font-mono text-sm font-medium text-slate-900 dark:text-white">{file.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{formatFileSize(file.size, i18n.language)}</div>
                </div>
                <button type="button" onClick={onCancel} className="min-h-10 px-4 rounded-lg border border-slate-300 dark:border-slate-600 font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                    {t('parsing.cancel')}
                </button>
            </div>

            <div className="flex flex-col gap-1.5">
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
                    <div className="h-full rounded-full bg-blue-600 dark:bg-blue-400 transition-[width]" style={{ width: `${percent}%` }} />
                </div>
                <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>{t('parsing.reading')}</span>
                    <span>{percent} %</span>
                </div>
            </div>

            {file.size > BIG_FILE_SIZE && (
                <div className="flex gap-2.5 items-start p-3 rounded-lg border text-sm border-orange-300 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-200">
                    <ExclamationTriangleIcon className="size-5 shrink-0" aria-hidden="true" />
                    {t('parsing.big_file')}
                </div>
            )}

            <ul className="m-0 p-0 list-none flex flex-col gap-2">
                {header ? <>
                    <Step ok title={t('parsing.header_found')} detail={header.generated ? t('parsing.generated', { date: formatTime(header.generated, { tz: header.timezone, lng: i18n.language, withDate: true }), tz: header.timezone === 'UTC' ? 'UTC' : '' }) : undefined} />
                    <Step ok title={t('parsing.thermostat', { name: header.thermostatName + (header.entityId ? ` (${header.entityId})` : '') })} detail={t('parsing.auto_selected')} />
                    {header.config
                        ? <Step ok title={t('parsing.config_count', { count: Object.keys(header.config).length })} detail={t('parsing.config_tab')} />
                        : <Step ok={false} title={t('parsing.config_invalid')} />}
                    {header.period && <Step ok title={t('parsing.period', {
                        start: formatTime(header.period.start, { tz: header.timezone, lng: i18n.language }),
                        end: formatTime(header.period.end, { tz: header.timezone, lng: i18n.language }),
                        tz: header.timezone === 'UTC' ? 'UTC' : '',
                    })} detail={header.timezone === 'UTC' ? t('parsing.utc') : undefined} />}
                </> : <>
                    <Step ok={false} title={t('parsing.no_header')} detail={t('parsing.no_header_detail')} />
                    {state.setupConfigs.length > 0
                        ? <Step ok title={t('parsing.setup_found', { count: state.setupConfigs.length })} detail={state.setupConfigs.join(', ')} />
                        : <Step ok={false} title={t('parsing.no_setup')} />}
                </>}
            </ul>

            {state.thermostats.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">{t('parsing.thermostats')}</span>
                    {state.thermostats.map(name => (
                        <span key={name} className="px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200">{name}</span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ParsingProgress;
