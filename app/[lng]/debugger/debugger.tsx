'use client';

import { useEffect, useRef, useState, memo, useCallback, ChangeEventHandler, RefObject } from "react";
import Chart from "react-apexcharts";
import { LogParser } from "./log_parser";
import './debugger.css';
import type { ApexOptions } from 'apexcharts';
import { useT } from "@/app/i18n/client";

interface ZoomRange {
    min: number;
    max: number;
}

type ZoomType = {
    mindate?: Date,
    maxdate?: Date,
    enabled: boolean
}

type LogData = {
    size: number,
    read_size: number,
    climates: string[],
    state: "empty" | "running" | "finished",
}


const CHUNK_SIZE = 2 * 1024 * 1024; // 2 Mo par chunk
const LINES_PER_TICK = 500;         // lignes traitées avant de céder le thread + mise à jour de la progression

type ZoomCallback = (datemin: Date, datemax: Date) => void


/** Lit un Blob en texte de façon asynchrone */
function readBlobAsText(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(blob);
    });
}


/** Cède le contrôle au navigateur (évite le freeze) */
function yieldToMain(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
}


const Graph: React.FC<{ logfile: LogParser, selectedThermostat: string, onZoomChange?: ZoomCallback, zoom?: ZoomType, onZoomReset?: () => void }> = ({ logfile, selectedThermostat, onZoomChange, zoom, onZoomReset }) => {
    const { t, i18n } = useT('analyzer');
    const series: ApexOptions['series'] = [
        {
            name: t('graph.target'),
            data: logfile.getThermostat(selectedThermostat)?.target_temps.map(event => ({
                x: event.timestamp,
                y: event.value,
            }))
                .sort((a, b) => a.x.getTime() - b.x.getTime()) || [],
            type: 'area',
        },
        {
            name: t('graph.room_temp'),
            data: logfile.getThermostat(selectedThermostat)?.room_temps.map(event => ({ x: event.timestamp, y: event.value })).sort((a, b) => a.x.getTime() - b.x.getTime()) || []
        },
        {
            name: t('graph.ext_temp'),
            data: logfile.getThermostat(selectedThermostat)?.ext_temps.map(event => ({ x: event.timestamp, y: event.value })).sort((a, b) => a.x.getTime() - b.x.getTime()) || []
        },
        {
            name: t('graph.underlying_setpoint'),
            data: logfile.getThermostat(selectedThermostat)?.underlying_setpoints.map(event => ({ x: event.timestamp, y: event.value })).sort((a, b) => a.x.getTime() - b.x.getTime()) || []
        },
        {
            name: t('graph.underlying_temp'),
            data: logfile.getThermostat(selectedThermostat)?.underlying_temps.map(event => ({ x: event.timestamp, y: event.value })).sort((a, b) => a.x.getTime() - b.x.getTime()) || []
        },
        {
            name: t('graph.regulated_temp'),
            data: logfile.getThermostat(selectedThermostat)?.regulated_temps.map(event => ({ x: event.timestamp, y: event.value })).sort((a, b) => a.x.getTime() - b.x.getTime()) || []
        },
    ];

    function handleZoomChange(chartContext: any, { xaxis }: { xaxis: ZoomRange }) {
        const dateMin = new Date(xaxis.min);
        const dateMax = new Date(xaxis.max);
        onZoomChange && onZoomChange(dateMin, dateMax);
    }

    console.log('Series', series);
    console.log('Other states', logfile.getThermostat(selectedThermostat)?.window_state);

    const xaxis: ApexOptions['xaxis'] = {
        type: 'datetime',
        title: { text: 'Time' },
        labels: { format: 'HH:mm:ss' },
        min: zoom?.enabled ? zoom?.mindate?.getTime() : undefined,
        max: zoom?.enabled ? zoom?.maxdate?.getTime() : undefined,
        tooltip: {
            formatter: (value, opts) => new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)),
        }
    };

    return (
        <div className="w-full">
            <Chart
                options={{
                    chart: {
                        id: 'log-chart',
                        group: 'log-charts',
                        type: 'line',
                        zoom: { enabled: true },
                        events: {
                            zoomed: handleZoomChange,
                            scrolled: handleZoomChange,
                            beforeResetZoom: onZoomReset
                        },
                    },
                    fill: {
                        opacity: [0.3, 1, 1, 1, 1, 1]
                    },
                    xaxis,
                    stroke: { curve: 'stepline', width: 2 },
                    title: { text: t('graph.title_logs'), align: 'left' },
                    colors: ['#FEB019', '#008FFB', '#00E396', '#8D5B4C', '#775DD0', '#3f51b5', '#33b2df', '#546E7A', 'd4526e', '#A5978B', '#4ecdc4'],
                }}
                series={series}
                type="line"
                height={350}
            />
            <Chart
                type="area"
                height={200}
                options={{
                    chart: {
                        id: 'feat-chart',
                        // group: 'log-charts',
                        type: 'line',
                        zoom: { enabled: true },
                        events: {
                            zoomed: handleZoomChange,
                            scrolled: handleZoomChange,
                            beforeResetZoom: onZoomReset
                        },
                    },
                    title: {
                        text: t('graph.title_feature')
                    },
                    legend: {
                        show: true,
                    },
                    dataLabels: {
                        enabled: false,
                    },
                    xaxis,
                    stroke: { curve: 'stepline', width: 2 },
                    yaxis: {
                        labels: {
                            formatter: (val) => {
                                if (val == 1) return "ON";
                                if (val == 0) return "OFF";
                                if (val == -1) return "BYPASS";
                                return val.toString();
                            }
                        },
                        stepSize: 1,
                        min: -1,
                        max: 1,
                    }
                }}
                series={[
                    {
                        name: t('graph.window'),
                        data: logfile.getThermostat(selectedThermostat)?.window_state.map(event => ({ x: event.timestamp, y: event.value })).sort((a, b) => a.x.getTime() - b.x.getTime()) || []
                    },
                    {
                        name: t('graph.safety'),
                        data: logfile.getThermostat(selectedThermostat)?.safety_state.map(event => ({ x: event.timestamp, y: event.value })).sort((a, b) => a.x.getTime() - b.x.getTime()) || [],
                        color: 'red'
                    }
                ]}
            />
        </div>
    );
}

