import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { HEADER_DELIMITER, parseHeader, parsePythonLiteral } from '@/app/[lng]/debugger/header_parser';

const fixture = (name: string) => readFileSync(path.join(__dirname, 'fixtures', name), 'utf-8');

function headerLines(content: string): string[] {
    const lines = content.split('\n');
    const end = lines.findIndex((l, i) => i > 0 && HEADER_DELIMITER.test(l));
    return lines.slice(0, end + 1);
}

describe('parseHeader', () => {
    const lines = headerLines(fixture('with_header.log'));
    const header = parseHeader(lines)!;

    it('reads the header fields', () => {
        expect(header).toBeDefined();
        expect(header.thermostatName).toBe('Test Clim');
        expect(header.entityId).toBe('climate.test_clim');
        expect(header.timezone).toBe('UTC');
        expect(header.level).toBe('DEBUG and above');
        expect(header.entries).toBe(764);
        expect(header.period?.start.getTime()).toBe(Date.UTC(2026, 9, 20, 10, 42, 49));
        expect(header.period?.end.getTime()).toBe(Date.UTC(2026, 9, 20, 11, 42, 49));
        expect(header.generated?.getTime()).toBe(Date.UTC(2026, 9, 20, 11, 42, 49));
        expect(header.lineCount).toBe(83);
    });

    it('reads the configuration', () => {
        expect(Object.keys(header.config!)).toHaveLength(69);
        expect(header.config!.thermostat_type).toBe('thermostat_over_climate');
        expect(header.config!.underlying_entity_ids).toEqual(['climate.test_underlying_ac']);
        expect(header.config!.use_window_feature).toBe(false);
    });

    it('keeps the metadata when the configuration is not valid JSON', () => {
        const broken = lines.map(l => l.replace('"ac_mode": true,', '"ac_mode": tru,'));
        const result = parseHeader(broken)!;
        expect(result.thermostatName).toBe('Test Clim');
        expect(result.config).toBeUndefined();
    });

    it('rejects a block which is not an export header', () => {
        expect(parseHeader(['='.repeat(80), 'Some banner', '='.repeat(80)])).toBeUndefined();
    });

    it('defaults to local time without time zone', () => {
        const local = lines.map(l => l.replace(' UTC', ''));
        expect(parseHeader(local)!.timezone).toBe('local');
    });
});

describe('parsePythonLiteral', () => {
    it('parses scalars and containers', () => {
        expect(parsePythonLiteral("{'a': True, 'b': None, 'c': [1, -2.5, 'x'], 'd': (3,), \"e\": 'it\\'s'}"))
            .toEqual({ a: true, b: null, c: [1, -2.5, 'x'], d: [3], e: "it's" });
    });

    it('keeps unknown reprs as strings', () => {
        expect(parsePythonLiteral("{'mode': <HVACMode.OFF: 'off'>}")).toEqual({ mode: "<HVACMode.OFF: 'off'>" });
    });

    it('throws on malformed input', () => {
        expect(() => parsePythonLiteral("{'a': }")).toThrow();
        expect(() => parsePythonLiteral("{'a': 1} extra")).toThrow();
    });

    it('parses the async_setup_entry value of the fixture', () => {
        const line = fixture('without_header.log').split('\n')[1];
        const literal = line.match(/value='(\{.*\})'$/)![1];
        const value = parsePythonLiteral(literal) as Record<string, unknown>;
        expect(value.name).toBe('Test Clim');
        expect(value.safety_default_on_percent).toBe(0.1);
        expect(value.lock_users).toBe(true);
    });
});
