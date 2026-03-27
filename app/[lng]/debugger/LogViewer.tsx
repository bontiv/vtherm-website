'use client';

import { RefObject, SubmitEventHandler, useCallback, useEffect, useRef, useState } from "react";
import { advFilterLog, CHUNK_SIZE, clearLineStr, LINES_PER_TICK, LogParser, readBlobAsText, yieldToMain, ZoomType } from "./log_parser";
import { MagnifyingGlassCircleIcon } from "@heroicons/react/24/outline";


const LogViewer: React.FC<{
    parser: RefObject<LogParser>,
    climate?: string,
    file_input: RefObject<HTMLInputElement | null>,
    zoom: ZoomType
}> = ({ parser, climate, file_input, zoom }) => {
    const inref = useRef<HTMLDivElement>(null);
    const [adv_filter, setAdvFilter] = useState<{
        vtherm_only: boolean,
        txt?: string
    }>({
        vtherm_only: false,
        txt: undefined
    })

    const write_log = useCallback(async (file: File, edit_div: HTMLDivElement) => {
        let offset = 0;
        let leftover = "";

        edit_div.innerText = ''
        const filter_txt = typeof adv_filter.txt === "string" && adv_filter.txt.length > 0 ? RegExp(adv_filter.txt) : null

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
                const line = clearLineStr(lines[i])
                const skip = line.match(/^[^[]*\[[^]*\]\W*$/)
                if (skip) {
                    continue;
                }

                if (adv_filter.vtherm_only && advFilterLog(line)) {
                    continue;
                }

                if (filter_txt) {
                    if (!filter_txt.test(line)) {
                        continue;
                    }
                }

                const { climate: log_climate, level, date, txt } = parser.current.getLogTextInfos(line)

                if (log_climate == '' || climate == log_climate) {
                    if (!zoom.enabled || !date || (zoom.mindate && date > zoom.mindate && zoom.maxdate && date < zoom.maxdate)) {
                        const pl = document.createElement('p');
                        pl.appendChild(document.createTextNode(txt));
                        if (level == 'INFO') pl.className = 'info';
                        if (level == 'WARNING') pl.className = 'warning';
                        if (level == 'ERROR') pl.className = 'error';
                        if (!date) pl.className = 'nodata';
                        edit_div.appendChild(pl)
                    }
                }

                // Cède le contrôle + met à jour la progression tous les LINES_PER_TICK
                if ((i + 1) % LINES_PER_TICK === 0) {
                    // TOTO: updateProgress();
                    await yieldToMain();
                }
            }
        }
    }, [zoom, climate, adv_filter, parser]);

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
    }, [climate, zoom, file_input, adv_filter, write_log])

    const onSearch: SubmitEventHandler<HTMLFormElement> = (evt) => {
        evt.preventDefault()
        setAdvFilter(e => ({ ...e, txt: evt.target['txt'].value }))
    }

    return <div className="w-full">
        <div className="py-2 border rounded-2xl my-4 px-3">
            <h2 className="text-xl border-b">Filters</h2>
            <form onSubmit={onSearch} className="pt-4 flex flex-col">
                <div className="flex">
                    <input type="checkbox" id="log_filter" checked={adv_filter.vtherm_only} onChange={() => setAdvFilter(e => ({ ...e, vtherm_only: !adv_filter.vtherm_only }))} />
                    <label htmlFor="log_filter" className="px-2 block" >Enable advance log filtering</label>
                </div>
                <div>
                    <div className="pr-3 inline">Search in logs:</div>
                    <input type="text" name="txt" placeholder="Regex search" className="w-2xs max-w-full bg-slate-100 px-2 py-1 rounded" />
                </div>
                <button type="submit" className="inline w-fit bg-green-300 dark:bg-green-400 dark:text-black rounded-full px-6 my-3 py-2"><MagnifyingGlassCircleIcon className="h-4 cursor-pointer inline" /> Search</button>
            </form>
        </div>
        <div ref={inref} className="debugger"></div>
    </div>
}

export default LogViewer;