const EditorV2: React.FC<{
    parser: LogParser,
    climate?: string,
    file_input: RefObject<HTMLInputElement | null>,
    zoom: ZoomType
}> = memo(({ parser, climate, file_input, zoom }) => {
    const inref = useRef<HTMLDivElement>(null);

    const write_log = useCallback(async (file: File, edit_div: HTMLDivElement) => {
        let offset = 0;
        let leftover = "";

        edit_div.innerText = ''

        while (offset < file.size) {
            const chunk = file.slice(offset, offset + CHUNK_SIZE);
            const text = await readBlobAsText(chunk);
            offset += chunk.size;

            // Découper en lignes en conservant le reste incomplet
            const combined = leftover + text;
            const lines = combined.split("\n");
            leftover = lines.pop() ?? ""; // la dernière portion peut être incomplète


            // Traiter les lignes par petits lots pour ne pas bloquer le thread
            for (let i = 0; i < lines.length; i++) {

                //parseLine(lines[i]);
                const { climate: log_climate, level, date, txt } = parser.getLogTextInfos(lines[i])

                if (log_climate == '' || climate == log_climate) {
                    if (!zoom.enabled || !date || (zoom.mindate && date > zoom.mindate && zoom.maxdate && date < zoom.maxdate)) {
                        const pl = document.createElement('p');
                        pl.appendChild(document.createTextNode(txt));
                        if (level == 'INFO') pl.className = 'text-green-500 info';
                        if (level == 'WARNING') pl.className = 'text-yellow-500 warning';
                        if (level == 'ERROR') pl.className = 'text-red-500 error';
                        edit_div.appendChild(pl)
                    } else {
                        console
                    }
                }

                // Cède le contrôle + met à jour la progression tous les LINES_PER_TICK
                if ((i + 1) % LINES_PER_TICK === 0) {
                    // TOTO: updateProgress();
                    await yieldToMain();
                }
            }
        }
    }, [zoom]);

    useEffect(() => {
        if (!inref.current) {
            console.warn('EDITOR - Div not ready');
            return;
        }
        if (!file_input?.current?.files?.length) {
            console.warn('EDITOR - File not ready');
            return;
        }
        if (!climate) {
            console.warn('EDITOR - No climate selected');
            return;
        };
        write_log(file_input.current.files[0], inref.current);
    }, [climate, zoom, file_input.current])

    return <div ref={inref} className="debugger">
    </div>
})

