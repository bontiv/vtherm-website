# Sonoff TRV-ZBT

## Device Information

The TRV-ZBT is the second generation (Gen2) of the Sonoff TRV. We recommand to use it with [Zigbee2MQTT](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html).

> [!WARNING]
> This device is only **partially** compatible with VTherm. The direct valve control doesn't work out of the box. The recommended setup is a thermostat over climate without direct valve control.

## Valve opening entities

Unlike the first generation (TRVZB), this TRV exposes two valve opening values instead of one:
- [`heating_valve_position`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#heating-valve-position-numeric): the valve opening used when the TRV is heating,
- [`idle_valve_position`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#idle-valve-position-numeric): the valve opening used when the TRV is idle.

VTherm accepts only one opening degree entity per valve. If you only set `heating_valve_position` as the opening degree entity, the valve does not always open, even when the heating position is above 0.

### Workaround: sync the idle position

If you want to use the [self-regulation with direct valve control](/en/docs/self-regulation/), you can add the following automation. It keeps `idle_valve_position` just below `heating_valve_position` (the idle value must be lower than the heating one). Use `heating_valve_position` as the opening degree entity in VTherm, and replace the entity IDs with yours.

```yaml
alias: Sonoff TRV-ZBT - Sync valve positions
description: Keep idle valve position just below heating valve position
triggers:
  - trigger: state
    entity_id: number.my_trv_heating_valve_position
  - trigger: homeassistant
    event: start
conditions:
  - condition: template
    value_template: >
      {{ is_number(states('number.my_trv_heating_valve_position')) }}
  - condition: template
    value_template: >
      {% set heating = states('number.my_trv_heating_valve_position') | float %}
      {% set idle = [0, heating - 1] | max %}
      {{ states('number.my_trv_idle_valve_position') | float(-1) != idle }}
actions:
  - action: number.set_value
    target:
      entity_id: number.my_trv_idle_valve_position
    data:
      value: >
        {% set heating = states('number.my_trv_heating_valve_position') | float %}
        {{ [0, heating - 1] | max }}
mode: restart
```

## Temperature step

The TRV only accepts setpoints by steps of 0.5°C. If VTherm uses a 0.1°C step, the setpoint sent to the TRV is rounded (for example 22.2°C becomes 22°C). In that case, the TRV may stay closed even if VTherm asks to open the valve. That's why the configuration below sets a 0.5°C temperature step.

*Source: [Support for the new SONOFF TRV Gen2 discussion](https://github.com/jmcollin78/versatile_thermostat/discussions/2067).*
