'use client';

import { useMemo } from "react";
import { ApexOptions } from "apexcharts";
import Chart from 'react-apexcharts';
import { useAnalyzerT } from "./useAnalyzerT";
import { useDarkMode } from "./useDarkMode";
import { LogParser, ZoomType } from "../log_parser";
import { formatTime, TimeZoneMode } from "../time";

type PercentSerie = 'power_percents' | 'valve_open_percents' | 'on_percents';

type PercentGraphProps = {
    parser: LogParser,
    thermostat: string,
    domain: { start: number, end: number },
    /** Last timestamp of the file: the last value lasts until there */
    dataEnd: number,
    zoom: ZoomType,
    onZoomChange: (datemin: Date, datemax: Date) => void,
    onZoomReset: () => void,
    displayTz: TimeZoneMode,
    marker?: { ts: number, lineNo: number },
    /** The thermostat drives a valve (TRV): the percentage is a valve opening */
    valve: boolean,
}

const PercentGraph: React.FC<PercentGraphProps> = ({ parser, thermostat, domain, dataEnd, zoom, onZoomChange, onZoomReset, displayTz, marker, valve }) => {
    const { t, i18n } = useAnalyzerT();
    const isDark = useDarkMode();

    const series = useMemo(() => {
        const vtherm = parser.getThermostat(thermostat);
        const labels: Record<PercentSerie, string> = {
            power_percents: valve ? t('graph.valve_percent') : t('graph.power_percent'),
            valve_open_percents: t('graph.valve_open_percent'),
            on_percents: t('graph.on_percent'),
        };
        return (Object.keys(labels) as PercentSerie[])
            .map(serie => {
                const data = (vtherm?.[serie] ?? [])
                    .map(event => ({ x: event.timestamp, y: event.value }))
                    .sort((a, b) => a.x.getTime() - b.x.getTime());
                const lastPoint = data[data.length - 1];
                if (lastPoint && lastPoint.x.getTime() < dataEnd) data.push({ x: new Date(dataEnd), y: lastPoint.y });
                return { name: labels[serie], data };
            })
            .filter(s => s.data.length > 0);
    }, [parser, thermostat, valve, dataEnd, t]);

    if (series.length === 0) return null;

    const fmt = (value: number) => formatTime(value, { tz: displayTz, lng: i18n.language, withDate: true });
    const markerColor = isDark ? '#60a5fa' : '#2563eb';

    const options: ApexOptions = {
        chart: {
            id: 'percent-chart',
            type: 'area',
            zoom: { enabled: true, allowMouseWheelZoom: false },
            events: {
                zoomed: (_chart: unknown, { xaxis }: { xaxis: { min: number, max: number } }) => onZoomChange(new Date(xaxis.min), new Date(xaxis.max)),
                beforeResetZoom: onZoomReset,
            },
            background: 'transparent',
        },
        annotations: {
            xaxis: marker ? [{ x: marker.ts, borderColor: markerColor, strokeDashArray: 0 }] : [],
        },
        dataLabels: { enabled: false },
        fill: { opacity: 0.25 },
        stroke: { curve: 'stepline', width: 2 },
        theme: { mode: isDark ? 'dark' : 'light' },
        colors: isDark ? ['#F59E0B', '#4DBAFA', '#9B86E0'] : ['#D97706', '#008FFB', '#775DD0'],
        tooltip: {
            shared: true,
            intersect: false,
            x: { formatter: (value) => fmt(Number(value)) },
            y: { formatter: (value) => `${Math.round(value * 10) / 10} %` },
        },
        xaxis: {
            type: 'datetime',
            labels: { datetimeUTC: displayTz === 'UTC' },
            min: zoom.enabled ? zoom.mindate?.getTime() : domain.start,
            max: zoom.enabled ? zoom.maxdate?.getTime() : domain.end,
        },
        yaxis: {
            min: 0,
            max: 100,
            tickAmount: 4,
            labels: { formatter: (value: number) => `${Math.round(value)} %` },
        },
        legend: { show: true, showForSingleSeries: true },
    };

    return (
        <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-x-3">
                <h2 className="m-0 p-0 text-base font-semibold text-slate-900 dark:text-white">
                    {valve ? t('graph.title_valve') : t('graph.title_power')}
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">{t('graph.percent_hint')}</span>
            </div>
            <Chart options={options} series={series} type="area" height={220} />
        </div>
    );
};

export default PercentGraph;
