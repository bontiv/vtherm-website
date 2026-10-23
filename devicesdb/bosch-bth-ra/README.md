# Bosch Radiator Thermostat II [+M]

With Zigbee2MQTT, this TRV exposes a writable `pi_heating_demand` entity. _VTherm_ can use it for [self-regulation by direct valve control](/en/docs/self-regulation/#self-regulation-by-direct-valve-control). In Matter mode, `pi_heating_demand` is read-only: use the Zigbee mode.

## Limitations

1. About 15 minutes after the last command, the TRV goes back to its own internal algorithm. An automation that sends the last `pi_heating_demand` value again at regular intervals keeps the valve under _VTherm_ control.
2. When turned off, the TRV sets a 5 °C setpoint.
3. Water flows only above about 15 % of opening: adjust the minimal opening to your radiator.

> [!NOTE]
> Because of these limitations, this device is partially compatible.
