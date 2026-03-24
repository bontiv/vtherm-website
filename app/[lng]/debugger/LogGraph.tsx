'use client';

import { RefObject, useEffect, useState } from "react";
import { FeatureState, LogParser, ZoomType } from "./log_parser";
import { useT } from "@/app/i18n/client";
import { ApexOptions } from "apexcharts";
import Chart from 'react-apexcharts';

interface ZoomRange {
    min: number;
    max: number;
}

type ZoomCallback = (datemin: Date, datemax: Date) => void

function dateSort(a: { x: Date }, b: { x: Date }): number {
    return a.x.getTime() - b.x.getTime()
}

function feature_serie_builder(feature: "startstop_state" | "window_state" | "safety_state", { logfile, selectedThermostat }: {
    logfile: RefObject<LogParser>,
    selectedThermostat: string,
}, state: FeatureState = FeatureState.TRIGGER) {
    const vtherm = logfile.current.getThermostat(selectedThermostat)
    if (!vtherm || !(feature in vtherm)) {
        throw 'VTherm not found or serie not exist'
    }

    const data = vtherm[feature];

    let start = undefined;
    const result = [];

    for (const event of data) {
        if (event.value == state && start === undefined) {
            start = event.timestamp;
        } else if (event.value != state && start) {
            result.push({ x: feature, y: [start, event.timestamp] })
            start = undefined;
        }
    }

    if (start) {
        result.push({ x: feature, y: [start, data[data.length - 1].timestamp] })
    }
    return result;
}

function serie_builder(serie: "room_temps" | "target_temps" | "ext_temps" | "underlying_setpoints" | "regulated_temps" | "underlying_temps",
    { logfile, selectedThermostat }: {
        logfile: RefObject<LogParser>,
        selectedThermostat: string,
    }) {
    const vtherm = logfile.current.getThermostat(selectedThermostat)
    if (!vtherm || !(serie in vtherm)) {
        throw 'VTherm not found or serie not exist'
    }

    const data = vtherm[serie];
    return data.map(event => ({ x: event.timestamp, y: event.value })).sort(dateSort) || []
}

