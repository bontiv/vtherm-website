# Sonoff TRV-ZBT

## Geräteinformationen

Der TRV-ZBT ist die zweite Generation (Gen2) des Sonoff TRV. Wir empfehlen, ihn mit [Zigbee2MQTT](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html) zu verwenden. Mit ZHA verhält er sich genauso.

> [!WARNING]
> Dieses Gerät ist nur **teilweise** mit VTherm kompatibel. Die direkte Ventilsteuerung funktioniert nicht: Das interne Thermostat des TRV behält die Kontrolle über das Ventil, unabhängig von den Werten von `heating_valve_position` und `idle_valve_position`. Einen VTherm auf Thermostat ohne direkte Ventilsteuerung verwenden oder den experimentellen Blueprint unten ausprobieren.

## Empfohlene TRV-Einstellungen

- [`smart_temperature_control`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#smart-temperature-control-binary) deaktivieren (in ZHA „adaptive mode“ genannt).
- [`temperature_accuracy`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#temperature-accuracy-numeric) auf -0,2 °C setzen, damit das TRV dem Sollwert genauer folgt.

## Direkte Ventilsteuerung (experimentell)

Der Blueprint [Sonoff TRV-ZBT valve kick](https://gist.github.com/bontiv/af2d59adb15bf3d522282edd662a75e4) zwingt das TRV, jede von VTherm gesendete Ventilöffnung zu übernehmen, ohne den Sollwert zu ändern.

[![Öffne deine Home Assistant-Instanz und zeige den Blueprint-Importdialog mit einem vorausgefüllten Blueprint.](https://my.home-assistant.io/badges/blueprint_import.svg)](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgist.githubusercontent.com%2Fbontiv%2Faf2d59adb15bf3d522282edd662a75e4%2Fraw%2Fsonoff_trv_zbt_vtherm.yaml)

- In VTherm die Selbstregelung mit direkter Ventilsteuerung wählen, mit `heating_valve_position` als Entität für den Öffnungsgrad und ohne Entität für den Schließgrad.
- In VTherm „Follow underlying temp change“ und die Synchronisierung der Gerätetemperatur deaktivieren.
- [`open_window`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#open-window-binary) am TRV deaktivieren.

## Temperaturschritte

Das Ventil akzeptiert Sollwerte nur in Schritten von 0,5 °C. Deshalb verwendet die folgende Konfiguration einen Temperaturschritt von 0,5 °C.

*Quelle: [Diskussion „Support for the new SONOFF TRV Gen2“](https://github.com/jmcollin78/versatile_thermostat/discussions/2067).*
