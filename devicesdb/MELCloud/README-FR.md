## Prérequis

Vous devez configurer l'intégration MELCloud.

[![Ouvrir Home Assistant et configurer l'intégration.](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=melcloud)

## Limitations

MELCloud est une intégration cloud : certaines commandes sont perdues, et après un redémarrage l'état du démarrage et de l'arrêt automatiques peut être désynchronisé de l'unité. Activez la [réparation de l'état incorrect des équipements](/fr/docs/feature-advanced/#réparer-létat-incorrect-des-équipements) pour renvoyer l'état attendu. Quand vous pilotez l'unité à la main, désactivez d'abord le _VTherm_, sinon la réparation annulera votre changement.

Les vitesses de ventilation MELCloud (1 à 5) ne correspondent pas aux modes de ventilation de _VTherm_, le mode de ventilation automatique peut donc choisir la mauvaise vitesse.
