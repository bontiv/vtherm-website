# Thermostatköpfe ohne direkte Ventilsteuerung

Bei diesen Heizkörperthermostaten (TRV) kann Home Assistant die Ventilöffnung nicht einstellen: Die Öffnung wird nicht oder nur lesend bereitgestellt. _VTherm_ kann nur den Sollwert des TRV beeinflussen, mit der [Selbstregulierung](/de/docs/self-regulation/#andere-selbsregulierung) des Typs `over_climate`. Der TRV behält seine eigene interne Regelung, daher ist die Regelung ungenauer als mit [direkter Ventilkontrolle](/de/docs/self-regulation/#selbstregulierung-bei-direkter-ventilkontrolle). Deshalb sind diese Geräte nur teilweise kompatibel.

## Empfehlungen

1. Verwenden Sie einen Raumtemperatursensor, der nicht direkt am Heizkörper steht. Wenn der TRV eine externe Temperatur akzeptiert, synchronisieren Sie diese (siehe [Synchronisierung der Gerätetemperatur](/de/docs/feature-sync_device_temp/)).
2. Deaktivieren Sie die Fenstererkennung und den Frostschutz des TRV selbst: Sie stehen im Konflikt mit _VTherm_.
3. Beim Ausschalten setzen viele TRV ihren eigenen Frostschutz-Sollwert (5 bis 7 °C). Mit `follow_underlying_temp_change` übernimmt _VTherm_ diesen Sollwert.
4. Prüfen Sie bei Verwendung des [zentralen Heizkessels](/de/docs/feature-central-boiler/), ob der TRV `hvac_action` meldet. Ohne diese Angabe weiß _VTherm_ nicht, ob der Heizkörper heizt, und der Kessel wird nicht korrekt angesteuert.
5. Starten Sie die [Selbstregulierung](/de/docs/self-regulation/#andere-selbsregulierung) mit der Stufe `Leicht` oder `Mittel` und behalten Sie die Standardwerte für Regelungsschwelle und Mindestzeitraum bei. Lassen Sie die Option `Interne Bezugstemperatur ausgleichen` deaktiviert.
6. Deaktivieren Sie den internen Wochenplan des TRV und verwenden Sie nicht seinen Modus `auto`: Lassen Sie ihn auf `heat`, _VTherm_ verwaltet die Zeitpläne mit seinen [Voreinstellungen](/de/docs/feature-presets/).
7. Verwenden Sie nicht die internen Voreinstellungen des TRV (Eco, Komfort, Boost, Urlaub...): _VTherm_ sendet den Sollwert direkt.
8. Aktivieren Sie bei Bedarf die Kindersicherung des TRV, um manuelle Änderungen am Gerät zu verhindern.

## Bekannte Geräte

- **Aqara E1 (SRTS-A01)**: kein `hvac_action` und keine Ventilöffnung. Beim Ausschalten fährt das Ventil einen vollständigen Zyklus, was die Batterie belastet: Ein niedriger Sollwert ist besser.
- **Danfoss Ally**: Das Ventil öffnet oft nur zwischen 10 und 30 %, der Sollwert wird eventuell nicht erreicht. Die externe Temperatur muss mit 100 multipliziert gesendet werden, was _VTherm_ nicht macht: Verwenden Sie eine Automatisierung.
- **tado X**: kein Zugriff auf die Ventilöffnung. Ohne Temperatursynchronisierung regelt der TRV weiter nach seinem internen Sensor.
- **Eve Thermo**: kein `hvac_action`, und der interne Sensor wird vom Heizkörper verfälscht.
- **MOES BRT-100-TRV**: Die Ventilposition ist nur lesbar.
- **MOES TV01-ZB**: kein `hvac_action`, daher ist der von _VTherm_ angezeigte Heizzustand ungenau.
- **Avatto TRV06**: nur Sollwert. Mit dem zentralen Heizkessel kann der Kessel sehr kurze Zyklen fahren.
- **Schneider Wiser CCTFR6100Z3**: Das Ventil kann zwischen 40 und 100 % schwanken, was die Batterie belastet.
