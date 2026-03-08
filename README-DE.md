# Versatile Thermostat Website

Dies ist eine [Next.js](https://nextjs.org)-Community-Website für Versatile Thermostat mit mehrsprachiger Dokumentation und einer integrierten Suche, die von Pagefind bereitgestellt wird.

## Funktionen

- 📚 Mehrsprachige Dokumentation (EN, FR, DE)
- 🔍 Volltextsuche mit Pagefind
- 🌐 Statische Seitengenerierung für optimale Leistung
- 🎨 Reaktionsschnelles Design mit Dunkelmodus-Unterstützung (dark mode)

## Erste Schritte

### Installation

```bash
npm install
```

### Ersteinrichtung

Bevor man mit der Entwicklung beginnen kann, muss die Website einmal erstellen werden, um den Suchindex zu generieren:

```bash
npm run build
```

Dieser Befehl macht Folgendes:
1. Erstellen der statischen Website in `/out`
2. Erstellen des Pagefind-Suchindex
3. Kopieren des Index nach `/public/pagefind/` für Entwicklungszwecke

### Entwicklung

```bash
npm run dev
```

Das Dev-Skript kopiert automatisch den Pagefind-Index, bevor es den Entwicklungsserver startet.

Das Resultat kann man unter [http://localhost:3000](http://localhost:3000) im Browser sehen.

### Entwicklung ohne Suche

Wenn der Entwicklungs-Server ohne Suchfunktion starten soll:

```bash
npm run dev:clean
```

### Aktualisieren des Suchindex

Nach wesentliche Änderungen an der Dokumentation sollte der Suchindex aktualisiert werden:

```bash
npm run build
npm run dev
```

## Verfügbare Scripte

- `npm run dev` - Entwicklungsserver mit aktivierter Suche starten
- `npm run dev:clean` - Entwicklungsserver ohne Suchfunktion starten
- `npm run build` - Für die Produktion erstellen und Suchindex generieren
- `npm run start` - Produktionsserver starten (benötigt zuerst `npm run build`)
- `npm run lint` - ESLint ausführen

## Projektstrukture

```
vtherm-website/
├── app/                    # Next.js-App-Verzeichnis
│   ├── [lng]/             # Sprachspezifische Pfade
│   │   └── docs/          # Dokumentationsseiten
├── components/            # Aktiv-Komponenten
│   ├── layout/           # Layout-Komponenten (Header, Footer, etc.)
│   └── search/           # Pagefind-Such-Komponente
├── plans/                # Implementierungspläne und Leitfäden
├── scripts/              # Build- und Entwicklungs-Skripte
└── public/               # Statische Werte
```

## Dokumentation

- [Pagefind Implementierungsplan](./plans/pagefind-implementation.md) - Vollständiger Leitfaden zur Umsetzung
- [Pagefind Testanleitung](./plans/pagefind-testing-guide.md) - Prüfungs-Checkliste und Validierung
- [Pagefind Entwicklungsmodus](./plans/pagefind-dev-mode.md) - Erläuterung zur Einrichtung des Entwicklungsmodus

## Technologien

- [Next.js 16](https://nextjs.org/) - React framework (Framework der Aktivkomponenten)
- [Pagefind](https://pagefind.app/) - Statische Suchbibliothek
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Typesicherheit
- [i18next](https://www.i18next.com/) - Internationalisierung

## Mit beitragen

Bei Beiträgen zur Dokumentation:

1. Dokumentationsdateien im Repository hinzufügen oder ändern
2. Danach `npm run build` ausführen, um den Suchindex neu zu generieren.
3. Teste die Änderungen mit `npm run dev`

## Weitere Informationen

- [Next.js Documentation](https://nextjs.org/docs)
- [Pagefind Documentation](https://pagefind.app/)
- [Versatile Thermostat GitHub](https://github.com/jmcollin78/versatile_thermostat)

