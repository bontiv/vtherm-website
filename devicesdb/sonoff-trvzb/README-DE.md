# Sonoff TRVZB

## Geräteinformationen

Dieses TRV ist das empfohlene Modell für Versatile Thermostat. Wir empfehlen, es mit Zigbee2MQTT zu verwenden.

## Kalibrierung bei direkter Ventilregelung

Bei einer direkten Ventilregelung (`over_valve` oder `over_climate` mit `auto_regulation_valve`) muss die *Regelschwelle* **in Prozent** angegeben werden und **darf nicht unter 3 % liegen**:

> [!IMPORTANT]
> Bei einem niedrigeren Schwellenwert kann der Sonoff TRVZB seine Kalibrierung verlieren.

Ist die Kalibrierung verloren gegangen, kann sie mit dem [Dienst zur Ventilkalibrierung](/de/docs/feature-recalibrate-valves/) (`recalibrate_valves`) wiederhergestellt werden.

Weitere Informationen zu diesen Einstellungen finden Sie unter [Selbstregulierung](/de/docs/self-regulation/).
