# Eurotronic Comet

The Eurotronic Comet Zigbee TRVs (COZB0001, CoZB_dha) can be used with [self-regulation by direct valve control](/en/docs/self-regulation/#self-regulation-by-direct-valve-control).

## Zigbee2MQTT settings

Set `trv_mode` to `1` in Zigbee2MQTT. In this mode, the valve is controlled directly with `valve_position`: the display shows the valve opening and the buttons of the TRV are disabled. With the default value `2`, the TRV regulates on its own and ignores `valve_position`.

The TRV can switch back to automatic mode on its own: check `trv_mode` if the valve stops following _VTherm_.

## Maximum opening

`valve_position` ranges from 0 (closed) to 255 (fully open), not from 0 to 100. Set the maximum opening (`max_opening_degrees`) to `255` so that _VTherm_ uses the full range of the valve. With a maximum of 100, the valve would never open more than about 40 %.
