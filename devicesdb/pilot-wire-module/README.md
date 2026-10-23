# Zigbee pilot wire modules

The NodOn SIN-4-FP-21 (also sold as Equation SIN-4-FP-21_EQU) and the Legrand Céliane with Netatmo cable outlet control an electric heater through its pilot wire. With Zigbee2MQTT, they expose a `select` entity for the pilot wire mode, with the same options: `comfort`, `eco`, `frost_protection`, `off`, `comfort_-1` and `comfort_-2`.

## Configuration

1. Use Zigbee2MQTT: with ZHA, these modules only expose an on/off switch.
2. In the _VTherm_ `over_switch`, select the pilot wire mode entity (`select.*_pilot_wire_mode`), not the `switch` entity of the module.
3. In the [command customization](/en/docs/over-switch/), set the on command to `select_option/option:comfort` and the off command to `select_option/option:frost_protection`.

Avoid `eco` as the off command: the internal thermostat of the heater keeps heating in this mode.

## Recommendations

- Set the comfort temperature of the heater above the _VTherm_ setpoint, so that its internal thermostat does not cut the heating.
- All the modules of a single _VTherm_ start at the same time: take it into account for the power management.
