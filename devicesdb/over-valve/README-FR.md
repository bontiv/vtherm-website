# Vannes (over_valve)

Le type `over_valve` contrôle un équipement qui accepte une valeur de 0 à 100 %. À 0, le chauffage est éteint, et à 100 % il est complètement ouvert. Ce type permet de contrôler une vanne thermostatique (par exemple une vanne Shelly) qui expose une entité de type `number`, ce qui permet le contrôle direct de l'ouverture de la vanne. Versatile Thermostat régule la température de la pièce en ajustant le pourcentage d'ouverture, en utilisant les capteurs de température interne et externe, et l'algorithme TPI.

> [!NOTE]
> 1. Le type `over_valve` est souvent confondu avec le type `over_climate` équipé de l'auto-régulation avec contrôle direct de la vanne.
> 2. Ne choisissez ce type que si vous n'avez pas d'entité `climate` associée à votre _TRV_ dans Home Assistant, et si vous n'avez qu'une entité de type `number` pour contrôler le pourcentage d'ouverture de la vanne. L'`over_climate` avec auto-régulation sur la vanne est bien plus puissant que le type `over_valve`.

## Sous-jacents

Seules les entités `number` ou `input_number` sont acceptées comme équipements sous-jacents. L'algorithme TPI recalcule le pourcentage d'ouverture de la vanne à chaque cycle et modifie la valeur des entités `number` sous-jacentes.

## Contrôle de l'ouverture de la vanne

`over_valve` peut ajuster la commande d'ouverture TPI aux limites physiques de chaque vanne :

1. `opening_threshold_degree` : sous ce pourcentage TPI brut, la vanne est considérée comme fermée.
2. `max_closing_degree` : pourcentage maximal de fermeture. La commande sous le seuil vaut `100 - max_closing_degree` ; conservez la valeur par défaut `100` pour la fermer complètement.
3. `min_opening_degrees` : valeurs minimales d'ouverture séparées par des virgules, une par vanne sous-jacente. Une valeur est appliquée dès que le seuil est atteint.
4. `max_opening_degrees` : valeurs maximales d'ouverture séparées par des virgules, une par vanne sous-jacente. Les valeurs omises utilisent le maximum supporté par l'entité `number` associée.

Il est possible de choisir un `thermostat_over_valve` pour contrôler une climatisation en cochant la case « Mode AC ». Dans ce cas, seul le mode refroidissement sera visible.

## Mode veille (sleep)

`over_valve` supporte le mode veille. La sélection de `sleep`, ou l'appel de l'action `versatile_thermostat.set_hvac_mode_sleep`, présente le VTherm comme éteint tout en envoyant une demande d'ouverture brute de 100 % à chaque vanne sous-jacente. Le mode veille ne demande pas de chauffage à la chaudière centrale ; `is_sleeping` identifie cet état.

Voir la [documentation complète `over_valve`](/fr/docs/over-valve/) pour plus de détails.
