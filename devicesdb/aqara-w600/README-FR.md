# Aqara W600

Fonctionne parfaitement en mode `over_climate`. Doté d'une fonction d'étalonnage interne de la température, il est idéal pour la synchronisation de cette dernière. Très complet en Zigbee, ses fonctionnalités sont cependant bien plus limitées en Matter over Thread.

> [!NOTE]
> Zigbee2MQTT n'expose la position de la vanne qu'en lecture : _VTherm_ ne peut pas utiliser le [contrôle direct de la vanne](/fr/docs/self-regulation/#auto-régulation-par-contrôle-direct-de-la-vanne) et régule par la consigne. Pour cette raison, la W600 est partiellement compatible. Voir [TRV sans contrôle direct de la vanne](/fr/devices/trv-no-valve/) pour les recommandations.
