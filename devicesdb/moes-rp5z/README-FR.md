# Thermostat fil pilote Moes

Ce module fil pilote (RP5Z-PM-MS, ZHT-PT01 dans Zigbee2MQTT) expose une entité `climate`, mais elle ne peut pas être utilisée directement par _VTherm_ :

- l'état du `climate` vaut `heat` et non le preset actif, donc la [personnalisation des commandes d'`over_switch`](/fr/docs/over-switch/) ne peut pas savoir si le radiateur chauffe ;
- avec l'intégration Tuya, le module n'expose que le mode `heat_cool`, ce qui écarte aussi `over_climate`.

## Installation avec un switch virtuel

1. Créez un switch template : _Paramètres_ > _Appareils et services_ > _Entrées_ > _Créer une entrée_ > _Template_ > _Interrupteur_.
2. Utilisez le preset du module comme état de l'interrupteur, par exemple `{{ is_state_attr('climate.mon_module', 'preset_mode', 'comfort') }}`.
3. Pour l'action _allumer_, appelez `climate.set_preset_mode` avec le preset `comfort`. Pour l'action _éteindre_, appelez-la avec le preset `antifrost`.
4. Créez un _VTherm_ `over_switch` sur cet interrupteur, comme décrit plus bas.

Les noms de presets ci-dessus sont ceux exposés par Zigbee2MQTT. Vérifiez l'attribut `preset_modes` de votre entité dans _Outils de développement_ > _États_ et reprenez exactement les mêmes noms.

> [!NOTE]
> Comme un switch virtuel est nécessaire, cet appareil est partiellement compatible.
