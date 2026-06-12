# Tuya TRV602

Les appareils Tuya peuvent être vendu en marque blanche par d'autres constructeurs.


Cette page est sur le fonctionnement de la vanne termostatique Tuya en utilisant le protocole Zigbee. Pour l'utilisation avec une passerelle Tuya, consultez [l'intégration Tuya WIFI](../tuya-wifi/).


> [!WARNING]
> Cet appareil **N'EST PAS** recommandé avec Versatile Thermostat. Il est instable et nécessite une automatisation pour fonctionner.


## Automatisation

Vous devez ajouter cette automatisation. Changez les IDs des entités par vos IDs.

```
alias: "TRV: Erzwinge Manual Modus (Garderobe & Gästezimmer)"
description: Zwingt TRVs auf manual, außer wenn sie explizit ausgeschaltet sind
triggers:
  - entity_id:
      - climate.eg_garderobe
      - climate.eg_gaestezimmer
    attribute: preset_mode
    trigger: state
conditions:
  - condition: template
    value_template: >
      {% set current_preset = state_attr(trigger.entity_id, 'preset_mode') %} {{
      current_preset not in ['manual', 'off'] and current_preset is not none }}
actions:
  - target:
      entity_id: "{{ trigger.entity_id }}"
    action: climate.set_preset_mode
    data:
      preset_mode: manual
```
