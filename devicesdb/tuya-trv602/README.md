# Tuya TRV602

Tuya devices may be sold under a white-label brand by other companies.


This page explains how to configure a Tuya TRV thermostat using the Zigbee protocol. With a Tuya gateway, you can use [Tuya WIFI integration](../tuya-wifi/).


> [!WARNING]
> This device is **NOT** recommanded for VTherm. It is unstable and require somme automation to work.


## Required automation

You need to add the following automation. Change the triggers entity IDs with yours IDs.

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
