# Heatzy pilote

The Heatzy pilote controls an electric heater through its pilot wire. The Heatzy integration exposes it as a `climate` entity whose state is not the active preset: the [command customization of `over_switch`](/en/docs/over-switch/) with `set_preset_mode` cannot know if the heater is on, and the off command is never sent.

## Installation with a virtual switch

1. Create a template switch: _Settings_ > _Devices & services_ > _Helpers_ > _Create helper_ > _Template_ > _Switch_.
2. Use the preset of the Heatzy as the state of the switch, for example `{{ is_state_attr('climate.my_heatzy', 'preset_mode', 'comfort') }}`.
3. For the _turn on_ action, call `climate.set_preset_mode` with the `comfort` preset. For the _turn off_ action, call it with the `away` preset.
4. Create a _VTherm_ `over_switch` on this switch, as described below.

Check the `preset_modes` attribute of your entity in _Developer tools_ > _States_ and use the exact same names.

## Activation delays

The Heatzy changes state slowly. The minimal activation and deactivation delays are set to 30 seconds so that each command has time to be applied.
