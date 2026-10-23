# Zigbee-Pilotdraht-Module

Der NodOn SIN-4-FP-21 (auch als Equation SIN-4-FP-21_EQU verkauft) und der Kabelauslass Legrand Céliane with Netatmo steuern eine Elektroheizung über ihren Pilotdraht. Mit Zigbee2MQTT stellen sie eine `select`-Entität für den Pilotdraht-Modus bereit, mit denselben Optionen: `comfort`, `eco`, `frost_protection`, `off`, `comfort_-1` und `comfort_-2`.

## Konfiguration

1. Verwenden Sie Zigbee2MQTT: Mit ZHA stellen diese Module nur einen Ein/Aus-Schalter bereit.
2. Wählen Sie im _VTherm_ `over_switch` die Entität des Pilotdraht-Modus (`select.*_pilot_wire_mode`) und nicht die `switch`-Entität des Moduls.
3. Tragen Sie in der [Befehlsanpassung](/de/docs/over-switch/) `select_option/option:comfort` als Einschaltbefehl und `select_option/option:frost_protection` als Ausschaltbefehl ein.

Vermeiden Sie `eco` als Ausschaltbefehl: Der interne Thermostat der Heizung heizt in diesem Modus weiter.

## Empfehlungen

- Stellen Sie die Komforttemperatur der Heizung über den _VTherm_-Sollwert, damit ihr interner Thermostat die Heizung nicht abschaltet.
- Alle Module eines _VTherm_ starten gleichzeitig: Berücksichtigen Sie das beim Lastabwurf.
