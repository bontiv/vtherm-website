## Voraussetzungen

Sie müssen die MELCloud-Integration konfigurieren.

[![Open your Home Assistant instance and start setting up a new integration.](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=melcloud)

## Einschränkungen

MELCloud ist eine Cloud-Integration: Einige Befehle gehen verloren, und nach einem Neustart kann der Zustand von automatischem Start/Stopp vom Gerät abweichen. Aktivieren Sie die [Behebung von falschem Gerätezustand](/de/docs/feature-advanced/#behebung-von-falschem-gerätezustand), um den erwarteten Zustand erneut zu senden. Wenn Sie das Gerät von Hand bedienen, deaktivieren Sie zuerst den _VTherm_, sonst macht die Behebung Ihre Änderung rückgängig.

Die MELCloud-Lüfterstufen (1 bis 5) entsprechen nicht den Lüftermodi von _VTherm_, daher kann der automatische Lüftermodus die falsche Stufe wählen.
