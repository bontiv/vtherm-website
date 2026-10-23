# Midea

Midea air conditioners and heat pumps work with the `over_climate` type. The same installation applies to the brands built by Midea, like Airwell.

## Requirements

Install a local Midea integration from HACS: **Midea AC LAN** (`midea_ac_lan`) or **Midea Smart AC** (`midea-ac-py`). Both control the unit directly on the local network.

## Limitations

1. The minimum setpoint of the unit is often 17 °C. Check the `min_temp` of the underlying entity before choosing your presets.
2. Right after an auto-start, some units turn off on their own: check the state of the unit when you use auto-start/stop.

## Airwell

Airwell air conditioners use the same Midea AC LAN integration. If two _VTherm_ commands are too close together, the air conditioner stops itself. For this reason, Airwell devices are partially compatible.
