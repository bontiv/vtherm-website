import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { groupConfig, OTHER_GROUP_ID } from '@/app/[lng]/debugger/config_schema';
import { LogParser } from '@/app/[lng]/debugger/log_parser';

const parser = new LogParser(readFileSync(path.join(__dirname, 'fixtures', 'with_header.log'), 'utf-8'));
const values = parser.getConfig('Test Clim')!.values;

describe('groupConfig', () => {
    it('places every key of the fixture in a known group', () => {
        const groups = groupConfig(values);
        expect(groups.find(g => g.group.id === OTHER_GROUP_ID)).toBeUndefined();
        expect(groups.reduce((n, g) => n + g.keys.length, 0)).toBe(Object.keys(values).length);
    });

    it('puts unknown keys in the "other" group', () => {
        const groups = groupConfig({ ...values, some_future_option: 3 });
        const other = groups.find(g => g.group.id === OTHER_GROUP_ID)!;
        expect(other.keys).toEqual(['some_future_option']);
    });
});
