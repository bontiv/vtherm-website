# Moes pilot wire thermostat

This pilot wire module (RP5Z-PM-MS, ZHT-PT01 in Zigbee2MQTT) exposes a `climate` entity, but it cannot be used directly by _VTherm_:

- the state of the `climate` is `heat` and not the active preset, so the [command customization of `over_switch`](/en/docs/over-switch/) cannot know if the radiator is heating;
- with the Tuya integration, the module only exposes the `heat_cool` mode, which also rules out `over_climate`.

## Installation with a virtual switch

1. Create a template switch: _Settings_ > _Devices & services_ > _Helpers_ > _Create helper_ > _Template_ > _Switch_.
2. Use the preset of the module as the state of the switch, for example `{{ is_state_attr('climate.my_module', 'preset_mode', 'comfort') }}`.
3. For the _turn on_ action, call `climate.set_preset_mode` with the `comfort` preset. For the _turn off_ action, call it with the `antifrost` preset.
4. Create a _VTherm_ `over_switch` on this switch, as described below.

The preset names above are the ones exposed by Zigbee2MQTT. Check the `preset_modes` attribute of your entity in _Developer tools_ > _States_ and use the exact same names.

> [!NOTE]
> Because a virtual switch is required, this device is partially compatible.
