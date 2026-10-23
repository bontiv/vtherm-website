# Heatzy pilote

Der Heatzy pilote steuert eine Elektroheizung über ihren Pilotdraht. Die Heatzy-Integration stellt ihn als `climate`-Entität bereit, deren Zustand nicht das aktive Preset ist: Die [Befehlsanpassung von `over_switch`](/de/docs/over-switch/) mit `set_preset_mode` kann nicht erkennen, ob die Heizung eingeschaltet ist, und der Ausschaltbefehl wird nie gesendet.

## Installation mit einem virtuellen Schalter

1. Erstellen Sie einen Template-Schalter: _Einstellungen_ > _Geräte & Dienste_ > _Helfer_ > _Helfer erstellen_ > _Template_ > _Schalter_.
2. Verwenden Sie das Preset des Heatzy als Zustand des Schalters, zum Beispiel `{{ is_state_attr('climate.mein_heatzy', 'preset_mode', 'comfort') }}`.
3. Rufen Sie für die Aktion _Einschalten_ `climate.set_preset_mode` mit dem Preset `comfort` auf, für die Aktion _Ausschalten_ mit dem Preset `away`.
4. Erstellen Sie einen _VTherm_ `over_switch` auf diesem Schalter, wie unten beschrieben.

Prüfen Sie das Attribut `preset_modes` Ihrer Entität unter _Entwicklerwerkzeuge_ > _Zustände_ und verwenden Sie genau dieselben Namen.

## Aktivierungsverzögerungen

Der Heatzy wechselt seinen Zustand langsam. Die minimalen Aktivierungs- und Deaktivierungsverzögerungen sind auf 30 Sekunden gesetzt, damit jeder Befehl Zeit hat, ausgeführt zu werden.
