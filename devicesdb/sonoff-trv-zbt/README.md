# Sonoff TRV-ZBT

## Device Information

The TRV-ZBT is the second generation (Gen2) of the Sonoff TRV. We recommand to use it with [Zigbee2MQTT](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html). It behaves the same way with ZHA.

> [!WARNING]
> This device is only **partially** compatible with VTherm. The direct valve control doesn't work: the TRV's internal thermostat keeps control of the valve, whatever the values of `heating_valve_position` and `idle_valve_position`. Use a thermostat over climate without direct valve control.

## Recommended TRV settings

- Disable [`smart_temperature_control`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#smart-temperature-control-binary) (called "adaptive mode" in ZHA).
- Set [`temperature_accuracy`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#temperature-accuracy-numeric) to -0.2°C, so the TRV follows the setpoint more closely.

## Temperature step

The TRV only accepts setpoints by steps of 0.5°C. That's why the configuration below sets a 0.5°C temperature step.

*Source: [Support for the new SONOFF TRV Gen2 discussion](https://github.com/jmcollin78/versatile_thermostat/discussions/2067).*
