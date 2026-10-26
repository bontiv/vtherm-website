# Aqara W100

Der Aqara W100 (Zigbee `TH-S04D`) ist ein Temperatur- und Feuchtigkeitssensor mit Display und Tasten. Er dient als Raumtemperatursensor eines _VTherm_ (siehe [Basisattribute](/de/docs/base-attributes/)) und kann zusätzlich als Wandfernbedienung genutzt werden, um Modus und Sollwert des _VTherm_ zu ändern.

## Verwendung als Fernbedienung für _VTherm_

Seit Zigbee2MQTT 2.7.0 stellt der W100 eine virtuelle Klima-Entität bereit. Der Blueprint [Aqara W100 Thermostat Synchronization](/de/plugins/#kipk/aqara-w100-z2m-converter) hält sie in beide Richtungen mit dem _VTherm_ synchron:

1. Aktualisieren Sie Zigbee2MQTT auf 2.7.0 oder neuer und koppeln Sie den W100.
2. Schalten Sie den Schalter `Thermostat mode` des W100 ein.
3. Importieren Sie den Blueprint und erstellen Sie eine Automatisierung mit:
   - _Main Thermostat_: die Klima-Entität des _VTherm_,
   - _Aqara W100 Climate Controller_: die Klima-Entität des W100.

Änderungen von Modus, Sollwert und Lüftermodus am W100 werden auf den _VTherm_ übertragen, und Änderungen am _VTherm_ werden auf dem W100 angezeigt. Der Blueprint kann außerdem eine externe Temperatur und Luftfeuchtigkeit auf dem Display des W100 anzeigen.

> [!NOTE]
> Die Firmware des W100 unterstützt nur Sollwerte in ganzen Grad: Halbe Grad lassen sich nicht über die Tasten des W100 einstellen.

## Meldeintervall

Wie andere Aqara-Sensoren meldet der W100 die Temperatur nur, wenn sie sich ändert. Prüfen Sie in einem Raum mit stabiler Temperatur, dass der Abstand zwischen zwei Meldungen unter der Sicherheitsverzögerung des _VTherm_ bleibt (siehe [Empfohlene Thermometer](/de/devices/thermometer/)).
