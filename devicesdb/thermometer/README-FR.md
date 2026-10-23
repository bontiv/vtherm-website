# Thermomètres recommandés

Un thermomètre déporté, placé dans la zone de vie, est indispensable dans une installation _VTherm_ : il garantit une régulation fiable, confortable et stable de la température.

Les capteurs de température suivants sont couramment utilisés avec Versatile Thermostat et sont totalement compatibles avec Home Assistant :

- ⭐ [Sonoff SNZB-02D Zigbee](https://www.domadoo.fr/fr/suivi-energie/6614-sonoff-capteur-de-temperature-et-d-humidite-zigbee-30-avec-ecran-6920075740004.html?domid=97) — le plus utilisé et donc le meilleur choix,
- [Neo NAS-TH07B3 Tuya Zigbee](https://www.domadoo.fr/fr/produits-compatibles-jeedom/7564-neo-capteur-de-temperature-et-humidite-zigbee-30-tuya.html?domid=97),
- [Moes ZSS-KB-TH-LF-C Tuya Zigbee](https://www.domadoo.fr/fr/domotique/6667-moes-capteur-de-temperature-et-humidite-avec-ecran-zigbee-tuya.html?domid=97),
- [Sonoff SNZB-02P Zigbee](https://www.domadoo.fr/fr/chauffage-connecte/6732-sonoff-capteur-de-temperature-et-d-humidite-zigbee-30-avec-support.html?domid=97),
- [Aqara T1 Zigbee](https://www.domadoo.fr/fr/thermometre-connecte/6705-aqara-capteur-de-temperature-et-d-humidite-zigbee-30-t1-th-s02d-6975833352159.html?domid=97),
- Station météo Netatmo (intégration cloud).

Configurez le capteur de température de la pièce dans les attributs principaux du _VTherm_ (voir [attributs de base](/fr/docs/base-attributes/)).

## Fréquence de remontée

_VTherm_ a besoin de mesures de température régulières. Si le capteur ne remonte rien pendant trop longtemps, le _VTherm_ passe en mode sécurité.

- Beaucoup de capteurs Zigbee (Aqara par exemple) ne remontent la température que lorsqu'elle change. Dans une pièce stable, le délai entre deux mesures peut dépasser le délai de sécurité : ajustez si possible les paramètres de remontée (reporting) dans Zigbee2MQTT.
- Les capteurs cloud comme la station météo Netatmo ne sont mis à jour que toutes les quelques minutes.
