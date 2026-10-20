# eCosy

Les thermostats eCosy sont intégrés à Home Assistant via l'intégration **Tuya Local**. Ils exposent une entité `climate` et s'utilisent avec un _VTherm_ de type [`over_switch`](/fr/docs/over-switch/).

## Personnalisation des commandes

Comme l'équipement sous-jacent est une entité `climate` et non un `switch`, la [personnalisation des commandes](/fr/docs/over-switch/) est **obligatoire**. Configurez les commandes on et off avec l'attribut `hvac_mode` :

- **Commande on** : `set_hvac_mode/hvac_mode:heat`
- **Commande off** : `set_hvac_mode/hvac_mode:off`

Chaque commande doit suivre le format `command[/attribute[:value]]` sans espaces ni caractères spéciaux autres que `_`, et il doit y avoir autant de commandes on et off que d'équipements sous-jacents déclarés, dans le même ordre.

> [!IMPORTANT]
> Vérifiez les valeurs acceptées par votre équipement dans _Outils de développement / États_ : les valeurs de `hvac_mode` sont sensibles à la casse et doivent correspondre exactement.

Voir la [documentation `over_switch`](/fr/docs/over-switch/) pour les règles complètes de personnalisation des commandes.
