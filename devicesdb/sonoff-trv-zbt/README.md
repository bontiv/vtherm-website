# Sonoff TRV-ZBT

## Device Information

The TRV-ZBT is the second generation (Gen2) of the Sonoff TRV. We recommand to use it with [Zigbee2MQTT](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html). It behaves the same way with ZHA.

> [!WARNING]
> This device is only **partially** compatible with VTherm. The direct valve control doesn't work: the TRV's internal thermostat keeps control of the valve, whatever the values of `heating_valve_position` and `idle_valve_position`. Use a thermostat over climate without direct valve control, or try the experimental blueprint below.

## Recommended TRV settings

- Disable [`smart_temperature_control`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#smart-temperature-control-binary) (called "adaptive mode" in ZHA).
- Set [`temperature_accuracy`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#temperature-accuracy-numeric) to -0.2°C, so the TRV follows the setpoint more closely.

## Direct valve control (experimental)

The [Sonoff TRV-ZBT valve kick](https://gist.github.com/bontiv/af2d59adb15bf3d522282edd662a75e4) blueprint forces the TRV to apply each valve opening sent by VTherm, without changing the setpoint.

[![Open your Home Assistant instance and show the blueprint import dialog with a specific blueprint pre-filled.](https://my.home-assistant.io/badges/blueprint_import.svg)](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgist.githubusercontent.com%2Fbontiv%2Faf2d59adb15bf3d522282edd662a75e4%2Fraw%2Fsonoff_trv_zbt_vtherm.yaml)

- In VTherm, choose the direct valve control self-regulation, with `heating_valve_position` as opening degree entity and no closing degree entity.
- Disable "Follow underlying temp change" and the device temperature synchronization in VTherm.
- Disable [`open_window`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#open-window-binary) on the TRV.

## Temperature step

The TRV only accepts setpoints by steps of 0.5°C. That's why the configuration below sets a 0.5°C temperature step.

*Source: [Support for the new SONOFF TRV Gen2 discussion](https://github.com/jmcollin78/versatile_thermostat/discussions/2067).*
