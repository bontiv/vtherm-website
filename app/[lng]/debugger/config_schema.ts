/**
 * Display layout of a Versatile Thermostat configuration.
 * Labels are translated with the `config.groups.<id>` and `config.keys.<key>` keys
 * of the analyzer namespace; unknown keys fall back to the "other" group.
 */
export type ConfigGroup = {
    id: string,
    /** Boolean key telling whether the feature of this group is enabled */
    featureKey?: string,
    keys: string[],
}

export const CONFIG_GROUPS: ConfigGroup[] = [
    { id: 'general', keys: ['name', 'thermostat_type', 'ac_mode', 'underlying_entity_ids', 'cycle_min', 'device_power', 'power_unit', 'step_temperature', 'temp_min', 'temp_max', 'proportional_function'] },
    { id: 'sensors', keys: ['temperature_sensor_entity_id', 'external_temperature_sensor_entity_id', 'power_sensor_entity_id', 'max_power_sensor_entity_id', 'presence_sensor_entity_id', 'motion_sensor_entity_id', 'window_sensor_entity_id', 'last_seen_temperature_sensor_entity_id'] },
    { id: 'regulation', keys: ['auto_regulation_mode', 'auto_regulation_dtemp', 'auto_regulation_periode_min', 'auto_regulation_use_device_temp', 'auto_fan_mode', 'sync_device_internal_temp', 'sync_with_calibration', 'sync_entity_ids'] },
    { id: 'valve', keys: ['opening_degree_entity_ids', 'closing_degree_entity_ids', 'min_opening_degrees', 'max_opening_degrees', 'max_closing_degree', 'opening_threshold_degree'] },
    { id: 'tpi', keys: ['tpi_coef_int', 'tpi_coef_ext', 'tpi_threshold_low', 'tpi_threshold_high', 'minimal_activation_delay', 'minimal_deactivation_delay', 'heater_heating_time', 'heater_cooling_time'] },
    { id: 'safety', keys: ['safety_delay_min', 'safety_min_on_percent', 'safety_default_on_percent'] },
    { id: 'auto_start_stop', featureKey: 'use_auto_start_stop_feature', keys: ['use_auto_start_stop_feature', 'auto_start_stop_level'] },
    { id: 'auto_tpi', featureKey: 'auto_tpi_mode', keys: ['auto_tpi_mode', 'auto_tpi_calculation_method', 'auto_tpi_avg_initial_weight', 'auto_tpi_ema_alpha', 'auto_tpi_ema_decay_rate', 'auto_tpi_heating_rate', 'auto_tpi_cooling_rate'] },
    { id: 'window', featureKey: 'use_window_feature', keys: ['use_window_feature', 'window_action', 'window_delay', 'window_off_delay', 'window_auto_open_threshold', 'window_auto_close_threshold', 'window_auto_max_duration'] },
    { id: 'power', featureKey: 'use_power_feature', keys: ['use_power_feature', 'power_temp'] },
    { id: 'presence', keys: ['use_presence_feature', 'use_motion_feature'] },
    { id: 'lock', keys: ['lock_users', 'lock_automations', 'auto_relock_sec'] },
    { id: 'central', keys: ['use_main_central_config', 'use_advanced_central_config', 'use_tpi_central_config', 'use_presets_central_config', 'use_window_central_config', 'use_motion_central_config', 'use_power_central_config', 'use_presence_central_config', 'use_lock_central_config', 'use_central_mode', 'use_central_boiler_feature', 'used_by_controls_central_boiler', 'use_heating_failure_detection_feature', 'use_heating_failure_detection_central_config', 'use_smart_pi_central_config'] },
];

export const OTHER_GROUP_ID = 'other';

/** Features shown as chips in the thermostat summary */
export const SUMMARY_FEATURES: { id: string, keys: string[] }[] = [
    { id: 'auto_start_stop', keys: ['use_auto_start_stop_feature'] },
    { id: 'window', keys: ['use_window_feature'] },
    { id: 'presence', keys: ['use_presence_feature'] },
    { id: 'motion', keys: ['use_motion_feature'] },
    { id: 'power', keys: ['use_power_feature'] },
    { id: 'auto_tpi', keys: ['auto_tpi_mode'] },
    { id: 'central_boiler', keys: ['use_central_boiler_feature'] },
    { id: 'heating_failure', keys: ['use_heating_failure_detection_feature'] },
    { id: 'lock', keys: ['lock_users', 'lock_automations'] },
];

/** Group the configuration keys for display, unknown keys going to the "other" group */
export function groupConfig(values: Record<string, unknown>): { group: ConfigGroup, keys: string[] }[] {
    const known = new Set<string>();
    const result = CONFIG_GROUPS.map(group => {
        const keys = group.keys.filter(k => k in values);
        keys.forEach(k => known.add(k));
        return { group, keys };
    });
    const others = Object.keys(values).filter(k => !known.has(k)).sort();
    result.push({ group: { id: OTHER_GROUP_ID, keys: others }, keys: others });
    return result.filter(g => g.keys.length > 0);
}

/** true when the value looks like a Home Assistant entity id */
export function isEntityId(value: unknown): boolean {
    return typeof value === 'string' && /^[a-z_]+\.[a-z0-9_]+$/.test(value);
}

export function formatConfigValue(value: unknown): string {
    if (Array.isArray(value)) return value.map(formatConfigValue).join(', ');
    if (value === null || value === undefined) return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}
