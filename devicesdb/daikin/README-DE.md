# Daikin

Daikin-Klimageräte und -Wärmepumpen funktionieren mit dem Typ `over_climate`, das Ergebnis hängt aber stark von der Home-Assistant-Integration ab.

## Wahl der Integration

1. **Daikin AC (lokal)**: Die Core-Integration kommuniziert direkt mit dem WLAN-Adapter im lokalen Netzwerk. Befehle werden sofort ausgeführt. Das ist die beste Wahl, wenn Ihr Adapter sie unterstützt.
2. **Daikin Onecta (Cloud)**: Die Befehle laufen über die Daikin-Cloud. Sie sind langsam, und das tägliche API-Kontingent kann innerhalb weniger Stunden aufgebraucht sein, da _VTherm_ häufig Befehle sendet. Wenn die Integration nicht verfügbar ist, kann der Zustand des _VTherm_ verloren gehen.
3. **BRP069B4x-Adapter**: Mit der Core-Integration schaltet sich das Klimagerät bei manchen Nutzern direkt nach dem Start durch _VTherm_ wieder aus. Die Daikin-Integration aus HACS funktioniert mit diesen Adaptern.

## Empfehlungen

- Senden Sie Ein/Aus-Befehle nicht zu kurz hintereinander: Das Gerät kann sie verwerfen.
- Bevorzugen Sie mit der Cloud-Integration eine leichte Selbstregulierung, um die Anzahl der Befehle zu begrenzen.

> [!NOTE]
> Wegen dieser Einschränkungen sind Daikin-Geräte nur teilweise kompatibel.
