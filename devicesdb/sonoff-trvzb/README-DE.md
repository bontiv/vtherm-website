# Sonoff TRVZB

## Geräteinformationen

Dieses TRV ist das empfohlene Modell für Versatile Thermostat. Wir empfehlen, es mit Zigbee2MQTT zu verwenden.

## Direkte Ventilsteuerung

### Gerätekonfiguration

1. Erstellen Sie ein _VTherm_ `over_climate` auf der `climate`-Entity des TRV, mit der Selbstregulierung [`Direkte Ventilsteuerung`](/de/docs/self-regulation/#selbstregulierung-bei-direkter-ventilkontrolle). Lassen Sie die Option `Interne Bezugstemperatur ausgleichen` deaktiviert.
2. Wählen Sie in der Konfiguration der Ventilregelung die `number`-Entities des TRV: `opening_degree` für die Öffnung und `closing_degree` für die Schließung. Diese Entities können in Zigbee2MQTT oder ZHA standardmäßig ausgeblendet oder deaktiviert sein: Aktivieren Sie sie zuerst.
3. Um das interne Thermometer des TRV an die Raumtemperatur anzugleichen, aktivieren Sie die [Synchronisierung der Gerätetemperatur](/de/docs/feature-sync_device_temp/), mit seiner Kalibrierungs-Entity oder seiner Entity `external_temperature_input`.
4. Schalten Sie die Entity `Follow underlying temp change` des _VTherm_ erst ein, nachdem Sie geprüft haben, dass diese Grundkonfiguration funktioniert (siehe [Verfolgung verknüpfter Temperaturänderungen](/de/docs/over-climate/#verfolgung-verknüpfter-temperaturänderungen)).

### Kalibrierung

Bei einer direkten Ventilregelung (`over_valve` oder `over_climate` mit `auto_regulation_valve`) muss die *Regelschwelle* **in Prozent** angegeben werden und **darf nicht unter 3 % liegen**:

> [!IMPORTANT]
> Bei einem niedrigeren Schwellenwert kann der Sonoff TRVZB seine Kalibrierung verlieren.

Ist die Kalibrierung verloren gegangen, kann sie mit dem [Dienst zur Ventilkalibrierung](/de/docs/feature-recalibrate-valves/) (`recalibrate_valves`) wiederhergestellt werden.

Weitere Informationen zu diesen Einstellungen finden Sie unter [Selbstregulierung](/de/docs/self-regulation/).
