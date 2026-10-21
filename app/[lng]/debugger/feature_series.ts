import { FeatureState } from "./log_parser";

export type Segment<T> = {
    start: number,
    end: number,
    value: T,
}

/**
 * Turn state change events into contiguous segments.
 * Consecutive events with the same value are merged; the last segment
 * lasts until `end` (usually the last timestamp of the file).
 */
export function buildSegments<T>(events: { timestamp: Date, value: T }[], end: number): Segment<T>[] {
    const sorted = [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const segments: Segment<T>[] = [];
    for (const event of sorted) {
        const ts = event.timestamp.getTime();
        const current = segments[segments.length - 1];
        if (current && current.value === event.value) continue;
        if (current) current.end = ts;
        segments.push({ start: ts, end: Math.max(ts, end), value: event.value });
    }
    return segments.filter(s => s.end > s.start);
}

/** Segments of a feature when it is triggered or bypassed (normal state is not drawn) */
export function buildFeatureSegments(events: { timestamp: Date, value: FeatureState }[], end: number): Segment<FeatureState>[] {
    return buildSegments(events, end).filter(s => s.value !== FeatureState.NORMAL);
}

/**
 * Underlying climates of an over_climate VTherm: the configured ones first, then any other
 * entity found in the logs. Each underlying reports its own hvac_action.
 * Other thermostat types (over_switch, over_valve…) have no hvac_action: no entity is returned.
 * Without configuration, the entities found in the logs are used (only over_climate logs them).
 */
export function underlyingEntities(config: Record<string, unknown> | undefined, actions: { entity: string }[]): string[] {
    const type = config?.thermostat_type;
    if (type !== undefined && type !== 'thermostat_over_climate') return [];
    const configured = type === 'thermostat_over_climate' && Array.isArray(config?.underlying_entity_ids)
        ? (config.underlying_entity_ids as unknown[]).filter((e): e is string => typeof e === 'string')
        : [];
    return Array.from(new Set([...configured, ...actions.map(a => a.entity)]));
}
