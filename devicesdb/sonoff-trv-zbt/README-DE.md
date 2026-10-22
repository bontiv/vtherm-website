# Sonoff TRV-ZBT

## Geräteinformationen

Der TRV-ZBT ist die zweite Generation (Gen2) des Sonoff TRV. Wir empfehlen, ihn mit [Zigbee2MQTT](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html) zu verwenden. Mit ZHA verhält er sich genauso.

> [!WARNING]
> Dieses Gerät ist nur **teilweise** mit VTherm kompatibel. Die direkte Ventilsteuerung funktioniert nicht: Das interne Thermostat des TRV behält die Kontrolle über das Ventil, unabhängig von den Werten von `heating_valve_position` und `idle_valve_position`. Einen VTherm auf Thermostat ohne direkte Ventilsteuerung verwenden.

## Empfohlene TRV-Einstellungen

- [`smart_temperature_control`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#smart-temperature-control-binary) deaktivieren (in ZHA „adaptive mode“ genannt).
- [`temperature_accuracy`](https://www.zigbee2mqtt.io/devices/TRV-ZBT.html#temperature-accuracy-numeric) auf -0,2 °C setzen, damit das TRV dem Sollwert genauer folgt.

## Temperaturschritte

Das Ventil akzeptiert Sollwerte nur in Schritten von 0,5 °C. Deshalb verwendet die folgende Konfiguration einen Temperaturschritt von 0,5 °C.

*Quelle: [Diskussion „Support for the new SONOFF TRV Gen2“](https://github.com/jmcollin78/versatile_thermostat/discussions/2067).*
