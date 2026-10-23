# Modules fil pilote Zigbee

Le NodOn SIN-4-FP-21 (aussi vendu sous la référence Equation SIN-4-FP-21_EQU) et la sortie de câble Legrand Céliane with Netatmo pilotent un radiateur électrique par son fil pilote. Avec Zigbee2MQTT, ils exposent une entité `select` pour le mode fil pilote, avec les mêmes options : `comfort`, `eco`, `frost_protection`, `off`, `comfort_-1` et `comfort_-2`.

## Configuration

1. Utilisez Zigbee2MQTT : avec ZHA, ces modules n'exposent qu'un interrupteur marche/arrêt.
2. Dans le _VTherm_ `over_switch`, sélectionnez l'entité du mode fil pilote (`select.*_pilot_wire_mode`), et non l'entité `switch` du module.
3. Dans la [personnalisation des commandes](/fr/docs/over-switch/), indiquez `select_option/option:comfort` comme commande de marche et `select_option/option:frost_protection` comme commande d'arrêt.

Évitez `eco` comme commande d'arrêt : le thermostat interne du radiateur continue de chauffer dans ce mode.

## Recommandations

- Réglez la température confort du radiateur au-dessus de la consigne _VTherm_, pour que son thermostat interne ne coupe pas la chauffe.
- Tous les modules d'un même _VTherm_ démarrent en même temps : tenez-en compte pour le délestage.
