# Sonoff TRVZB

## Device Information

This TRV is recommanded one for Versatile Thermostat. We recommand to use it with Zigbee2MQTT.

## Direct Valve Control

### Device configuration

1. Create a _VTherm_ `over_climate` on the `climate` entity of the TRV, with the self-regulation [`Direct control of valve`](/en/docs/self-regulation/#self-regulation-by-direct-valve-control). Leave the option `Use internal temperature of the underlying` unchecked.
2. In the valve regulation configuration, select the `number` entities of the TRV: `opening_degree` for the opening and `closing_degree` for the closing. These entities may be hidden or disabled by default in Zigbee2MQTT or ZHA: enable them first.
3. To align the internal thermometer of the TRV with the room temperature, enable the [device temperature synchronization](/en/docs/feature-sync_device_temp/), with its calibration entity or its `external_temperature_input` entity.
4. Turn on the `Follow underlying temp change` entity of the _VTherm_ only after checking that this basic configuration works (see [follow underlying temperature changes](/en/docs/over-climate/#follow-underlying-temperature-changes)).

### Calibration

With a direct valve regulation (`over_valve` or `over_climate` with `auto_regulation_valve`), the *Regulation Threshold* must be set **in percent** and **must not be lower than 3%**:

> [!IMPORTANT]
> With a lower threshold, the Sonoff TRVZB can lose its calibration.

If the calibration has been lost, you can restore it with the [valve recalibration service](/en/docs/feature-recalibrate-valves/) (`recalibrate_valves`).

See [self-regulation](/en/docs/self-regulation/) for more details about these settings.
