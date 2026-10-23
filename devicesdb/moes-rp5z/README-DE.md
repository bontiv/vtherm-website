# Moes Pilotdraht-Thermostat

Dieses Pilotdraht-Modul (RP5Z-PM-MS, in Zigbee2MQTT ZHT-PT01) stellt eine `climate`-Entität bereit, die _VTherm_ aber nicht direkt verwenden kann:

- Der Zustand des `climate` ist `heat` und nicht das aktive Preset, daher kann die [Befehlsanpassung von `over_switch`](/de/docs/over-switch/) nicht erkennen, ob der Heizkörper heizt;
- mit der Tuya-Integration stellt das Modul nur den Modus `heat_cool` bereit, was auch `over_climate` ausschließt.

## Installation mit einem virtuellen Schalter

1. Erstellen Sie einen Template-Schalter: _Einstellungen_ > _Geräte & Dienste_ > _Helfer_ > _Helfer erstellen_ > _Template_ > _Schalter_.
2. Verwenden Sie das Preset des Moduls als Zustand des Schalters, zum Beispiel `{{ is_state_attr('climate.mein_modul', 'preset_mode', 'comfort') }}`.
3. Rufen Sie für die Aktion _Einschalten_ `climate.set_preset_mode` mit dem Preset `comfort` auf, für die Aktion _Ausschalten_ mit dem Preset `antifrost`.
4. Erstellen Sie einen _VTherm_ `over_switch` auf diesem Schalter, wie unten beschrieben.

Die oben genannten Preset-Namen sind die von Zigbee2MQTT. Prüfen Sie das Attribut `preset_modes` Ihrer Entität unter _Entwicklerwerkzeuge_ > _Zustände_ und verwenden Sie genau dieselben Namen.

> [!NOTE]
> Da ein virtueller Schalter nötig ist, ist dieses Gerät nur teilweise kompatibel.
