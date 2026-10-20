# Sonoff TRVZB

## Device Information

This TRV is recommanded one for Versatile Thermostat. We recommand to use it with Zigbee2MQTT.

## Calibration with direct valve regulation

With a direct valve regulation (`over_valve` or `over_climate` with `auto_regulation_valve`), the *Regulation Threshold* must be set **in percent** and **must not be lower than 3%**:

> [!IMPORTANT]
> With a lower threshold, the Sonoff TRVZB can lose its calibration.

If the calibration has been lost, you can restore it with the [valve recalibration service](/en/docs/feature-recalibrate-valves/) (`recalibrate_valves`).

See [self-regulation](/en/docs/self-regulation/) for more details about these settings.
