# Known limitations

The following devices work with Versatile Thermostat, but with limitations. Some features will not work, or the regulation will not be as good as with a fully compatible device.

## Air conditioners and heat pumps

1. **Airwell** air conditioners with the "Midea AC LAN" integration. If two _VTherm_ commands are too close together, the air conditioner stops itself.
2. **Sensibo**: after an `off` command, a fan mode command can switch the air conditioner back on. Some units also turn off on their own.
3. **LG ThinQ**: the cloud integration rejects some commands (`target_temperature_low`), and regulation cycles are lost when the cloud is unavailable.
4. **Gree**: with auto-start/stop, the auto-stop does not send `off` to the air conditioner.
5. **Airzone Aidoo**: the eco mode of the Airzone app forces 18 °C or off: disable it. After an auto-stop, a heating request can turn the unit on without _VTherm_ sending `off` afterwards.
6. **Panasonic Comfort Cloud**: the fan modes use capital letters, so the automatic fan mode of _VTherm_ does not work. The internal sensor of the unit is unstable: use a room sensor.
7. **Mitsubishi Heavy Industries WF-RAC**: keep the integration up to date, older versions turned the unit off right after start. The Wi-Fi module restarts regularly and is unavailable for about 30 seconds.
8. **Atlantic Naviclim** (GW003-AS-IN-TE-FC): auto-start works in heating mode, but cooling regulation is slow.

## Thermostats and heating systems

1. **Homematic** thermostats (and possibly Homematic IP) are known to have issues with Versatile Thermostat due to the limitations of the underlying RF protocol. This problem particularly arises when trying to control multiple Homematic thermostats at once in a single VTherm instance. To reduce service cycle load, you can, for example, group thermostats using Homematic-specific procedures (e.g., using a wall-mounted thermostat) and let Versatile Thermostat control only the wall-mounted thermostat directly. Another option is to control a single thermostat and propagate mode and temperature changes via automation.
2. **Rointe** type thermostats tend to wake up on their own. The rest works normally.
3. Heating systems based on **Netatmo** perform poorly. Netatmo schedules conflict with _VTherm_ programming. Netatmo devices constantly revert to `Auto` mode, which is poorly managed with _VTherm_. In this mode, _VTherm_ cannot determine whether the system is heating or cooling, making it impossible to select the correct algorithm. Some users have managed to make it work using a virtual switch between _VTherm_ and the underlying system, but stability is not guaranteed. An example is provided in the [troubleshooting](/en/docs/troubleshooting/) section.
4. **ecobee**: check the temperature unit. A mix between °F and °C can pin the setpoint to the minimum value of the thermostat.
5. **MOES pilot wire thermostat** (RP5Z-PM-MS / ZHT-PT01): the setpoint is ignored when the thermostat is not in the right preset. The setpoint must be above the room temperature to get the comfort mode.
