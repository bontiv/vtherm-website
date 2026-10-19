# Sonoff TRV-ZBT

## Informations sur l'appareil

Le TRV-ZBT est la deuxième génération (Gen2) de la vanne Sonoff TRV. Nous recommandons de l'utiliser avec [Zigbee2MQTT](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html).

> [!WARNING]
> Cet appareil n'est que **partiellement** compatible avec VTherm. Le contrôle direct de la vanne ne fonctionne pas tel quel. La configuration recommandée est un thermostat sur climate sans contrôle direct de la vanne.

## Entités d'ouverture de la vanne

Contrairement à la première génération (TRVZB), cette vanne expose deux valeurs d'ouverture au lieu d'une :
- [`heating_valve_position`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#heating-valve-position-numeric) : l'ouverture de la vanne utilisée quand la TRV chauffe,
- [`idle_valve_position`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#idle-valve-position-numeric) : l'ouverture de la vanne utilisée quand la TRV est au repos.

VTherm n'accepte qu'une seule entité de degré d'ouverture par vanne. Si vous renseignez uniquement `heating_valve_position` comme entité de degré d'ouverture, la vanne ne s'ouvre pas toujours, même quand la position de chauffe est supérieure à 0.

### Contournement : synchroniser la position au repos

Si vous voulez utiliser l'[auto-régulation avec contrôle direct de la vanne](/fr/docs/self-regulation/), vous pouvez ajouter l'automatisation suivante. Elle maintient `idle_valve_position` juste en dessous de `heating_valve_position` (la valeur au repos doit être inférieure à celle de chauffe). Utilisez `heating_valve_position` comme entité de degré d'ouverture dans VTherm, et remplacez les identifiants d'entités par les vôtres.

```yaml
alias: Sonoff TRV-ZBT - Sync valve positions
description: Keep idle valve position just below heating valve position
triggers:
  - trigger: state
    entity_id: number.my_trv_heating_valve_position
  - trigger: homeassistant
    event: start
conditions:
  - condition: template
    value_template: >
      {{ is_number(states('number.my_trv_heating_valve_position')) }}
  - condition: template
    value_template: >
      {% set heating = states('number.my_trv_heating_valve_position') | float %}
      {% set idle = [0, heating - 1] | max %}
      {{ states('number.my_trv_idle_valve_position') | float(-1) != idle }}
actions:
  - action: number.set_value
    target:
      entity_id: number.my_trv_idle_valve_position
    data:
      value: >
        {% set heating = states('number.my_trv_heating_valve_position') | float %}
        {{ [0, heating - 1] | max }}
mode: restart
```

## Pas de température

La vanne n'accepte que des consignes par pas de 0,5 °C. Si VTherm utilise un pas de 0,1 °C, la consigne envoyée à la vanne est arrondie (par exemple 22,2 °C devient 22 °C). Dans ce cas, la vanne peut rester fermée alors que VTherm demande de l'ouvrir. C'est pourquoi la configuration ci-dessous utilise un pas de température de 0,5 °C.

*Source : [discussion « Support for the new SONOFF TRV Gen2 »](https://github.com/jmcollin78/versatile_thermostat/discussions/2067).*
