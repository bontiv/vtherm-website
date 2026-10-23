# TRV without direct valve control

These thermostatic radiator valves (TRV) do not let Home Assistant set the valve opening: the opening is not exposed, or only as a read-only value. _VTherm_ can only act on the TRV setpoint, with the [self-regulation](/en/docs/self-regulation/#other-self-regulation) of the `over_climate` type. The TRV keeps its own internal regulation, so the regulation is less accurate than with [direct valve control](/en/docs/self-regulation/#self-regulation-by-direct-valve-control). That is why these devices are only partially compatible.

## Recommendations

1. Use a room temperature sensor placed away from the radiator. If the TRV accepts an external temperature, synchronize it (see [device temperature synchronization](/en/docs/feature-sync_device_temp/)).
2. Disable the window detection and the frost protection of the TRV itself: they conflict with _VTherm_.
3. When turned off, many TRVs set their own frost setpoint (5 to 7 °C). With `follow_underlying_temp_change`, _VTherm_ takes over this setpoint.
4. With the [central boiler](/en/docs/feature-central-boiler/), check that the TRV reports `hvac_action`. Without it, _VTherm_ cannot know if the radiator is heating and the boiler is not triggered correctly.

## Known devices

- **Aqara E1 (SRTS-A01)**: no `hvac_action` and no valve opening. Turning it off makes the valve run a full cycle, which drains the battery: a low setpoint is better.
- **Danfoss Ally**: the valve often opens only between 10 and 30 %, so the target can be missed. The external temperature must be sent multiplied by 100, which _VTherm_ does not do: use an automation.
- **tado X**: no access to the valve opening. Without temperature synchronization, the TRV keeps regulating on its internal sensor.
- **Eve Thermo**: no `hvac_action`, and its internal sensor is biased by the radiator.
- **MOES BRT-100-TRV**: the valve position is read-only.
- **MOES TV01-ZB**: no `hvac_action`, so the heating state shown by _VTherm_ is inaccurate.
- **Avatto TRV06**: setpoint only. With the central boiler, the boiler can run very short cycles.
- **Schneider Wiser CCTFR6100Z3**: the valve can swing between 40 and 100 %, which drains the battery.
