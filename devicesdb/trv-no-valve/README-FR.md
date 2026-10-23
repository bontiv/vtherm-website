# TRV sans contrôle direct de la vanne

Ces vannes thermostatiques (TRV) ne permettent pas à Home Assistant de régler l'ouverture de la vanne : l'ouverture n'est pas exposée, ou seulement en lecture. _VTherm_ ne peut agir que sur la consigne du TRV, avec l'[auto-régulation](/fr/docs/self-regulation/#autres-auto-régulation) du type `over_climate`. Le TRV garde sa propre régulation interne, la régulation est donc moins précise qu'avec le [contrôle direct de la vanne](/fr/docs/self-regulation/#auto-régulation-par-contrôle-direct-de-la-vanne). C'est pourquoi ces appareils ne sont que partiellement compatibles.

## Recommandations

1. Utilisez un capteur de température de pièce placé loin du radiateur. Si le TRV accepte une température externe, synchronisez-la (voir [synchronisation de la température de l'appareil](/fr/docs/feature-sync_device_temp/)).
2. Désactivez la détection de fenêtre et le hors-gel du TRV lui-même : ils entrent en conflit avec _VTherm_.
3. À l'arrêt, beaucoup de TRV appliquent leur propre consigne hors-gel (5 à 7 °C). Avec `follow_underlying_temp_change`, _VTherm_ reprend cette consigne.
4. Avec la [chaudière centrale](/fr/docs/feature-central-boiler/), vérifiez que le TRV remonte `hvac_action`. Sans cela, _VTherm_ ne sait pas si le radiateur chauffe et la chaudière n'est pas déclenchée correctement.

## Appareils connus

- **Aqara E1 (SRTS-A01)** : pas de `hvac_action` ni d'ouverture de vanne. L'arrêt fait faire un cycle complet à la vanne, ce qui use la batterie : préférez une consigne basse.
- **Danfoss Ally** : la vanne n'ouvre souvent qu'entre 10 et 30 %, la consigne peut ne pas être atteinte. La température externe doit être envoyée multipliée par 100, ce que _VTherm_ ne fait pas : utilisez une automatisation.
- **tado X** : pas d'accès à l'ouverture de la vanne. Sans synchronisation de la température, le TRV continue de réguler sur son capteur interne.
- **Eve Thermo** : pas de `hvac_action`, et son capteur interne est faussé par le radiateur.
- **MOES BRT-100-TRV** : la position de la vanne est en lecture seule.
- **MOES TV01-ZB** : pas de `hvac_action`, l'état de chauffe affiché par _VTherm_ est donc inexact.
- **Avatto TRV06** : consigne seule. Avec la chaudière centrale, la chaudière peut faire des cycles très courts.
- **Schneider Wiser CCTFR6100Z3** : la vanne peut osciller entre 40 et 100 %, ce qui use la batterie.
