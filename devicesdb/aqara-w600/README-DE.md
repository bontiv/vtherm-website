# Aqara W600

Funktioniert einwandfrei im Modus `over_climate`. Dank der internen Temperaturkalibrierungsfunktion eignet es sich hervorragend zur Temperatursynchronisation. Im ZigBee-Modus ist es sehr vielseitig, seine Möglichkeiten sind im Matter-over-Thread-Modus jedoch deutlich eingeschränkter.

> [!NOTE]
> Zigbee2MQTT stellt die Ventilposition nur lesend bereit: _VTherm_ kann die [direkte Ventilkontrolle](/de/docs/self-regulation/#selbstregulierung-bei-direkter-ventilkontrolle) nicht nutzen und regelt über den Sollwert. Deshalb ist der W600 nur teilweise kompatibel. Empfehlungen finden Sie unter [Thermostatköpfe ohne direkte Ventilsteuerung](/de/devices/trv-no-valve/).