const LogGraph: React.FC<{ logfile: RefObject<LogParser>, selectedThermostat: string, onZoomChange?: ZoomCallback, zoom?: ZoomType, onZoomReset?: () => void }> = ({ logfile, selectedThermostat, onZoomChange, zoom, onZoomReset }) => {
    const { t, i18n } = useT('analyzer');
    const [isDark, setDark] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        return document.documentElement.classList.contains('dark') || mq.matches
    });
    const series: ApexOptions['series'] = [
        {
            name: t('graph.target'),
            data: logfile.current.getThermostat(selectedThermostat)?.target_temps.map(event => ({
                x: event.timestamp,
                y: event.value,
            }))
                .sort((a, b) => a.x.getTime() - b.x.getTime()) || [],
            type: 'area',
        },
        {
            name: t('graph.room_temp'),
            data: serie_builder("room_temps", { logfile, selectedThermostat })
        },
        {
            name: t('graph.ext_temp'),
            data: serie_builder("ext_temps", { logfile, selectedThermostat })
        },
        {
            name: t('graph.underlying_setpoint'),
            data: serie_builder("underlying_setpoints", { logfile, selectedThermostat })
        },
        {
            name: t('graph.underlying_temp'),
            data: serie_builder("underlying_temps", { logfile, selectedThermostat })
        },
        {
            name: t('graph.regulated_temp'),
            data: serie_builder("regulated_temps", { logfile, selectedThermostat })
        },
    ];

    const series_features: ApexOptions['series'] = [
        {
            name: t("graph.trigger"),
            data: [
                ...feature_serie_builder("startstop_state", { logfile, selectedThermostat }),
                ...feature_serie_builder("safety_state", { logfile, selectedThermostat }),
                ...feature_serie_builder("window_state", { logfile, selectedThermostat }),
            ]
        },
        {
            name: t("graph.bypass"),
            data: [
                ...feature_serie_builder("startstop_state", { logfile, selectedThermostat }, FeatureState.BYPASS),
                ...feature_serie_builder("safety_state", { logfile, selectedThermostat }, FeatureState.BYPASS),
                ...feature_serie_builder("window_state", { logfile, selectedThermostat }, FeatureState.BYPASS),
            ]
        },
    ]

    // Find last timestamp of all series then add this timestamp to other series
    const end_timestamps = series.map((x, i) => {
        if (x.data.length == 0)
            return { serie: i, last: new Date(0) }
        const lastElement = x.data[x.data.length - 1];
        const lastValue = typeof lastElement === 'object' && lastElement !== null && 'x' in lastElement ? lastElement.x : new Date(0);
        return { serie: i, last: lastValue }
    })
        .sort((a, b) => a.last.getTime() - b.last.getTime())

    const last_timestamp = end_timestamps[end_timestamps.length - 1]

    for (const [i, serie] of series.entries()) {
        if (i == last_timestamp.serie || serie.data.length == 0)
            continue;
        const lastElement = serie.data[serie.data.length - 1];
        if (typeof lastElement === 'object' && lastElement !== null && 'y' in lastElement) {
            (serie.data as { x: Date, y: number }[]).push({ x: last_timestamp.last, y: lastElement.y });
        }
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    function handleZoomChange(chartContext: any, { xaxis }: { xaxis: ZoomRange }) {
        const dateMin = new Date(xaxis.min);
        const dateMax = new Date(xaxis.max);
        if (onZoomChange != undefined) onZoomChange(dateMin, dateMax);
    }

    console.log('Series', series);
    console.log('Other states', series_features);

    const xaxis: ApexOptions['xaxis'] = {
        type: 'datetime',
        title: { text: 'Time' },
        labels: { format: 'HH:mm:ss', datetimeUTC: false },
        min: zoom?.enabled ? zoom?.mindate?.getTime() : undefined,
        max: zoom?.enabled ? zoom?.maxdate?.getTime() : undefined,
        tooltip: {
            formatter: (value) => new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)),
        }
    };

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = (e: MediaQueryListEvent) => setDark(e.matches)
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, []);

    const colors = isDark ?
        [
            '#FFC107', // Jaune/Orange
            '#4DBAFA', // Bleu clair
            '#26E7A6', // Menthe
            '#C49384', // Marron clair
            '#9B86E0', // Violet
            '#7986CB', // Indigo
            '#5EC5ED', // Cyan
            '#90A4AE', // Gris-bleu
            '#EC6B87', // Rose/Rouge
            '#C9BCB1', // Beige/Sable
            '#76D7D0'  // Turquoise
        ]
        : ['#FEB019', '#008FFB', '#00E396', '#8D5B4C', '#775DD0', '#3f51b5', '#33b2df', '#546E7A', 'd4526e', '#A5978B', '#4ecdc4'];

    return (
        <div className="w-full">
            <Chart
                className="chart"
                options={{
                    chart: {
                        id: 'log-chart',
                        group: 'log-charts',
                        type: 'line',
                        zoom: {
                            enabled: true,
                            allowMouseWheelZoom: false,
                        },
                        events: {
                            zoomed: handleZoomChange,
                            beforeResetZoom: onZoomReset,
                        },
                    },
                    fill: {
                        opacity: [0.3, 1, 1, 1, 1, 1]
                    },
                    theme: {
                        mode: isDark ? 'dark' : 'light',
                    },
                    tooltip: {
                        intersect: false,
                        shared: true,
                        x: {
                            show: false
                        },
                        custom: ({ seriesIndex, dataPointIndex, w }) => {
                            // Timestamp du point survolé
                            const hoveredTs = w.globals.seriesX[seriesIndex][dataPointIndex];

                            // Pour chaque série, on cherche la dernière valeur <= hoveredTs
                            const rows = w.globals.seriesNames
                                .map((name: string, i: number) => {
                                    const xArr = w.globals.seriesX[i];
                                    const yArr = w.globals.series[i];

                                    // Dernier index dont le timestamp est <= hoveredTs
                                    let lastVal: null | number = null;
                                    for (let j = 0; j < xArr.length; j++) {
                                        if (xArr[j] <= hoveredTs) {
                                            lastVal = yArr[j];
                                        }
                                    }

                                    const color = w.globals.colors[i];
                                    const display = lastVal !== null ? lastVal.toFixed(2) : "–";

                                    return `
                                  <div style="display:flex; align-items:center; gap:6px; padding:2px 0">
                                    <span style="width:10px;height:10px;border-radius:50%;
                                                 background:${color};display:inline-block"></span>
                                    <span>${name} :</span>
                                    <strong>${display}</strong>
                                  </div>`;
                                })
                                .join("");

                            return `
                              <div style="padding:10px 14px; font-size:13px; font-family:sans-serif">
                                ${rows}
                              </div>`;
                        },
                    },
                    xaxis,
                    yaxis: {
                        labels: {
                            formatter: (val: number) => val.toFixed(2)
                        }
                    },
                    stroke: { curve: 'stepline', width: [2, 2, 1, 1, 1.5, 1.5] },
                    title: { text: t('graph.title_logs'), align: 'left' },
                    colors,
                }}
                series={series}
                type="line"
                height={350}
            />
            <Chart
                type="rangeBar"
                className="chart"
                height={200}
                options={{
                    chart: {
                        id: 'feat-chart',
                        // group: 'log-charts',
                        // type: 'rangeBar',
                        zoom: {
                            enabled: true,
                            allowMouseWheelZoom: false,
                        },
                        events: {
                            zoomed: handleZoomChange,
                            beforeResetZoom: onZoomReset
                        },
                    },
                    colors: ['red', 'orange'],
                    title: {
                        text: t('graph.title_feature')
                    },
                    plotOptions: {
                        bar: {
                            horizontal: true
                        }
                    },
                    legend: {
                        show: true,
                    },
                    dataLabels: {
                        enabled: false,
                    },
                    yaxis: {
                        labels: {
                            formatter(val) {
                                return t(`graph.${val}`);
                            },
                        }
                    },
                    theme: {
                        mode: isDark ? 'dark' : 'light',
                    },
                    xaxis,
                }}
                series={series_features}
            />
        </div>
    );
}

export default LogGraph;