# Valves (over_valve)

The `over_valve` type controls an equipment that can take a value from 0 to 100 %. At 0, heating is off, and at 100 % it is fully open. This type allows controlling a thermostatic valve (e.g., Shelly valve) that exposes a `number` type entity, enabling direct control of the valve's opening. Versatile Thermostat regulates the room temperature by adjusting the opening percentage, using both the internal and external temperature sensors, and the TPI algorithm.

> [!NOTE]
> 1. The `over_valve` type is often confused with the `over_climate` type equipped with auto-regulation and direct valve control.
> 2. You should only choose this type when you do not have an associated `climate` entity for your _TRV_ in Home Assistant, and if you only have a `number` type entity to control the valve's opening percentage. The `over_climate` with auto-regulation on the valve is much more powerful than the `over_valve` type.

## Underlying entities

Only `number` or `input_number` entities are accepted as underlying devices. The TPI algorithm recalculates the valve's opening percentage at each cycle and modifies the value of the underlying `number` entities.

## Valve opening control

`over_valve` can adjust the TPI opening command to match the physical limits of each valve:

1. `opening_threshold_degree`: below this raw TPI percentage, the valve is considered closed.
2. `max_closing_degree`: maximum closing percentage. The command under the threshold is `100 - max_closing_degree`; keep the default `100` to close it fully.
3. `min_opening_degrees`: comma-separated minimum opening values, one per underlying valve. A value is applied as soon as the threshold is reached.
4. `max_opening_degrees`: comma-separated maximum opening values, one per underlying valve. Omitted values use the maximum supported by the related `number` entity.

It is possible to choose a `thermostat_over_valve` to control an air conditioner by checking the "AC Mode" box. In this case, only the cooling mode will be visible.

## Sleep mode

`over_valve` supports sleep mode. Selecting `sleep`, or calling the `versatile_thermostat.set_hvac_mode_sleep` action, presents VTherm as off while sending a raw 100 % opening request to every underlying valve. Sleep mode does not request central boiler heating; `is_sleeping` identifies this state.

See the full [`over_valve` documentation](/en/docs/over-valve/) for more details.

## Shelly BLU TRV

The Shelly BLU TRV exposes its valve position as a `number` entity and needs a Shelly BLU gateway. It is partially compatible: some valve commands are lost over Bluetooth, the device has no `off` mode, and it can become unavailable when the Bluetooth link drops.
