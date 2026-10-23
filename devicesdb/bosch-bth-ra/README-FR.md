# Bosch Radiator Thermostat II [+M]

Avec Zigbee2MQTT, ce TRV expose une entité `pi_heating_demand` modifiable. _VTherm_ peut l'utiliser pour l'[auto-régulation par contrôle direct de la vanne](/fr/docs/self-regulation/#auto-régulation-par-contrôle-direct-de-la-vanne). En mode Matter, `pi_heating_demand` est en lecture seule : utilisez le mode Zigbee.

## Limitations

1. Environ 15 minutes après la dernière commande, le TRV reprend son propre algorithme interne. Une automatisation qui renvoie régulièrement la dernière valeur de `pi_heating_demand` garde la vanne sous le contrôle de _VTherm_.
2. À l'arrêt, le TRV applique une consigne de 5 °C.
3. L'eau ne circule qu'au-delà d'environ 15 % d'ouverture : ajustez l'ouverture minimale à votre radiateur.

> [!NOTE]
> À cause de ces limitations, cet appareil est partiellement compatible.
