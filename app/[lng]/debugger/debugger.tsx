'use client';

import { useEffect, useRef, useState } from "react";
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import Quill, { Op } from 'quill';
import Chart from "react-apexcharts";
import { LogParser } from "./log_parser";

const Editor: React.FC<{ logfile: LogParser } & React.HTMLAttributes<HTMLDivElement>> = ({ logfile, className, ...props }) => {
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


            quill.setContents(logfile.getOps(), 'api');
        }
    }, [logfile]);
    return (
        <div ref={editorRef} className={`quill-editor ${className || ''}`} {...props} />
    );
}

const Graph: React.FC<{ logfile: LogParser, selectedThermostat: string }> = ({ logfile, selectedThermostat }) => {
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

    console.log('Graph data for thermostat', selectedThermostat, logfile.getThermostat(selectedThermostat), series);

    return (
        <div className="w-full">
            <Chart
                options={{
                    chart: {
                        id: 'log-chart',
                        type: 'line',
                        zoom: { enabled: true },
                        legend: { show: true }
                    },
                    xaxis: { type: 'datetime', title: { text: 'Time' }, labels: { format: 'HH:mm:ss' } },
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
    const [selectedThermostat, setSelectedThermostat] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="p-6 flex flex-col items-start gap-6">
            <form>
                <input
                    type="file"
                    accept=".log,.txt"
                    ref={fileInputRef}
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            e.target.files[0].text().then(content => {
                                const parser = new LogParser(content);
                                setLogfile(parser);
                                setSelectedThermostat(parser.getThermostats()[0] || null);
                            });
                        }
                    }}
                    name="logfile"
                    className="block p-4 w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                />
                {logfile && <select
                    value={selectedThermostat || ''}
                    onChange={(e) => setSelectedThermostat(e.target.value)}
                    className="mt-4 block p-2 w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                >
                    <option value="" disabled>Select Thermostat</option>
                    {logfile?.getThermostats().map(therm => (
                        <option key={therm} value={therm}>{therm}</option>
                    ))}
                </select>}
                <button type="reset">Reset</button>
            </form>
            {logfile && selectedThermostat && <Graph logfile={logfile} selectedThermostat={selectedThermostat} />}
            {logfile && <Editor className="mt-4 w-full h-full" logfile={logfile} />}
        </div>
    );
}

export default Debugger;
