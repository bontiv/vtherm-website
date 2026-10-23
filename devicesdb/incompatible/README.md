# Known incompatibilities

The following devices are known not to work with Versatile Thermostat. Devices that work with limitations are listed on the [known limitations](/en/devices/known-limitations/) page.

1. **Danfoss POPP** valves with temperature feedback. It is impossible to turn off this valve as it auto-regulates itself, causing conflicts with VTherm.
2. **Heatzy** type thermostats that do not support `set_temperature` commands. Only the models without `set_temperature` are concerned: the Heatzy pilote is supported (see [Heatzy](/en/devices/heatzy/)).
3. Climates based on the **Overkiz** integration do not work. It seems impossible to turn off or even change the temperature on these systems.
4. **Tuya Wi-Fi Smart TRV**: when the room temperature is synchronized with the calibration offset, the offset drifts endlessly. The device cannot be regulated by _VTherm_.
5. **MOES BHT-002** thermostats: the target temperature jumps to aberrant values. The BHT-006 model does not have this problem.
6. Thermostats that only expose the `heat_cool` mode (for example some Beok or Tuya thermostats). _VTherm_ cannot know if the device is heating or cooling.
