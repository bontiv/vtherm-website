# Sonoff TRVZB

## Informations sur l'appareil

Cette vanne thermostatique est la vanne recommandée pour Versatile Thermostat. Nous recommandons de l'utiliser avec Zigbee2MQTT.

## Contrôle direct de la vanne

### Configuration de l'appareil

1. Créez un _VTherm_ `over_climate` sur l'entité `climate` du TRV, avec l'auto-régulation [`Contrôle direct de la vanne`](/fr/docs/self-regulation/#auto-régulation-par-contrôle-direct-de-la-vanne). Laissez décochée l'option `Compenser la température interne du sous-jacent`.
2. Dans la configuration de la régulation par vanne, sélectionnez les entités `number` du TRV : `opening_degree` pour l'ouverture et `closing_degree` pour la fermeture. Ces entités peuvent être masquées ou désactivées par défaut dans Zigbee2MQTT ou ZHA : activez-les d'abord.
3. Pour aligner le thermomètre interne du TRV sur la température de la pièce, activez la [synchronisation de la température de l'appareil](/fr/docs/feature-sync_device_temp/), avec son entité de calibrage ou son entité `external_temperature_input`.
4. N'activez l'entité `Follow underlying temp change` du _VTherm_ qu'après avoir vérifié que cette configuration de base fonctionne (voir [suivre les changements de température du sous-jacent](/fr/docs/over-climate/#suivre-les-changements-de-température-du-sous-jacent)).

### Calibrage

Avec le contrôle direct de la vanne (`over_valve` ou `over_climate` avec `auto_regulation_valve`), le *Seuil de régulation* doit être spécifié **en pourcentage** et **ne doit pas être inférieur à 3 %** :

> [!IMPORTANT]
> Avec un seuil plus bas, le calibrage peut être perdu.

Si le calibrage a été perdu, vous pouvez le restaurer avec le [service de recalibrage des vannes](/fr/docs/feature-recalibrate-valves/) (`recalibrate_valves`).

Voir [auto-régulation](/fr/docs/self-regulation/) pour plus de détails sur ces réglages.
