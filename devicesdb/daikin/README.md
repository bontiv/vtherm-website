# Daikin

Daikin air conditioners and heat pumps work with the `over_climate` type, but the result depends a lot on the Home Assistant integration.

## Choosing the integration

1. **Daikin AC (local)**: the core integration talks directly to the Wi-Fi adapter on the local network. Commands are applied immediately. This is the best choice when your adapter supports it.
2. **Daikin Onecta (cloud)**: commands go through the Daikin cloud. They are slow, and the daily API quota can be used up within a few hours because _VTherm_ sends commands often. When the integration becomes unavailable, the _VTherm_ state can be lost.
3. **BRP069B4x adapters**: with the core integration, some users see the air conditioner turn off right after _VTherm_ starts it. The HACS Daikin integration works with these adapters.

## Recommendations

- Avoid sending on/off commands too close together: the unit can drop them.
- With the cloud integration, prefer a light self-regulation to limit the number of commands.

> [!NOTE]
> Because of these limitations, Daikin devices are partially compatible.
