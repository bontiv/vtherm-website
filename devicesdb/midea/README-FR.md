# Midea

Les climatisations et pompes à chaleur Midea fonctionnent avec le type `over_climate`. La même installation s'applique aux marques construites par Midea, comme Airwell.

## Prérequis

Installez une intégration Midea locale depuis HACS : **Midea AC LAN** (`midea_ac_lan`) ou **Midea Smart AC** (`midea-ac-py`). Les deux pilotent l'unité directement sur le réseau local.

## Limitations

1. La consigne minimale de l'unité est souvent de 17 °C. Vérifiez le `min_temp` de l'entité sous-jacente avant de choisir vos presets.
2. Juste après un démarrage automatique, certaines unités s'éteignent d'elles-mêmes : vérifiez l'état de l'unité si vous utilisez le démarrage et l'arrêt automatiques.

## Airwell

Les climatiseurs Airwell utilisent la même intégration Midea AC LAN. Si deux commandes _VTherm_ sont trop rapprochées, le climatiseur s'arrête de lui-même. Pour cette raison, les appareils Airwell sont partiellement compatibles.
