# Aqara W100

L'Aqara W100 (Zigbee `TH-S04D`) est un capteur de température et d'humidité doté d'un écran et de boutons. Il sert de capteur de température de la pièce pour un _VTherm_ (voir [attributs de base](/fr/docs/base-attributes/)) et peut aussi servir de télécommande murale pour changer le mode et la consigne du _VTherm_.

## Utilisation comme télécommande du _VTherm_

Depuis Zigbee2MQTT 2.7.0, le W100 expose une entité climat virtuelle. Le blueprint [Aqara W100 Thermostat Synchronization](/fr/plugins/#kipk/aqara-w100-z2m-converter) la synchronise avec le _VTherm_ dans les deux sens :

1. Mettez à jour Zigbee2MQTT en 2.7.0 ou plus récent et appairez le W100.
2. Activez l'interrupteur `Thermostat mode` du W100.
3. Importez le blueprint et créez une automatisation avec :
   - _Main Thermostat_ : l'entité climat du _VTherm_,
   - _Aqara W100 Climate Controller_ : l'entité climat du W100.

Les changements de mode, de consigne et de ventilation faits sur le W100 sont appliqués au _VTherm_, et ceux faits sur le _VTherm_ sont affichés sur le W100. Le blueprint peut aussi afficher une température et une humidité externes sur l'écran du W100.

> [!NOTE]
> Le firmware du W100 ne gère que des consignes au degré entier : les demi-degrés ne peuvent pas être réglés depuis les boutons du W100.

## Fréquence de remontée

Comme les autres capteurs Aqara, le W100 ne remonte la température que lorsqu'elle change. Dans une pièce stable, vérifiez que le délai entre deux mesures reste inférieur au délai de sécurité du _VTherm_ (voir [Thermomètres recommandés](/fr/devices/thermometer/)).
