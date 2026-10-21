import { describe, expect, it } from 'vitest';
import { underlyingEntities } from '@/app/[lng]/debugger/feature_series';

describe('underlyingEntities', () => {
    const config = { thermostat_type: 'thermostat_over_climate', underlying_entity_ids: ['climate.trv_1', 'climate.trv_2'] };

    it('keeps every configured underlying, even without event', () => {
        expect(underlyingEntities(config, [{ entity: 'climate.trv_1' }])).toEqual(['climate.trv_1', 'climate.trv_2']);
    });

    it('adds underlyings only found in the logs', () => {
        expect(underlyingEntities(config, [{ entity: 'climate.trv_3' }])).toEqual(['climate.trv_1', 'climate.trv_2', 'climate.trv_3']);
    });

    it('relies on the logs without configuration', () => {
        expect(underlyingEntities(undefined, [{ entity: 'climate.a' }, { entity: 'climate.b' }, { entity: 'climate.a' }])).toEqual(['climate.a', 'climate.b']);
    });

    it('returns nothing for thermostats which are not over_climate', () => {
        expect(underlyingEntities({ thermostat_type: 'thermostat_over_switch', underlying_entity_ids: ['switch.x'] }, [])).toEqual([]);
        expect(underlyingEntities({ thermostat_type: 'thermostat_over_valve', underlying_entity_ids: ['number.v'] }, [{ entity: 'climate.a' }])).toEqual([]);
    });
});
