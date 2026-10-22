# Sonoff TRV-ZBT

## Informations sur l'appareil

Le TRV-ZBT est la deuxième génération (Gen2) de la vanne Sonoff TRV. Nous recommandons de l'utiliser avec [Zigbee2MQTT](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html). Le comportement est le même avec ZHA.

> [!WARNING]
> Cet appareil n'est que **partiellement** compatible avec VTherm. Le contrôle direct de la vanne ne fonctionne pas : le thermostat interne de la vanne garde le contrôle, quelles que soient les valeurs de `heating_valve_position` et `idle_valve_position`. Utilisez un thermostat sur climate sans contrôle direct de la vanne.

## Réglages recommandés de la vanne

- Désactivez [`smart_temperature_control`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#smart-temperature-control-binary) (appelé « adaptive mode » dans ZHA).
- Réglez [`temperature_accuracy`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#temperature-accuracy-numeric) à -0,2 °C, pour que la vanne suive la consigne au plus près.

## Pas de température

La vanne n'accepte que des consignes par pas de 0,5 °C. C'est pourquoi la configuration ci-dessous utilise un pas de température de 0,5 °C.

*Source : [discussion « Support for the new SONOFF TRV Gen2 »](https://github.com/jmcollin78/versatile_thermostat/discussions/2067).*
