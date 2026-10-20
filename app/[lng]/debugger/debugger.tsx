'use client';

import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from 'next/dynamic';
import { LINES_PER_TICK, LogParser, readLines, yieldToMain, ZoomType } from "./log_parser";
import { TimeZoneMode } from "./time";
import './debugger.css';
import { useAnalyzerT } from "./components/useAnalyzerT";
import DropZone from "./components/DropZone";
import ParsingProgress, { ParsingState } from "./components/ParsingProgress";
import Toolbar from "./components/Toolbar";
import ThermostatSummary from "./components/ThermostatSummary";
import KpiStrip from "./components/KpiStrip";
import FeatureTimeline from "./components/FeatureTimeline";
import LogViewer from "./components/LogViewer";
import ConfigPanel from "./components/ConfigPanel";
// ApexCharts needs window: load the chart on the client only
const LogGraph = dynamic(() => import("./components/LogGraph"), { ssr: false });
const PercentGraph = dynamic(() => import("./components/PercentGraph"), { ssr: false });

type Phase = 'empty' | 'parsing' | 'done';
type Tab = 'analysis' | 'config';

const EMPTY_PARSING: ParsingState = { read: 0, thermostats: [], setupConfigs: [] };

const Debugger: React.FC = () => {
    const { t } = useAnalyzerT();
    const parser = useRef(new LogParser());
    const isAborted = useRef(false);
    const zoomReset = useRef(false);

    const [phase, setPhase] = useState<Phase>('empty');
    const [file, setFile] = useState<File | null>(null);
    const [parsing, setParsing] = useState<ParsingState>(EMPTY_PARSING);
    const [thermostat, setThermostat] = useState<string | undefined>(undefined);
    const [tab, setTab] = useState<Tab>('analysis');
    const [zoom, setZoom] = useState<ZoomType>({ enabled: false });
    const [selected, setSelected] = useState<number | undefined>(undefined);
    const [displayTz, setDisplayTz] = useState<TimeZoneMode>('local');
    const [onlyChanged, setOnlyChanged] = useState(false);

    const analyze = useCallback(async (input: File) => {
        const p = new LogParser();
        parser.current = p;
        isAborted.current = false;
        setFile(input);
        setParsing(EMPTY_PARSING);
        setPhase('parsing');

        let count = 0;
        for await (const { lines, offset } of readLines(input)) {
            for (const line of lines) {
                p.parseLine(line);
                if (++count % LINES_PER_TICK === 0) {
                    await yieldToMain();
                    if (isAborted.current) return;
                }
            }
            if (isAborted.current) return;
            setParsing({ read: offset, thermostats: p.getThermostats(), header: p.header, setupConfigs: p.getSetupConfigThermostats() });
        }
        p.finalize();

        setThermostat(p.header?.thermostatName ?? p.getThermostats()[0]);
        setTab('analysis');
        setZoom({ enabled: false });
        setSelected(undefined);
        setOnlyChanged(false);
        setDisplayTz('local');
        setPhase('done');
    }, []);

    const reset = () => {
        isAborted.current = true;
        setPhase('empty');
        setFile(null);
        setThermostat(undefined);
        parser.current = new LogParser();
    };

    const onZoomChange = (mindate: Date, maxdate: Date) => {
        if (zoomReset.current) {
            zoomReset.current = false;
            setZoom({ enabled: false });
        } else {
            setZoom({ mindate, maxdate, enabled: true });
        }
    };

    const p = parser.current;
    const config = thermostat ? p.getConfig(thermostat) : undefined;

    // Time domain: the export period when known, the logged timestamps otherwise
    const timing = useMemo(() => {
        if (phase !== 'done') return undefined;
        const bounds = p.getTimeBounds();
        const period = p.header?.period;
        if (!bounds && !period) return undefined;
        const start = Math.min(period?.start.getTime() ?? Infinity, bounds?.start.getTime() ?? Infinity);
        const end = Math.max(period?.end.getTime() ?? -Infinity, bounds?.end.getTime() ?? -Infinity);
        return {
            domain: { start, end },
            dataEnd: bounds?.end.getTime() ?? end,
            noDataEnd: period && bounds && bounds.start > period.start ? bounds.start.getTime() : undefined,
        };
    }, [phase, p]);

    const range = timing && (zoom.enabled && zoom.mindate && zoom.maxdate
        ? { start: zoom.mindate.getTime(), end: zoom.maxdate.getTime() }
        : timing.domain);
    const marker = selected !== undefined && !isNaN(p.index.ts[selected])
        ? { ts: p.index.ts[selected], lineNo: p.index.lineNo[selected] }
        : undefined;
    const tempBounds = config && (typeof config.values.temp_min === 'number' || typeof config.values.temp_max === 'number')
        ? { min: config.values.temp_min as number | undefined, max: config.values.temp_max as number | undefined }
        : undefined;
    const configCount = config ? Object.keys(config.values).length : undefined;
    const vtherm = thermostat ? p.getThermostat(thermostat) : undefined;
    const hasPercent = !!vtherm && (vtherm.power_percents.length > 0 || vtherm.valve_open_percents.length > 0 || vtherm.on_percents.length > 0);
    // TRV driven by VTherm: the heating percentage is a valve opening
    const isValve = !!config && (config.values.thermostat_type === 'thermostat_over_valve'
        || config.values.auto_regulation_mode === 'auto_regulation_valve'
        || 'opening_degree_entity_ids' in config.values)
        || (vtherm?.valve_open_percents.length ?? 0) > 0;

    const tabClass = (value: Tab) => `inline-flex items-center gap-2 min-h-11 mr-5 px-1 border-0 border-b-2 bg-transparent text-[15px] font-semibold cursor-pointer
        ${tab === value ? 'border-blue-600 dark:border-blue-400 text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`;

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col gap-1">
                <h1 className="m-0 p-0 text-3xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
                <p className="m-0 text-slate-600 dark:text-slate-300">{t('subtitle')}</p>
            </div>

            {phase === 'empty' && <DropZone onFile={analyze} />}

            {phase === 'parsing' && file && <ParsingProgress file={file} state={parsing} onCancel={reset} />}

            {phase === 'done' && file && (
                <div className="flex flex-col gap-5">
                    <Toolbar
                        file={file}
                        parser={p}
                        thermostat={thermostat}
                        onThermostat={(name) => { setThermostat(name); setSelected(undefined); setOnlyChanged(false); }}
                        zoom={zoom}
                        onZoomReset={() => setZoom({ enabled: false })}
                        displayTz={displayTz}
                        onDisplayTz={setDisplayTz}
                        onChangeFile={reset}
                    />

                    {!thermostat ? (
                        <div className="p-6 text-center text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700">{t('no_thermostat')}</div>
                    ) : <>
                        <div className="flex border-b border-slate-200 dark:border-slate-700" role="tablist">
                            <button type="button" role="tab" aria-selected={tab === 'analysis'} className={tabClass('analysis')} onClick={() => setTab('analysis')}>
                                {t('tabs.analysis')}
                            </button>
                            <button type="button" role="tab" aria-selected={tab === 'config'} className={tabClass('config')} onClick={() => setTab('config')}>
                                {t('tabs.config')}
                                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${configCount !== undefined ? 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                    {configCount ?? '—'}
                                </span>
                            </button>
                        </div>

                        {tab === 'analysis' && timing && range && (
                            <div className="flex flex-col gap-5" role="tabpanel">
                                <ThermostatSummary
                                    parser={p}
                                    thermostat={thermostat}
                                    displayTz={displayTz}
                                    onShowConfig={() => { setOnlyChanged(false); setTab('config'); }}
                                    onShowDiff={() => { setOnlyChanged(true); setTab('config'); }}
                                />
                                <KpiStrip parser={p} thermostat={thermostat} />
                                <div className="flex flex-col gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                                    <LogGraph
                                        parser={p}
                                        thermostat={thermostat}
                                        domain={timing.domain}
                                        zoom={zoom}
                                        onZoomChange={onZoomChange}
                                        onZoomReset={() => { zoomReset.current = true; }}
                                        displayTz={displayTz}
                                        noDataEnd={timing.noDataEnd}
                                        marker={marker}
                                        bounds={tempBounds}
                                    />
                                    {hasPercent && (
                                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                            <PercentGraph
                                                parser={p}
                                                thermostat={thermostat}
                                                domain={timing.domain}
                                                dataEnd={timing.dataEnd}
                                                zoom={zoom}
                                                onZoomChange={onZoomChange}
                                                onZoomReset={() => { zoomReset.current = true; }}
                                                displayTz={displayTz}
                                                marker={marker}
                                                valve={isValve}
                                            />
                                        </div>
                                    )}
                                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                        <FeatureTimeline
                                            parser={p}
                                            thermostat={thermostat}
                                            range={range}
                                            dataEnd={timing.dataEnd}
                                            noDataEnd={timing.noDataEnd}
                                            marker={marker?.ts}
                                            displayTz={displayTz}
                                            config={config?.values}
                                        />
                                    </div>
                                </div>
                                <LogViewer
                                    parser={p}
                                    thermostat={thermostat}
                                    zoom={zoom}
                                    selected={selected}
                                    onSelect={setSelected}
                                    displayTz={displayTz}
                                    fileName={file.name}
                                />
                            </div>
                        )}

                        {tab === 'config' && (
                            <div role="tabpanel">
                                <ConfigPanel
                                    parser={p}
                                    thermostat={thermostat}
                                    displayTz={displayTz}
                                    onlyChanged={onlyChanged}
                                    onOnlyChanged={setOnlyChanged}
                                    onBack={() => setTab('analysis')}
                                />
                            </div>
                        )}
                    </>}
                </div>
            )}
        </div>
    );
}

export default Debugger;
