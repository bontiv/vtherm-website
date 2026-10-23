# Aqara W600

Works well in `over_climate` mode. It has an internal temperature calibration function, making it a good candidate for temperature synchronization. It is very comprehensive in Zigbee, but its capabilities are much more limited in Matter over Thread.

> [!NOTE]
> Zigbee2MQTT only exposes the valve position as a read-only value: _VTherm_ cannot use [direct valve control](/en/docs/self-regulation/#self-regulation-by-direct-valve-control) and regulates through the setpoint. For this reason, the W600 is partially compatible. See [TRV without direct valve control](/en/devices/trv-no-valve/) for the recommendations.
