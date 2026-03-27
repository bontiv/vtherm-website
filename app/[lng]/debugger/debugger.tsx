'use client';

import { useRef, useState, useCallback, ChangeEventHandler } from "react";
import { CHUNK_SIZE, LINES_PER_TICK, LogParser, readBlobAsText, yieldToMain, ZoomType } from "./log_parser";
import './debugger.css';
import { useT } from "@/app/i18n/client";
import dynamic from 'next/dynamic';
const LogViewer = dynamic(() => import("./LogViewer"));
const LogGraph = dynamic(() => import("./LogGraph"));

type LogData = {
    size: number,
    read_size: number,
    climates: string[],
    state: "empty" | "running" | "finished",
}

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
                {logData.size > 0 && <button type="reset" className="bg-red-100 dark:bg-red-400 dark:text-black hover:bg-red-200 transition-all duration-400 cursor-pointer font-bold rounded-full px-4 text-red-800 border-red-500 border-solid border">{t('reset')}</button>}
                {logData.size > 0 && <button type="submit" className="bg-blue-100 dark:bg-blue-400 dark:text-black hover:bg-blue-200 transition-all duration-400 cursor-pointer font-bold rounded-full px-4 text-blue-800 border-blue-500 border-solid border">{t('reload')}</button>}
            </form>
            {logData.state == 'finished' && selectedThermostat && <LogGraph logfile={parser} selectedThermostat={selectedThermostat} zoom={zoom} onZoomChange={onZoomChange} onZoomReset={onZoomReset} />}
            {logData.state == 'finished' && selectedThermostat && <LogViewer climate={selectedThermostat} parser={parser} file_input={fileInputRef} zoom={zoom} />}
        </div>
    );
}

export default Debugger;
