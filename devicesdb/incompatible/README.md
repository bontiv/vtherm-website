# Known incompatibilities

Some TRV type thermostats are known to be incompatible with Versatile Thermostat. This includes the following valves:

1. **Danfoss POPP** valves with temperature feedback. It is impossible to turn off this valve as it auto-regulates itself, causing conflicts with VTherm.
2. **Homematic** thermostats (and possibly Homematic IP) are known to have issues with Versatile Thermostat due to the limitations of the underlying RF protocol. This problem particularly arises when trying to control multiple Homematic thermostats at once in a single VTherm instance. To reduce service cycle load, you can, for example, group thermostats using Homematic-specific procedures (e.g., using a wall-mounted thermostat) and let Versatile Thermostat control only the wall-mounted thermostat directly. Another option is to control a single thermostat and propagate mode and temperature changes via automation.
3. **Heatzy** type thermostats that do not support `set_temperature` commands. Only the models without `set_temperature` are concerned: the Heatzy pilote is supported (see [Heatzy](/en/devices/heatzy/)).
4. **Rointe** type thermostats tend to wake up on their own. The rest works normally.
5. TRVs like **Aqara SRTS-A01** and **MOES TV01-ZB**, which lack the `hvac_action` state feedback to determine whether they are heating or not. Therefore, state feedback is inaccurate, but the rest seems functional.
6. **Airwell** air conditioners with the "Midea AC LAN" integration. If two VTherm commands are too close together, the air conditioner stops itself.
7. Climates based on the **Overkiz** integration do not work. It seems impossible to turn off or even change the temperature on these systems.
8. Heating systems based on **Netatmo** perform poorly. Netatmo schedules conflict with _VTherm_ programming. Netatmo devices constantly revert to `Auto` mode, which is poorly managed with _VTherm_. In this mode, _VTherm_ cannot determine whether the system is heating or cooling, making it impossible to select the correct algorithm. Some users have managed to make it work using a virtual switch between _VTherm_ and the underlying system, but stability is not guaranteed. An example is provided in the [troubleshooting](/en/docs/troubleshooting/) section.
