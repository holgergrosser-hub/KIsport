# 🚀 Fitness Tracker – Setup-Anleitung
**Holger Grosser | Galpin × Ajusco Plan**

---

## Schritt 1: Google Sheet + Apps Script einrichten

### 1.1 Google Sheet erstellen
1. Gehe zu **sheets.google.com** → Neues Sheet erstellen
2. Nenne es: **"Fitness Tracker Holger"**
3. Kopiere die **Sheet-ID** aus der URL:
   - URL-Beispiel: `https://docs.google.com/spreadsheets/d/`**`1ABC123xyz...`**`/edit`
   - Die fett markierte Teil ist deine Sheet-ID

### 1.2 Apps Script einrichten
1. Im Sheet: **Erweiterungen → Apps Script**
2. Alles löschen was dort steht
3. Den Inhalt der Datei **`google-apps-script.js`** einfügen
4. Ganz oben die Zeile finden:
   ```javascript
   const SHEET_ID = 'DEIN_GOOGLE_SHEET_ID_HIER';
   ```
   Ersetze `DEIN_GOOGLE_SHEET_ID_HIER` mit deiner echten Sheet-ID
5. **Strg+S** zum Speichern

### 1.3 Sheets initialisieren
1. In Apps Script: Funktion `test_init` auswählen
2. **▶ Ausführen** klicken
3. Berechtigungen erlauben wenn gefragt
4. Du siehst: `✅ Sheets initialisiert`

### 1.4 Als Web App deployen
1. Rechts oben: **"Bereitstellen" → "Neue Bereitstellung"**
2. Zahnrad → **Web-App**
3. Einstellungen:
   - Beschreibung: `Fitness Tracker v1`
   - Ausführen als: **Ich**
   - Zugriff: **Jeder**
4. **Bereitstellen** klicken → Berechtigungen erlauben
5. **Die neue URL kopieren!** (sieht aus wie: `https://script.google.com/macros/s/ABC.../exec`)

---

## Schritt 2: GitHub Repository erstellen

1. Gehe zu **github.com** → **New Repository**
2. Name: `fitness-tracker`
3. Private oder Public (empfohlen: Private)
4. **Create repository**

### Lokales Setup (Terminal/Kommandozeile):
```bash
# Projektordner entzippen/vorbereiten
cd fitness-tracker

# Git initialisieren
git init
git add .
git commit -m "Initial: Fitness Tracker Galpin × Ajusco"

# Mit GitHub verbinden (URL aus GitHub kopieren)
git remote add origin https://github.com/DEIN_USERNAME/fitness-tracker.git
git branch -M main
git push -u origin main
```

---

## Schritt 3: Netlify Deployment

### 3.1 Netlify verbinden
1. Gehe zu **netlify.com** → Log in mit GitHub
2. **"Add new site" → "Import an existing project"**
3. **GitHub** auswählen → `fitness-tracker` Repository wählen
4. Build-Einstellungen (werden aus `netlify.toml` automatisch geladen):
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
5. **"Deploy site"** klicken

### 3.2 Umgebungsvariable setzen (WICHTIG!)
1. In Netlify: **Site Settings → Environment Variables**
2. Neue Variable hinzufügen:
   - **Key:** `VITE_GAS_URL`
   - **Value:** Deine Apps Script URL von Schritt 1.4
3. **Save** klicken
4. **Deploys → Trigger deploy** (damit die Variable aktiv wird)

### 3.3 Fertig!
Deine App ist jetzt unter der Netlify-URL erreichbar, z.B.:
`https://fitness-tracker-holger.netlify.app`

---

## Nach jeder Änderung am Apps Script

⚠️ **WICHTIG:** Nach jeder Code-Änderung im Apps Script:
1. Strg+S speichern
2. **"Bereitstellen" → "Neue Bereitstellung"** (NICHT "Bereitstellung verwalten"!)
3. Neue URL kopieren
4. In Netlify die `VITE_GAS_URL` Umgebungsvariable **aktualisieren**
5. Netlify neu deployen

---

## App-Nutzung

### Tab: "+ Erfassen"
- **Gewicht:** Täglich dein Körpergewicht eingeben
- **Training erfassen:**
  1. Datum + Trainingstyp wählen (entspricht dem Wochentag im Plan)
  2. Übungen aus der Liste hinzufügen
  3. Für jede Übung Sätze erfassen (Gewicht + Wiederholungen)
  4. Stimmung + optionale Notiz
  5. Speichern

### Tab: "📊 Auswertung"
- Übersicht der letzten 60 Tage
- Gewichtsverlauf als Chart
- Trainings pro Woche
- Bestleistungen pro Übung
- Filterbare Trainingshistorie

### Tab: "🤖 KI-Coach"
- Ausführungshinweise für alle Übungen aus dem Plan
- Galpin's Kernprinzipien
- Direktfragen an den KI-Assistenten

---

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| "Backend nicht verbunden" | GAS_URL in Netlify env vars prüfen |
| Daten werden nicht gespeichert | Apps Script neu deployen, neue URL eintragen |
| Build-Fehler auf Netlify | `npm install && npm run build` in netlify.toml prüfen |
| CORS-Fehler | Apps Script muss als "Jeder" zugänglich sein |

---

## Dateistruktur

```
fitness-tracker/
├── src/
│   ├── components/
│   │   ├── TrainingErfassen.jsx  # Tägliche Eingabe
│   │   ├── GewichtErfassen.jsx   # Gewicht
│   │   ├── Auswertung.jsx        # 60-Tage Übersicht
│   │   └── KiAssistent.jsx       # KI-Coach
│   ├── App.jsx                   # Navigation
│   ├── api.js                    # GAS-Kommunikation
│   ├── data.js                   # Übungen + KI-Hinweise
│   ├── main.jsx
│   └── index.css
├── google-apps-script.js         # ← In Apps Script einfügen!
├── index.html
├── package.json
├── vite.config.js
├── netlify.toml
└── .gitignore
```
