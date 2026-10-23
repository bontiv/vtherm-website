# Eurotronic Comet

Die Zigbee-Heizkörperthermostate Eurotronic Comet (COZB0001, CoZB_dha) können mit der [Selbstregulierung bei direkter Ventilkontrolle](/de/docs/self-regulation/#selbstregulierung-bei-direkter-ventilkontrolle) verwendet werden.

## Einstellungen in Zigbee2MQTT

Setzen Sie `trv_mode` in Zigbee2MQTT auf `1`. In diesem Modus wird das Ventil direkt über `valve_position` gesteuert: Die Anzeige zeigt die Ventilöffnung, und die Tasten des Thermostats sind deaktiviert. Mit dem Standardwert `2` regelt der Thermostat selbst und ignoriert `valve_position`.

Der Thermostat kann von selbst in den automatischen Modus zurückwechseln: Prüfen Sie `trv_mode`, wenn das Ventil _VTherm_ nicht mehr folgt.

## Maximale Öffnung

`valve_position` reicht von 0 (geschlossen) bis 255 (ganz offen), nicht von 0 bis 100. Setzen Sie die maximale Öffnung (`max_opening_degrees`) auf `255`, damit _VTherm_ den gesamten Bereich des Ventils nutzt. Mit einem Maximum von 100 würde das Ventil nie mehr als etwa 40 % öffnen.
