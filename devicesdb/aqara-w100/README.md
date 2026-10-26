# Aqara W100

The Aqara W100 (Zigbee `TH-S04D`) is a temperature and humidity sensor with a display and buttons. It works as the room temperature sensor of a _VTherm_ (see [base attributes](/en/docs/base-attributes/)) and can also act as a wall-mounted remote to change the _VTherm_ mode and setpoint.

## Use as a remote for _VTherm_

Since Zigbee2MQTT 2.7.0, the W100 exposes a virtual climate entity. The [Aqara W100 Thermostat Synchronization](/en/plugins/#kipk/aqara-w100-z2m-converter) blueprint keeps it in sync with the _VTherm_ in both directions:

1. Update Zigbee2MQTT to 2.7.0 or later and pair the W100.
2. Turn on the W100 `Thermostat mode` switch.
3. Import the blueprint and create an automation with:
   - _Main Thermostat_: the _VTherm_ climate entity,
   - _Aqara W100 Climate Controller_: the W100 climate entity.

Mode, setpoint and fan mode changes made on the W100 are applied to the _VTherm_, and changes made on the _VTherm_ are shown on the W100. The blueprint can also show an external temperature and humidity on the W100 display.

> [!NOTE]
> The W100 firmware only handles whole-degree setpoints: half-degree setpoints cannot be set from the W100 buttons.

## Reporting interval

Like other Aqara sensors, the W100 only reports the temperature when it changes. In a stable room, check that the delay between two updates stays below the _VTherm_ safety delay (see [Recommended thermometers](/en/devices/thermometer/)).
