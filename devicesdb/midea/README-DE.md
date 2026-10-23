# Midea

Midea-Klimageräte und -Wärmepumpen funktionieren mit dem Typ `over_climate`. Dieselbe Installation gilt für Marken, die von Midea gebaut werden, wie Airwell.

## Voraussetzungen

Installieren Sie eine lokale Midea-Integration aus HACS: **Midea AC LAN** (`midea_ac_lan`) oder **Midea Smart AC** (`midea-ac-py`). Beide steuern das Gerät direkt im lokalen Netzwerk.

## Einschränkungen

1. Der minimale Sollwert des Geräts liegt oft bei 17 °C. Prüfen Sie den `min_temp` der zugrunde liegenden Entität, bevor Sie Ihre Presets wählen.
2. Direkt nach einem automatischen Start schalten sich manche Geräte von selbst aus: Prüfen Sie den Zustand des Geräts, wenn Sie den automatischen Start/Stopp verwenden.

## Airwell

Airwell-Klimageräte verwenden dieselbe Integration Midea AC LAN. Wenn zwei _VTherm_-Befehle zu kurz hintereinander kommen, schaltet sich das Klimagerät selbst ab. Deshalb sind Airwell-Geräte nur teilweise kompatibel.