const Debugger: React.FC = () => {
    const [logData, SetLogData] = useState<LogData>({
        size: 0,
        read_size: 0,
        climates: [],
        state: "empty"
    })
    const parser = useRef(new LogParser());
    const [zoom, setZoom] = useState<ZoomType>({ enabled: false })
    const [selectedThermostat, setSelectedThermostat] = useState<string | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const zoom_reset = useRef(false)
    const isAborted = useRef(false)
    const { t } = useT('analyzer')

    const onZoomChange = (mindate: Date, maxdate: Date) => {
        console.log('Zoom change ', mindate, maxdate, String(zoom_reset.current))
        if (zoom_reset.current) {
            zoom_reset.current = false
            setZoom({
                enabled: false
            })
        } else {
            setZoom({
                mindate,
                maxdate,
                enabled: true
            })
        }
    };

    const onZoomReset = () => {
        zoom_reset.current = true
    };

    const fileParser = useCallback(async (file: File) => {
        let offset = 0;
        let leftover = "";
        parser.current = new LogParser();

        // Reset l'annulation
        isAborted.current = false;
        SetLogData({
            size: file.size,
            read_size: 0,
            climates: [],
            state: "running"
        })

        while (offset < file.size) {
            const chunk = file.slice(offset, offset + CHUNK_SIZE);
            const text = await readBlobAsText(chunk);
            offset += chunk.size;

            if (isAborted.current) break;


            // Découper en lignes en conservant le reste incomplet
            const combined = leftover + text;
            const lines = combined.split("\n");
            leftover = lines.pop() ?? ""; // la dernière portion peut être incomplète


            // Traiter les lignes par petits lots pour ne pas bloquer le thread
            for (let i = 0; i < lines.length; i++) {

                //parseLine(lines[i]);
                parser.current.parseLine(lines[i]);

                // Cède le contrôle + met à jour la progression tous les LINES_PER_TICK
                if ((i + 1) % LINES_PER_TICK === 0) {
                    // TOTO: updateProgress();
                    await yieldToMain();
                }
            }

            SetLogData(x => ({ ...x, climates: parser.current.getThermostats(), read_size: offset }))
        }

        SetLogData(x => ({
            ...x,
            state: "finished"
        }));

    }, []);

    const onChange: ChangeEventHandler<HTMLInputElement> = (evt) => {
        if (evt.target.files && evt.target.files.length > 0) {
            if (evt.target.files.length == 1) {
                fileParser(evt.target.files[0]);
                return
            }
            evt.target.files[0].text().then(content => {
                const parser = new LogParser(content);
                //setLogfile(parser);
                setSelectedThermostat(parser.getThermostats()[0] || undefined);
                setZoom({ enabled: false })
            });
        }
    };

    const onReset: ChangeEventHandler<HTMLFormElement> = () => {
        //setLogfile(null);
        SetLogData({
            size: 0,
            read_size: 0,
            climates: [],
            state: "empty"
        });
        setZoom({ enabled: false });
        isAborted.current = true;
    }

    const onSubmit: ChangeEventHandler<HTMLFormElement> = (evt) => {
        evt.preventDefault();
        if (fileInputRef.current?.files)
            fileParser(fileInputRef.current?.files[0]);
    }

    return (
        <div className="p-6 flex flex-col items-start gap-6">
            <form className="flex gap-3"
                onReset={onReset}
                onSubmit={onSubmit}
            >
                <input
                    type="file"
                    accept=".log,.txt"
                    ref={fileInputRef}
                    onChange={onChange}
                    name="logfile"
                    className="block p-4 w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                />
                {logData.climates.length > 0 && <select
                    value={selectedThermostat || ''}
                    onChange={(e) => setSelectedThermostat(e.target.value)}
                    className="block px-2 w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                >
                    <option value="" className="text-gray-400">{t('select')}</option>
                    {logData.climates.map(therm => (
                        <option key={therm} value={therm}>{therm}</option>
                    ))}
                </select>}
                {logData.size > 0 && <button type="reset" className="bg-red-100 hover:bg-red-200 transition-all duration-400 cursor-pointer font-bold rounded-full px-4 text-red-800 border-red-500 border-solid border">{t('reset')}</button>}
                {logData.size > 0 && <button type="submit" className="bg-blue-100 hover:bg-blue-200 transition-all duration-400 cursor-pointer font-bold rounded-full px-4 text-blue-800 border-blue-500 border-solid border">{t('reload')}</button>}
            </form>
            {logData.state == 'finished' && selectedThermostat && <Graph logfile={parser.current} selectedThermostat={selectedThermostat} zoom={zoom} onZoomChange={onZoomChange} onZoomReset={onZoomReset} />}
            {/* {logData.size > 0 && <Editor climate={selectedThermostat} className="mt-4 w-full h-full" logfile={parser.current} zoom={zoom} />} */}
            {logData.state == 'finished' && selectedThermostat && <EditorV2 climate={selectedThermostat} parser={parser.current} file_input={fileInputRef} zoom={zoom} />}
        </div>
    );
}

export default Debugger;
