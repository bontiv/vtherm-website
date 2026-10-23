# Eurotronic Comet

Les têtes thermostatiques Zigbee Eurotronic Comet (COZB0001, CoZB_dha) peuvent être utilisées avec l'[auto-régulation par contrôle direct de la vanne](/fr/docs/self-regulation/#auto-régulation-par-contrôle-direct-de-la-vanne).

## Réglages Zigbee2MQTT

Réglez `trv_mode` sur `1` dans Zigbee2MQTT. Dans ce mode, la vanne est pilotée directement par `valve_position` : l'afficheur montre l'ouverture de la vanne et les boutons de la tête sont désactivés. Avec la valeur par défaut `2`, la tête régule seule et ignore `valve_position`.

La tête peut repasser d'elle-même en mode automatique : vérifiez `trv_mode` si la vanne ne suit plus _VTherm_.

## Ouverture maximale

`valve_position` va de 0 (fermée) à 255 (complètement ouverte), et non de 0 à 100. Réglez l'ouverture maximale (`max_opening_degrees`) sur `255` pour que _VTherm_ utilise toute la plage de la vanne. Avec un maximum de 100, la vanne ne s'ouvrirait jamais à plus de 40 % environ.
