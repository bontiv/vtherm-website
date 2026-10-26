# Recommended thermometers

An externalized temperature measurement device, placed where you live, is essential in a _VTherm_ setup: it ensures reliable, comfortable and stable temperature control.

The following temperature sensors are commonly used with Versatile Thermostat and are fully compatible with Home Assistant:

- ⭐ [Sonoff SNZB-02D Zigbee](https://www.domadoo.fr/en/suivi-energie/6614-sonoff-capteur-de-temperature-et-d-humidite-zigbee-30-avec-ecran-6920075740004.html?domid=97) — the most used and therefore the best choice,
- [Neo NAS-TH07B3 Tuya Zigbee](https://www.domadoo.fr/en/produits-compatibles-jeedom/7564-neo-capteur-de-temperature-et-humidite-zigbee-30-tuya.html?domid=97),
- [Moes ZSS-KB-TH-LF-C Tuya Zigbee](https://www.domadoo.fr/en/domotique/6667-moes-capteur-de-temperature-et-humidite-avec-ecran-zigbee-tuya.html?domid=97),
- [Sonoff SNZB-02P Zigbee](https://www.domadoo.fr/en/chauffage-connecte/6732-sonoff-capteur-de-temperature-et-d-humidite-zigbee-30-avec-support.html?domid=97),
- [Aqara T1 Zigbee](https://www.domadoo.fr/en/thermometre-connecte/6705-aqara-capteur-de-temperature-et-d-humidite-zigbee-30-t1-th-s02d-6975833352159.html?domid=97),
- [Aqara W100 Zigbee](/en/devices/aqara-w100/) — also a wall-mounted remote for the _VTherm_,
- Netatmo Weather Station (cloud integration).

Configure the room temperature sensor in the _VTherm_ main attributes (see [base attributes](/en/docs/base-attributes/)).

## Reporting interval

_VTherm_ needs regular temperature updates. If the sensor does not report for too long, the _VTherm_ goes into safety mode.

- Many Zigbee sensors (Aqara for example) only report when the temperature changes. In a stable room, the delay between two updates can exceed the safety delay: adjust the reporting settings in Zigbee2MQTT if possible.
- Cloud sensors like the Netatmo Weather Station are only updated every few minutes.
