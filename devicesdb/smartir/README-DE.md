# SmartIR kompatible Geräte

Sie können [SmartIR](https://github.com/smartHomeHub/SmartIR/) verwenden, um Klimaanlagen (AC) mit einer IR-Fernbedienung zu steuern.

Für den Moes UFO-R11 müssen Sie ein Skript ausführen, um IR-Codes von Broadlink nach Tuya zu konvertieren.

*Diese Integration und das Gerät erfordern gute Kenntnisse in der Home Assistant-Konfiguration. Viele Konfigurationen sind nicht über die grafische Oberfläche verfügbar.*

## Kompatible Geräte

### IR-Controller
Diese IR-Controller werden vom SmartIR-Projekt als funktionierend gemeldet:
- Broadlink
- Xiaomi IR Remote (ChuangmiIr)
- LOOK.in Remote
- ESPHome benutzerdefinierter Dienst für Remote-Transmitter
- MQTT Publish-Dienst
  - Tuya Z06/Moes UFO-R11 zigbee2mqtt
- ZHA Zigbee IR Remote (erfordert möglicherweise ein benutzerdefiniertes ZHA-Quirk für den jeweiligen Controller)


### Verfügbare Klimageräte
Folgende Hersteller werden unterstützt:
- Toyotomi
- Panasonic
- General Electric
- LG
- Hitachi
- Daikin
- Mitsubishi
- Actron
- Carrier
- Gree
- Tosot
- Sungold
- Consul
- Toshiba
- Fujitsu
- Sharp
- Haier
- Tadiran
- Springer
- Midea
- Samsung
- Sintech
- Akai
- Alliance
- Junkers
- Sanyo
- Hisense
- Whirlpool
- Chigo
- Beko
- Tornado
- Electrolux
- Kelvinator
- Electra
- DeLonghi
- Hyundai
- AEG
- Bosch

Die vollständige Liste der verfügbaren Geräte finden Sie hier:

https://github.com/litinoveweedle/SmartIR/blob/master/docs/CLIMATE_CODES.md

Überprüfen Sie diese Liste für Ihr Modell und Ihren Hersteller.


## SmartIR installieren
Sie können SmartIR mit HACS installieren:

[![Öffnen Sie Ihre Home Assistant-Instanz und öffnen Sie ein Repository im Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=litinoveweedle&repository=SmartIR)


## Die Klimaentität konfigurieren
Lesen Sie [die Konfigurationsanleitung von SmartIR](https://github.com/litinoveweedle/SmartIR/blob/master/docs/CLIMATE.md) für Konfigurationsanweisungen.

Sie müssen die Konfiguration in Ihrer `configuration.yaml` hinzufügen.


### IR-Codes von Broadlink nach Z06/UFO-R11 konvertieren
Nur für Benutzer mit dem UFO-R11-Controller.

Mit `https://gist.github.com/svyatogor/7839d00303998a9fa37eb48494dd680f?permalink_comment_id=5153002#gistcomment-5153002` können Sie eine Broadlink-Code-Datei konvertieren.

Beispiel: python3 broadlink_to_tuya.py 1287.json > 9997.json