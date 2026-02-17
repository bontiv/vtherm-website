'use client';

import { useEffect, useRef, useState, memo } from "react";
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import Quill, { Op } from 'quill';
import Chart from "react-apexcharts";
import { LogParser } from "./log_parser";

interface ZoomRange {
    min: number;
    max: number;
}

type ZoomType = {
    mindate: Date,
    maxdate: Date
}

type ZoomCallback = (datemin: Date, datemax: Date) => void

const Editor: React.FC<{ logfile: LogParser, climate?: string, zoom?: ZoomType } & React.HTMLAttributes<HTMLDivElement>> = ({ logfile, className, climate, zoom, ...props }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (editorRef.current) {
            const quill = new Quill(editorRef.current, {
                theme: 'snow',
                readOnly: true,
                modules: {
                    toolbar: false
                }
            });


            quill.setContents(logfile.getOps(climate, zoom), 'api');
        }
    }, [logfile, climate, zoom]);
    return (
        <div ref={editorRef} className={`quill-editor ${className || ''}`} {...props} />
    );
}

const Graph: React.FC<{ logfile: LogParser, selectedThermostat: string, onZoomChange?: ZoomCallback, zoom?: ZoomType, onZoomReset?: () => void }> = ({ logfile, selectedThermostat, onZoomChange, zoom, onZoomReset }) => {
    const series = [
        {
            name: 'target',
            data: logfile.getThermostat(selectedThermostat)?.target_temps.map(event => ({ x: event.timestamp, y: event.value })) || [],
        },
        {
            name: 'room_temp',
            data: logfile.getThermostat(selectedThermostat)?.room_temps.map(event => ({ x: event.timestamp, y: event.value })) || []
        },
        {
            name: 'ext_temp',
            data: logfile.getThermostat(selectedThermostat)?.ext_temps.map(event => ({ x: event.timestamp, y: event.value })) || []
        },
        {
            name: 'underlying_setpoint',
            data: logfile.getThermostat(selectedThermostat)?.underlying_setpoints.map(event => ({ x: event.timestamp, y: event.value })) || []
        },
        {
            name: 'underlying_temp',
            data: logfile.getThermostat(selectedThermostat)?.underlying_temps.map(event => ({ x: event.timestamp, y: event.value })) || []
        },
        {
            name: 'regulated_temp',
            data: logfile.getThermostat(selectedThermostat)?.regulated_temps.map(event => ({ x: event.timestamp, y: event.value })) || []
        },
    ];

    function handleZoomChange(chartContext: any, { xaxis }: { xaxis: ZoomRange }) {
        const dateMin = new Date(xaxis.min);
        const dateMax = new Date(xaxis.max);
        onZoomChange && onZoomChange(dateMin, dateMax);
    }

    return (
        <div className="w-full">
            <Chart
                options={{
                    chart: {
                        id: 'log-chart',
                        type: 'line',
                        zoom: { enabled: true },
                        legend: { show: true },
                        events: {
                            zoomed: handleZoomChange,
                            scrolled: handleZoomChange,
                            beforeResetZoom: onZoomReset
                        }
                    },
                    xaxis: {
                        type: 'datetime',
                        title: { text: 'Time' },
                        labels: { format: 'HH:mm:ss' },
                        min: zoom?.mindate.getTime(),
                        max: zoom?.maxdate.getTime()
                    },
                    stroke: { curve: 'stepline', width: 2 },
                    title: { text: 'Log Events Over Time', align: 'left' },
                    colors: ['#008FFB', '#00E396', '#FEB019', '#8D5B4C', '#775DD0', '#3f51b5', '#33b2df', '#546E7A', 'd4526e', '#A5978B', '#4ecdc4'],
                }}
                series={series}
                type="line"
                height={350}
            />
        </div>
    );
}

const Debugger: React.FC = () => {
    const [logfile, setLogfile] = useState<LogParser | null>(null);
    const [zoom, setZoom] = useState<{ mindate: Date, maxdate: Date } | undefined>()
    const [selectedThermostat, setSelectedThermostat] = useState<string | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function onZoomChange(mindate: Date, maxdate: Date) {
        setZoom({
            mindate,
            maxdate
        })
    }

    function onZoomReset() {
        setZoom(undefined)
    }

    return (
        <div className="p-6 flex flex-col items-start gap-6">
            <form className="flex gap-3"
                onReset={() => {
                    setLogfile(null);
                    setZoom(undefined);
                }}
            >
                <input
                    type="file"
                    accept=".log,.txt"
                    ref={fileInputRef}
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            e.target.files[0].text().then(content => {
                                const parser = new LogParser(content);
                                setLogfile(parser);
                                setSelectedThermostat(parser.getThermostats()[0] || undefined);
                                setZoom(undefined)
                            });
                        }
                    }}
                    name="logfile"
                    className="block p-4 w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                />
                {logfile && <select
                    value={selectedThermostat || ''}
                    onChange={(e) => setSelectedThermostat(e.target.value)}
                    className="block px-2 w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                >
                    <option value="" disabled>Select Thermostat</option>
                    {logfile?.getThermostats().map(therm => (
                        <option key={therm} value={therm}>{therm}</option>
                    ))}
                </select>}
                {logfile && <button type="reset" className="bg-red-100 hover:bg-red-200 transition-all duration-400 cursor-pointer font-bold rounded-full px-4 text-red-800 border-red-500 border-solid border-1">Reset</button>}
            </form>
            {logfile && selectedThermostat && <Graph logfile={logfile} selectedThermostat={selectedThermostat} zoom={zoom} onZoomChange={onZoomChange} onZoomReset={onZoomReset} />}
            {logfile && <Editor climate={selectedThermostat} className="mt-4 w-full h-full" logfile={logfile} zoom={zoom} />}
        </div>
    );
}

export default Debugger;
