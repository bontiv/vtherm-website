## Requirements

You need to setup MELCloud integration.

[![Open your Home Assistant instance and start setting up a new integration.](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=melcloud)

## Limitations

MELCloud is a cloud integration: some commands are lost, and after a restart the auto-start/stop state can be out of sync with the unit. Enable the [incorrect equipment state fix](/en/docs/feature-advanced/#fixing-incorrect-equipment-state) to resend the expected state. When you drive the unit by hand, disable the _VTherm_ first, or the fix will undo your change.

The MELCloud fan speeds (1 to 5) do not match the _VTherm_ fan modes, so the automatic fan mode can choose the wrong speed.
