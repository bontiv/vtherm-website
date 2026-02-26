export type EntityList = string[]

export type DeviceConfig = {
    thermostat_type: "thermostat_over_climate" | "thermostat_over_switch" | "thermostat_over_valve",
    underlying_entity_ids: EntityList,
    auto_regulation_mode?: "auto_regulation_none" | "auto_regulation_valve" | "auto_regulation_slow" | "auto_regulation_light" | "auto_regulation_medium" | "auto_regulation_strong" | "auto_regulation_expert",
    auto_regulation_dtemp?: number,
    auto_regulation_periode_min?: number,
    auto_regulation_use_device_temp?: boolean,
    opening_degree_entity_ids?: EntityList,
    closing_degree_entity_ids?: EntityList,
    minimal_activation_delay?: number,
    minimal_deactivation_delay?: number
}

export type DeviceDefinition = {
    title?: string,
    config: DeviceConfig,
}