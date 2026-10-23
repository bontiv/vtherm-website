# Daikin

Les climatisations et pompes à chaleur Daikin fonctionnent avec le type `over_climate`, mais le résultat dépend beaucoup de l'intégration Home Assistant.

## Choix de l'intégration

1. **Daikin AC (local)** : l'intégration native dialogue directement avec l'adaptateur Wi-Fi sur le réseau local. Les commandes sont appliquées immédiatement. C'est le meilleur choix si votre adaptateur le permet.
2. **Daikin Onecta (cloud)** : les commandes passent par le cloud Daikin. Elles sont lentes, et le quota quotidien de l'API peut être épuisé en quelques heures car _VTherm_ envoie souvent des commandes. Quand l'intégration devient indisponible, l'état du _VTherm_ peut être perdu.
3. **Adaptateurs BRP069B4x** : avec l'intégration native, certains utilisateurs voient la climatisation s'éteindre juste après son démarrage par _VTherm_. L'intégration Daikin de HACS fonctionne avec ces adaptateurs.

## Recommandations

- Évitez d'envoyer des commandes marche/arrêt trop rapprochées : l'appareil peut les ignorer.
- Avec l'intégration cloud, préférez une auto-régulation légère pour limiter le nombre de commandes.

> [!NOTE]
> À cause de ces limitations, les appareils Daikin sont partiellement compatibles.
