# Sonoff TRV-ZBT

## Geräteinformationen

Der TRV-ZBT ist die zweite Generation (Gen2) des Sonoff TRV. Wir empfehlen, ihn mit [Zigbee2MQTT](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html) zu verwenden.

> [!WARNING]
> Dieses Gerät ist nur **teilweise** mit VTherm kompatibel. Die direkte Ventilsteuerung funktioniert nicht ohne Weiteres. Die empfohlene Konfiguration ist ein VTherm auf Thermostat ohne direkte Ventilsteuerung.

## Entitäten für die Ventilöffnung

Im Gegensatz zur ersten Generation (TRVZB) stellt dieses Ventil zwei Öffnungswerte statt einem bereit:
- [`heating_valve_position`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#heating-valve-position-numeric): die Ventilöffnung, wenn das TRV heizt,
- [`idle_valve_position`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#idle-valve-position-numeric): die Ventilöffnung, wenn das TRV im Ruhezustand ist.

VTherm akzeptiert nur eine Entität für den Öffnungsgrad pro Ventil. Wird nur `heating_valve_position` als Entität für den Öffnungsgrad eingetragen, öffnet sich das Ventil nicht immer, selbst wenn die Heizposition über 0 liegt.

### Workaround: Ruheposition synchronisieren

Wenn die [Selbstregelung mit direkter Ventilsteuerung](/de/docs/self-regulation/) verwendet werden soll, kann die folgende Automatisierung hinzugefügt werden. Sie hält `idle_valve_position` knapp unter `heating_valve_position` (der Ruhewert muss niedriger als der Heizwert sein). `heating_valve_position` als Entität für den Öffnungsgrad in VTherm verwenden und die Entitäts-IDs durch die eigenen ersetzen.

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

## Temperaturschritte

Das Ventil akzeptiert Sollwerte nur in Schritten von 0,5 °C. Verwendet VTherm Schritte von 0,1 °C, wird der an das Ventil gesendete Sollwert gerundet (z. B. wird 22,2 °C zu 22 °C). In diesem Fall kann das Ventil geschlossen bleiben, obwohl VTherm es öffnen möchte. Deshalb verwendet die folgende Konfiguration einen Temperaturschritt von 0,5 °C.

*Quelle: [Diskussion „Support for the new SONOFF TRV Gen2“](https://github.com/jmcollin78/versatile_thermostat/discussions/2067).*
