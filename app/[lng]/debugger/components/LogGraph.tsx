'use client';

import { useMemo, useState } from "react";
import { useDarkMode } from "./useDarkMode";
import { ApexOptions } from "apexcharts";
import Chart from 'react-apexcharts';
import { useAnalyzerT } from "./useAnalyzerT";
import { LogParser, ZoomType } from "../log_parser";
import { formatTime, TimeZoneMode } from "../time";

type ZoomCallback = (datemin: Date, datemax: Date) => void
type Annotations = NonNullable<ApexOptions['annotations']>;
type XAxisAnnotation = NonNullable<Annotations['xaxis']>[number];
type YAxisAnnotation = NonNullable<Annotations['yaxis']>[number];

type Serie = "room_temps" | "target_temps" | "ext_temps" | "underlying_setpoints" | "regulated_temps" | "underlying_temps";

export type YScale = 'auto' | 'room';

type LogGraphProps = {
    parser: LogParser,
    thermostat: string,
    domain: { start: number, end: number },
    zoom: ZoomType,
    onZoomChange: ZoomCallback,
    onZoomReset: () => void,
    displayTz: TimeZoneMode,
    /** End of the period without logs at the beginning of the export (header period) */
    noDataEnd?: number,
    marker?: { ts: number, lineNo: number },
    bounds?: { min?: number, max?: number },
}

const LIGHT_COLORS = ['#FEB019', '#008FFB', '#00E396', '#8D5B4C', '#775DD0', '#3f51b5', '#33b2df', '#546E7A', '#d4526e', '#A5978B', '#4ecdc4'];
const DARK_COLORS = ['#FFC107', '#4DBAFA', '#26E7A6', '#C49384', '#9B86E0', '#7986CB', '#5EC5ED', '#90A4AE', '#EC6B87', '#C9BCB1', '#76D7D0'];

