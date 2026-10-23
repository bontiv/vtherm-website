# Limitations connues

Les appareils suivants fonctionnent avec Versatile Thermostat, mais avec des limitations. Certaines fonctionnalités ne marcheront pas, ou la régulation sera moins bonne qu'avec un appareil totalement compatible.

Tous ces appareils s'installent avec le type `over_climate` : la procédure d'installation est donnée plus bas sur cette page.

## Climatisations et pompes à chaleur

1. **Sensibo** : après une commande `off`, une commande de mode de ventilation peut rallumer le climatiseur. Certaines unités s'éteignent aussi d'elles-mêmes.
2. **LG ThinQ** : l'intégration cloud refuse certaines commandes (`target_temperature_low`), et des cycles de régulation sont perdus quand le cloud est indisponible.
3. **Gree** : avec le démarrage et l'arrêt automatiques, l'arrêt automatique n'envoie pas `off` au climatiseur.
4. **Airzone Aidoo** : le mode éco de l'application Airzone force 18 °C ou l'arrêt : désactivez-le. Après un arrêt automatique, une demande de chauffe peut allumer l'unité sans que _VTherm_ n'envoie ensuite `off`.
5. **Panasonic Comfort Cloud** : les modes de ventilation utilisent des majuscules, le mode de ventilation automatique de _VTherm_ ne fonctionne donc pas. Le capteur interne de l'unité est instable : utilisez un capteur de pièce.
6. **Mitsubishi Heavy Industries WF-RAC** : gardez l'intégration à jour, les anciennes versions éteignaient l'unité juste après le démarrage. Le module Wi-Fi redémarre régulièrement et reste indisponible environ 30 secondes.
7. **Atlantic Naviclim** (GW003-AS-IN-TE-FC) : le démarrage automatique fonctionne en chauffage, mais la régulation en refroidissement est lente.

## Thermostats et systèmes de chauffage

1. Les thermostats **Homematic** (et peut-être Homematic IP) sont connus pour poser des problèmes avec Versatile Thermostat en raison des limitations du protocole RF sous-jacent. Ce problème se pose en particulier lorsqu'on essaie de contrôler plusieurs thermostats Homematic à la fois dans une même instance VTherm. Pour réduire la charge des cycles de service, vous pouvez par exemple grouper les thermostats avec les procédures propres à Homematic (par exemple en utilisant un thermostat mural) et laisser Versatile Thermostat ne contrôler directement que le thermostat mural. Une autre option consiste à contrôler un seul thermostat et à propager les changements de mode et de température via une automatisation.
2. Les thermostats de type **Rointe** ont tendance à se réveiller d'eux-mêmes. Le reste semble fonctionner normalement.
3. Les systèmes de chauffage basés sur **Netatmo** fonctionnent mal. Les programmations Netatmo entrent en conflit avec la programmation de _VTherm_. Les appareils Netatmo reviennent constamment en mode `Auto`, qui est mal géré avec _VTherm_. Dans ce mode, _VTherm_ ne peut pas déterminer si le système chauffe ou refroidit, ce qui rend impossible le choix du bon algorithme. Certains utilisateurs ont réussi à le faire fonctionner en utilisant un switch virtuel entre _VTherm_ et le système sous-jacent, mais la stabilité n'est pas garantie. Un exemple est donné dans la section [dépannage](/fr/docs/troubleshooting/).
4. **ecobee** : vérifiez l'unité de température. Un mélange entre °F et °C peut bloquer la consigne sur la valeur minimale du thermostat.
