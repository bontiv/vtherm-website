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

describe('LogParser analysis period', () => {
    const header = [
        '='.repeat(80),
        'Versatile Thermostat - Log Export',
        'Thermostat : Test Bedroom (climate.test_bedroom)',
        'Period     : 2026-10-18 21:00:00 → 2026-10-21 05:00:00 UTC',
        'Entries    : 3',
        'Generated  : 2026-10-21 07:50:49 UTC',
        '',
        'Configuration:',
        '{"name": "Test Bedroom"}',
        '='.repeat(80),
        '',
    ];
    const lines = [
        "2026-10-21 03:34:52.214 DEBUG   [feature_auto_start_stop_manager] AutoStartStopManager-Test Bedroom - auto start/stop is disabled (or not configured)",
        "2026-10-21 03:44:52.218 DEBUG   [base_thermostat   ] Test Bedroom - End of cycle. current_state: {'hvac_mode': 'auto', 'target_temperature': 20.5, 'preset': 'eco', 'room_temperature': 22.81, 'outdoor_temperature': 5.9, 'hvac_action': 'idle', 'power_percent': None}, managers_states: {'FeaturePresenceManager': True}",
        "2026-10-21 04:54:52.226 DEBUG   [thermostat_climate] Test Bedroom - added energy is 0.000 . Total energy is now: 52491.387",
    ];
    const parser = new LogParser([...header, ...lines].join('\n'));

    it('uses the logged timestamps, not the requested export period', () => {
        expect(parser.header?.period?.start.getTime()).toBe(Date.UTC(2026, 9, 18, 21, 0, 0));
        const period = parser.getAnalysisPeriod()!;
        expect(period.start.getTime()).toBe(Date.UTC(2026, 9, 21, 3, 34, 52, 214));
        expect(period.end.getTime()).toBe(Date.UTC(2026, 9, 21, 4, 54, 52, 226));
    });

    it('finds the first temperature after logs without data', () => {
        expect(parser.getFirstDataTime('Test Bedroom')?.getTime()).toBe(Date.UTC(2026, 9, 21, 3, 44, 52, 218));
        expect(parser.getFirstDataTime('Unknown')).toBeUndefined();
    });

    it('falls back to the header period when no line has a timestamp', () => {
        const empty = new LogParser(header.join('\n'));
        expect(empty.getAnalysisPeriod()?.start.getTime()).toBe(Date.UTC(2026, 9, 18, 21, 0, 0));
    });
});

describe('LogParser underlying hvac_action', () => {
    const state = (entity: string, temp: string, action: string) =>
        `<state ${entity}=auto; hvac_modes=[<HVACMode.AUTO: 'auto'>, <HVACMode.OFF: 'off'>, <HVACMode.HEAT: 'heat'>], min_temp=5.0, max_temp=35.0, target_temp_step=0.5, preset_modes=['none', 'manual', 'eco'], current_temperature=${temp}, temperature=20.5, hvac_action=${action}, preset_mode=manual, friendly_name=Test TRV, supported_features=401 @ 2026-10-19T12:53:50.370941+03:00>`;
    const changed = (time: string, entity: string, from: string, to: string, temp: string) =>
        `2026-10-21 ${time} INFO    [thermostat_climate] Test Room - ---------------------> NEW EVENT: Underlying climate ${entity}state changed from ${state(entity, '19.5', from)} to new_state ${state(entity, temp, to)} --------------------------------------------------------------`;
    const parser = new LogParser([
        changed('03:37:16.645', 'climate.test_trv', 'idle', 'heating', '19.5'),
        changed('03:37:56.636', 'climate.test_trv', 'heating', 'idle', '20.0'),
        changed('03:38:10.000', 'climate.test_trv_2', 'idle', 'heating', '19.0'),
    ].join('\n'));

    it('reads hvac_action and temperature from the new state only, per underlying', () => {
        const vtherm = parser.getThermostat('Test Room')!;
        expect(vtherm.underlying_hvac_actions.map(a => [a.entity, a.value])).toEqual([
            ['climate.test_trv', 'heating'],
            ['climate.test_trv', 'idle'],
            ['climate.test_trv_2', 'heating'],
        ]);
        expect(vtherm.underlying_temps.map(t => t.value)).toEqual([19.5, 20.0, 19.0]);
    });
});
