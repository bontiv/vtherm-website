# Sonoff TRV-ZBT

## Informations sur l'appareil

Le TRV-ZBT est la deuxième génération (Gen2) de la vanne Sonoff TRV. Nous recommandons de l'utiliser avec [Zigbee2MQTT](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html). Le comportement est le même avec ZHA.

> [!WARNING]
> Cet appareil n'est que **partiellement** compatible avec VTherm. Le contrôle direct de la vanne ne fonctionne pas : le thermostat interne de la vanne garde le contrôle, quelles que soient les valeurs de `heating_valve_position` et `idle_valve_position`. Utilisez un thermostat sur climate sans contrôle direct de la vanne, ou essayez le blueprint expérimental ci-dessous.

## Réglages recommandés de la vanne

- Désactivez [`smart_temperature_control`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#smart-temperature-control-binary) (appelé « adaptive mode » dans ZHA).
- Réglez [`temperature_accuracy`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#temperature-accuracy-numeric) à -0,2 °C, pour que la vanne suive la consigne au plus près.

## Contrôle direct de la vanne (expérimental)

Le blueprint [Sonoff TRV-ZBT valve kick](https://gist.github.com/bontiv/af2d59adb15bf3d522282edd662a75e4) force la vanne à appliquer chaque ouverture envoyée par VTherm, sans modifier la consigne.

[![Ouvrez votre instance Home Assistant et affichez la boîte de dialogue d'import du blueprint pré-remplie.](https://my.home-assistant.io/badges/blueprint_import.svg)](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgist.githubusercontent.com%2Fbontiv%2Faf2d59adb15bf3d522282edd662a75e4%2Fraw%2Fsonoff_trv_zbt_vtherm.yaml)

- Dans VTherm, choisissez l'auto-régulation par contrôle direct de la vanne, avec `heating_valve_position` comme entité de degré d'ouverture et sans entité de degré de fermeture.
- Désactivez « Follow underlying temp change » et la synchronisation de la température de l'appareil dans VTherm.
- Désactivez [`open_window`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#open-window-binary) sur la vanne.

## Pas de température

La vanne n'accepte que des consignes par pas de 0,5 °C. C'est pourquoi la configuration ci-dessous utilise un pas de température de 0,5 °C.

*Source : [discussion « Support for the new SONOFF TRV Gen2 »](https://github.com/jmcollin78/versatile_thermostat/discussions/2067).*
