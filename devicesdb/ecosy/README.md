# eCosy

eCosy thermostats are integrated into Home Assistant via the **Tuya Local** integration. They expose a `climate` entity and are used with a _VTherm_ of type [`over_switch`](/en/docs/over-switch/).

## Command customization

Because the underlying device is a `climate` entity and not a `switch`, [command customization](/en/docs/over-switch/) is **mandatory**. Configure the on and off commands with the `hvac_mode` attribute:

- **On command**: `set_hvac_mode/hvac_mode:heat`
- **Off command**: `set_hvac_mode/hvac_mode:off`

Each command must follow the format `command[/attribute[:value]]` without spaces or special characters except `_`, and there must be as many on and off commands as declared underlying devices, in the same order.

> [!IMPORTANT]
> Check the values accepted by your equipment in _Developer Tools / States_: the `hvac_mode` values are case sensitive and must match exactly.

See the [`over_switch` documentation](/en/docs/over-switch/) for the complete command customization rules.
