# Bekannte Einschränkungen

Die folgenden Geräte funktionieren mit Versatile Thermostat, aber mit Einschränkungen. Einige Funktionen arbeiten nicht, oder die Regelung ist schlechter als mit einem vollständig kompatiblen Gerät.

## Klimageräte und Wärmepumpen

1. **Airwell**-Klimageräte mit der Integration "Midea AC LAN". Wenn zwei _VTherm_-Befehle zu kurz hintereinander kommen, schaltet sich das Klimagerät selbst ab.
2. **Sensibo**: Nach einem `off`-Befehl kann ein Lüftermodus-Befehl das Klimagerät wieder einschalten. Manche Geräte schalten sich auch von selbst aus.
3. **LG ThinQ**: Die Cloud-Integration lehnt einige Befehle ab (`target_temperature_low`), und Regelzyklen gehen verloren, wenn die Cloud nicht erreichbar ist.
4. **Gree**: Mit dem automatischen Start/Stopp sendet der automatische Stopp kein `off` an das Klimagerät.
5. **Airzone Aidoo**: Der Eco-Modus der Airzone-App erzwingt 18 °C oder Aus: Deaktivieren Sie ihn. Nach einem automatischen Stopp kann eine Heizanforderung das Gerät einschalten, ohne dass _VTherm_ danach `off` sendet.
6. **Panasonic Comfort Cloud**: Die Lüftermodi verwenden Großbuchstaben, daher funktioniert der automatische Lüftermodus von _VTherm_ nicht. Der interne Sensor des Geräts ist instabil: Verwenden Sie einen Raumsensor.
7. **Mitsubishi Heavy Industries WF-RAC**: Halten Sie die Integration aktuell, ältere Versionen schalteten das Gerät direkt nach dem Start aus. Das WLAN-Modul startet regelmäßig neu und ist dann etwa 30 Sekunden nicht verfügbar.
8. **Atlantic Naviclim** (GW003-AS-IN-TE-FC): Der automatische Start funktioniert im Heizbetrieb, die Regelung im Kühlbetrieb ist jedoch langsam.

## Thermostate und Heizsysteme

1. **Homematic**-Thermostate (und möglicherweise Homematic IP) haben bekanntermaßen Probleme mit Versatile Thermostat, bedingt durch die Grenzen des zugrunde liegenden Funkprotokolls. Das Problem tritt vor allem auf, wenn mehrere Homematic-Thermostate gleichzeitig in einer _VTherm_-Instanz gesteuert werden. Um die Duty-Cycle-Last zu verringern, können Sie die Thermostate mit Homematic-eigenen Mitteln gruppieren (z. B. über ein Wandthermostat) und Versatile Thermostat nur das Wandthermostat steuern lassen. Eine andere Möglichkeit ist, nur ein Thermostat zu steuern und Modus- und Temperaturänderungen per Automatisierung weiterzugeben.
2. **Rointe**-Thermostate neigen dazu, von selbst aufzuwachen. Der Rest funktioniert normal.
3. Heizsysteme auf Basis von **Netatmo** funktionieren schlecht. Netatmo-Zeitpläne stehen im Konflikt mit der _VTherm_-Programmierung. Netatmo-Geräte kehren ständig in den Modus `Auto` zurück, der mit _VTherm_ schlecht funktioniert. In diesem Modus kann _VTherm_ nicht erkennen, ob das System heizt oder kühlt, und daher nicht den richtigen Algorithmus wählen. Einige Nutzer haben es mit einem virtuellen Schalter zwischen _VTherm_ und dem System zum Laufen gebracht, die Stabilität ist aber nicht garantiert. Ein Beispiel finden Sie im Abschnitt [Fehlerbehebung](/de/docs/troubleshooting/).
4. **ecobee**: Prüfen Sie die Temperatureinheit. Eine Vermischung von °F und °C kann den Sollwert auf dem Minimalwert des Thermostats festhalten.
5. **MOES Pilotdraht-Thermostat** (RP5Z-PM-MS / ZHT-PT01): Der Sollwert wird ignoriert, wenn das Thermostat nicht im richtigen Preset ist. Der Sollwert muss über der Raumtemperatur liegen, um den Komfortmodus zu erhalten.
