# Sonoff TRVZB

## Informations sur l'appareil

Cette vanne thermostatique est la vanne recommandée pour Versatile Thermostat. Nous recommandons de l'utiliser avec Zigbee2MQTT.

## Calibrage avec le contrôle direct de la vanne

Avec le contrôle direct de la vanne (`over_valve` ou `over_climate` avec `auto_regulation_valve`), le *Seuil de régulation* doit être spécifié **en pourcentage** et **ne doit pas être inférieur à 3 %** :

> [!IMPORTANT]
> Avec un seuil plus bas, le calibrage peut être perdu.

Si le calibrage a été perdu, vous pouvez le restaurer avec le [service de recalibrage des vannes](/fr/docs/feature-recalibrate-valves/) (`recalibrate_valves`).

Voir [auto-régulation](/fr/docs/self-regulation/) pour plus de détails sur ces réglages.
