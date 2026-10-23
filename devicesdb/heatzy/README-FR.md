# Heatzy pilote

Le Heatzy pilote commande un radiateur électrique par son fil pilote. L'intégration Heatzy l'expose comme une entité `climate` dont l'état n'est pas le preset actif : la [personnalisation des commandes d'`over_switch`](/fr/docs/over-switch/) avec `set_preset_mode` ne peut pas savoir si le radiateur est allumé, et la commande d'arrêt n'est jamais envoyée.

## Installation avec un switch virtuel

1. Créez un switch template : _Paramètres_ > _Appareils et services_ > _Entrées_ > _Créer une entrée_ > _Template_ > _Interrupteur_.
2. Utilisez le preset du Heatzy comme état de l'interrupteur, par exemple `{{ is_state_attr('climate.mon_heatzy', 'preset_mode', 'comfort') }}`.
3. Pour l'action _allumer_, appelez `climate.set_preset_mode` avec le preset `comfort`. Pour l'action _éteindre_, appelez-la avec le preset `away`.
4. Créez un _VTherm_ `over_switch` sur cet interrupteur, comme décrit plus bas.

Vérifiez l'attribut `preset_modes` de votre entité dans _Outils de développement_ > _États_ et reprenez exactement les mêmes noms.

## Délais d'activation

Le Heatzy change d'état lentement. Les délais minimaux d'activation et de désactivation sont fixés à 30 secondes pour que chaque commande ait le temps d'être appliquée.