const LogGraph: React.FC<LogGraphProps> = ({ parser, thermostat, domain, zoom, onZoomChange, onZoomReset, displayTz, noDataEnd, marker, bounds }) => {
    const { t, i18n } = useAnalyzerT();
    const isDark = useDarkMode();
    const [yScale, setYScale] = useState<YScale>('auto');

    const series = useMemo(() => {
        const vtherm = parser.getThermostat(thermostat);
        const build = (serie: Serie) => (vtherm?.[serie] ?? [])
            .map(event => ({ x: event.timestamp, y: event.value }))
            .sort((a, b) => a.x.getTime() - b.x.getTime());

        const result: { name: string, data: { x: Date, y: number }[], type?: string }[] = [
            { name: t('graph.target'), data: build('target_temps'), type: 'area' },
            { name: t('graph.room_temp'), data: build('room_temps') },
            { name: t('graph.ext_temp'), data: build('ext_temps') },
            { name: t('graph.underlying_setpoint'), data: build('underlying_setpoints') },
            { name: t('graph.underlying_temp'), data: build('underlying_temps') },
            { name: t('graph.regulated_temp'), data: build('regulated_temps') },
        ];

        // Extend every serie up to the last known timestamp so step lines reach the end
        const lastTs = Math.max(...result.filter(s => s.data.length > 0).map(s => s.data[s.data.length - 1].x.getTime()));
        for (const serie of result) {
            const lastPoint = serie.data[serie.data.length - 1];
            if (lastPoint && lastPoint.x.getTime() < lastTs) {
                serie.data.push({ x: new Date(lastTs), y: lastPoint.y });
            }
        }
        return result;
    }, [parser, thermostat, t]);

    const roomRange = useMemo(() => {
        const values = series[1].data.map(p => p.y);
        if (values.length === 0) return undefined;
        return { min: Math.floor((Math.min(...values) - 0.3) * 10) / 10, max: Math.ceil((Math.max(...values) + 0.3) * 10) / 10 };
    }, [series]);

    const handleZoomChange = (_chart: unknown, { xaxis }: { xaxis: { min: number, max: number } }) => {
        onZoomChange(new Date(xaxis.min), new Date(xaxis.max));
    };

    const fmt = (value: number, withDate = false) => formatTime(value, { tz: displayTz, lng: i18n.language, withDate });
    const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
    const boundColor = isDark ? '#94a3b8' : '#64748b';
    const markerColor = isDark ? '#60a5fa' : '#2563eb';
    const roomScale = yScale === 'room' && roomRange !== undefined;

    const yAnnotations: YAxisAnnotation[] = [];
    if (!roomScale && bounds) {
        for (const [key, value] of [['temp_min', bounds.min], ['temp_max', bounds.max]] as const) {
            if (value === undefined) continue;
            yAnnotations.push({
                y: value,
                borderColor: boundColor,
                strokeDashArray: 4,
                label: { text: `${key} ${value} °C`, borderWidth: 0, style: { background: 'transparent', color: boundColor } },
            });
        }
    }

    const xAnnotations: XAxisAnnotation[] = [];
    if (noDataEnd !== undefined && noDataEnd > domain.start) {
        xAnnotations.push({
            x: domain.start,
            x2: noDataEnd,
            fillColor: boundColor,
            opacity: 0.12,
            borderColor: 'transparent',
            label: { text: t('graph.no_data', { time: fmt(noDataEnd) }), orientation: 'horizontal', position: 'top', textAnchor: 'start', offsetX: -6, offsetY: 4, borderWidth: 0, style: { background: 'transparent', color: boundColor } },
        });
    }
    if (marker) {
        xAnnotations.push({
            x: marker.ts,
            borderColor: markerColor,
            strokeDashArray: 0,
            label: { text: t('graph.line', { line: marker.lineNo }), orientation: 'horizontal', borderColor: markerColor, style: { background: markerColor, color: isDark ? '#0f172a' : '#fff' } },
        });
    }

    const options: ApexOptions = {
        chart: {
            id: 'log-chart',
            type: 'line',
            zoom: { enabled: true, allowMouseWheelZoom: false },
            events: { zoomed: handleZoomChange, beforeResetZoom: onZoomReset },
            background: 'transparent',
        },
        annotations: { xaxis: xAnnotations, yaxis: yAnnotations },
        fill: { opacity: [0.3, 1, 1, 1, 1, 1] },
        theme: { mode: isDark ? 'dark' : 'light' },
        tooltip: {
            intersect: false,
            shared: true,
            x: { show: false },
            custom: ({ seriesIndex, dataPointIndex, w }) => {
                const hoveredTs = w.globals.seriesX[seriesIndex][dataPointIndex];
                const rows = w.globals.seriesNames.map((name: string, i: number) => {
                    const xArr = w.globals.seriesX[i];
                    const yArr = w.globals.series[i];
                    let lastVal: null | number = null;
                    for (let j = 0; j < xArr.length; j++) {
                        if (xArr[j] <= hoveredTs) lastVal = yArr[j];
                    }
                    const display = lastVal !== null ? lastVal.toFixed(2) : "–";
                    return `<div style="display:flex;align-items:center;gap:6px;padding:2px 0">
                        <span style="width:10px;height:10px;border-radius:50%;background:${w.globals.colors[i]};display:inline-block"></span>
                        <span>${name} :</span><strong>${display}</strong></div>`;
                }).join("");
                return `<div style="padding:10px 14px;font-size:13px;font-family:sans-serif">
                    <div style="font-weight:600;margin-bottom:4px">${fmt(hoveredTs, true)}</div>${rows}</div>`;
            },
        },
        xaxis: {
            type: 'datetime',
            labels: { datetimeUTC: displayTz === 'UTC' },
            tooltip: { formatter: (value) => value ? fmt(Number(value), true) : '' },
            min: zoom.enabled ? zoom.mindate?.getTime() : domain.start,
            max: zoom.enabled ? zoom.maxdate?.getTime() : domain.end,
        },
        yaxis: {
            min: roomScale ? roomRange.min : undefined,
            max: roomScale ? roomRange.max : undefined,
            labels: { formatter: (val: number) => val ? val.toFixed(1) : '' },
        },
        stroke: { curve: 'stepline', width: [2, 2, 1, 1, 1.5, 1.5] },
        colors,
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap justify-between items-center gap-3">
                <h2 className="m-0 p-0 text-base font-semibold text-slate-900 dark:text-white">{t('graph.title_logs')}</h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">{t('graph.scale')}</span>
                    <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden" role="group" aria-label={t('graph.scale')}>
                        {(['auto', 'room'] as YScale[]).map(scale => (
                            <button key={scale} type="button" aria-pressed={yScale === scale} onClick={() => setYScale(scale)}
                                className={`min-h-8 px-3 text-sm font-medium cursor-pointer ${yScale === scale ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-slate-950' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                {t(`graph.scale_${scale}`)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <Chart options={options} series={series} type="line" height={350} />
        </div>
    );
}

export default LogGraph;
