import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { LogParser, readLines } from '@/app/[lng]/debugger/log_parser';
import { formatTime } from '@/app/[lng]/debugger/time';

const fixture = (name: string) => readFileSync(path.join(__dirname, 'fixtures', name), 'utf-8');

async function parseStreaming(content: string, chunkSize: number): Promise<LogParser> {
    const parser = new LogParser();
    for await (const { lines } of readLines(new Blob([content]), chunkSize)) {
        lines.forEach(l => parser.parseLine(l));
    }
    parser.finalize();
    return parser;
}

describe('LogParser with export header', () => {
    const parser = new LogParser(fixture('with_header.log'));

    it('reads the header and selects its thermostat', () => {
        expect(parser.header?.thermostatName).toBe('Test Clim');
        expect(parser.timezone).toBe('UTC');
        expect(parser.getThermostats()).toEqual(['Test Clim']);
    });

    it('does not index the header lines', () => {
        expect(parser.index.lineNo[0]).toBe(85);
        expect(parser.index.length).toBe(216);
    });

    it('reads timestamps as UTC', () => {
        expect(parser.index.ts[0]).toBe(Date.UTC(2026, 9, 20, 11, 3, 43, 110));
        expect(formatTime(parser.index.ts[0], { tz: 'UTC', lng: 'fr' })).toBe('11:03:43');
        const paris = new Intl.DateTimeFormat('fr', { timeZone: 'Europe/Paris', timeStyle: 'medium' });
        expect(paris.format(parser.index.ts[0])).toBe('13:03:43');
    });

    it('gives the header configuration first', () => {
        const config = parser.getConfig('Test Clim')!;
        expect(config.source).toBe('header');
        expect(Object.keys(config.values)).toHaveLength(69);
    });

    it('finds the startup configuration and the differences', () => {
        const startup = parser.getStartupConfig('Test Clim')!;
        expect(startup.source).toBe('setup_entry');
        expect(startup.line).toBe(86);
        expect(parser.getConfigDiff('Test Clim')).toEqual([
            { key: 'safety_default_on_percent', startup: 0.1, current: 0.5 },
            { key: 'safety_min_on_percent', startup: 0.5, current: 0.3 },
        ]);
    });

    it('counts lines per level', () => {
        expect(parser.getLevelCounts()).toEqual({ DEBUG: 172, INFO: 44, WARNING: 0, ERROR: 0 });
    });

    it('still parses the temperatures', () => {
        const vtherm = parser.getThermostat('Test Clim')!;
        expect(vtherm.room_temps.length).toBeGreaterThan(0);
        expect(vtherm.ext_temps[0].value).toBe(13.5);
    });

    it('gives the same result when the header is split across chunks', async () => {
        const streamed = await parseStreaming(fixture('with_header.log'), 512);
        expect(streamed.header?.config).toEqual(parser.header?.config);
        expect(streamed.index.length).toBe(parser.index.length);
        expect(streamed.getConfigDiff('Test Clim')).toHaveLength(2);
    });
});

describe('LogParser without header', () => {
    const parser = new LogParser(fixture('without_header.log'));

    it('uses local time and numbers lines from the file start', () => {
        expect(parser.header).toBeUndefined();
        expect(parser.timezone).toBe('local');
        expect(parser.index.lineNo[0]).toBe(1);
    });

    it('rebuilds the configuration from async_setup_entry', () => {
        const config = parser.getConfig('Test Clim')!;
        expect(config.source).toBe('setup_entry');
        expect(config.line).toBe(2);
        expect(config.values.safety_default_on_percent).toBe(0.1);
        expect(parser.getConfigDiff('Test Clim')).toEqual([]);
    });
});

describe('LogParser without configuration', () => {
    const parser = new LogParser(fixture('without_config.log'));

    it('finds the thermostat but no configuration', () => {
        expect(parser.getThermostats()).toContain('Test Clim');
        expect(parser.getConfig('Test Clim')).toBeUndefined();
    });
});

describe('readLines', () => {
    it('emits the last line without trailing newline and keeps multi-byte characters', async () => {
        const all: string[] = [];
        for await (const { lines } of readLines(new Blob(['a → b\nc é']), 3)) all.push(...lines);
        expect(all).toEqual(['a → b', 'c é']);
    });
});

describe('LogParser valve opening', () => {
    const endOfCycle = (time: string, percent: string) =>
        `2026-10-20 ${time} DEBUG   [base_thermostat   ] Test TRV - End of cycle. current_state: {'hvac_mode': 'heat', 'target_temperature': 20.5, 'preset': 'none', 'room_temperature': 20.2, 'outdoor_temperature': 13.700000000000045, 'hvac_action': 'heating', 'power_percent': ${percent}}, managers_states: {'FeaturePresenceManager': True, 'FeatureWindowManager': False}`;
    const parser = new LogParser([
        endOfCycle('13:00:33.159', '0'),
        endOfCycle('13:00:39.185', '100'),
        endOfCycle('13:00:53.663', '21.0'),
        endOfCycle('13:01:04.919', 'None'),
    ].join('\n'));

    it('reads power_percent from the end of cycle state', () => {
        const vtherm = parser.getThermostat('Test TRV')!;
        expect(vtherm.power_percents.map(e => e.value)).toEqual([0, 100, 21]);
        expect(vtherm.ext_temps).toHaveLength(4);
        expect(vtherm.ext_temps[0].value).toBeCloseTo(13.7);
        expect(vtherm.room_temps[0].value).toBe(20.2);
    });
});
