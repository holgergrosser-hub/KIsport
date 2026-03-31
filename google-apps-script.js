// ═══════════════════════════════════════════════════════════════════════════
// FITNESS TRACKER – Google Apps Script Backend
// Holger Grosser | Galpin × Ajusco 16-Wochen-Plan
// ═══════════════════════════════════════════════════════════════════════════
//
// SETUP:
// 1. Neues Google Sheet erstellen
// 2. Extensions → Apps Script → diesen Code einfügen
// 3. SHEET_ID unten eintragen (aus der URL deines Sheets)
// 4. Bereitstellen → Neue Bereitstellung → Web App
//    - Ausführen als: Ich
//    - Zugriff: Jeder
// 5. URL kopieren → in Netlify als VITE_GAS_URL Umgebungsvariable eintragen

const SHEET_ID = 'DEIN_GOOGLE_SHEET_ID_HIER'; // ← HIER EINTRAGEN
const SCRIPT_VERSION = '2026-03-31';

// Sheet-Namen
const SHEETS = {
  TRAINING:  'Training',
  SAETZE:    'Saetze',
  GEWICHT:   'Gewicht',
  STAMMDATEN:'Stammdaten',
};

function getSpreadsheet_() {
  if (!SHEET_ID || SHEET_ID === 'DEIN_GOOGLE_SHEET_ID_HIER') {
    throw new Error('SHEET_ID fehlt. Bitte trage oben im Apps Script die echte Google-Sheet-ID ein.');
  }

  return SpreadsheetApp.openById(SHEET_ID);
}

function ensureSheetsReady_() {
  const ss = getSpreadsheet_();

  let sh = ss.getSheetByName(SHEETS.TRAINING);
  if (!sh) {
    sh = ss.insertSheet(SHEETS.TRAINING);
    sh.appendRow(['ID','Datum','Trainingstyp','Dauer_min','Notiz','Stimmung','Erstellt']);
    sh.setFrozenRows(1);
  }

  sh = ss.getSheetByName(SHEETS.SAETZE);
  if (!sh) {
    sh = ss.insertSheet(SHEETS.SAETZE);
    sh.appendRow(['TrainingID','Uebung_ID','Uebung_Name','Satz_Nr','Gewicht_kg','Wiederholungen','Dauer_sek','Notiz']);
    sh.setFrozenRows(1);
  }

  sh = ss.getSheetByName(SHEETS.GEWICHT);
  if (!sh) {
    sh = ss.insertSheet(SHEETS.GEWICHT);
    sh.appendRow(['Datum','Gewicht_kg','Notiz']);
    sh.setFrozenRows(1);
  }

  sh = ss.getSheetByName(SHEETS.STAMMDATEN);
  if (!sh) {
    sh = ss.insertSheet(SHEETS.STAMMDATEN);
    sh.appendRow(['Schluessel','Wert']);
    sh.appendRow(['Name','Holger Grosser']);
    sh.appendRow(['Alter','60']);
    sh.appendRow(['Startgewicht','']);
    sh.appendRow(['Ziel','10 km Ajusco + Fettabbau']);
    sh.appendRow(['Programmstart','']);
    sh.setFrozenRows(1);
  }

  return ss;
}

// ── Initialisierung ───────────────────────────────────────────────────────────
function initSheets() {
  ensureSheetsReady_();
  return '✅ Sheets initialisiert';
}

function getSetupStatus() {
  const ss = ensureSheetsReady_();
  return {
    status: 'ok',
    message: 'Fitness Tracker Backend läuft und Google Sheets ist erreichbar.',
    version: SCRIPT_VERSION,
    spreadsheetName: ss.getName(),
    sheets: Object.values(SHEETS),
  };
}

// ── CORS Helper ───────────────────────────────────────────────────────────────
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── GET Handler ───────────────────────────────────────────────────────────────
function doGet(e) {
  try {
    const action = e.parameter.action || 'ping';
    
    if (action === 'ping') {
      return jsonResponse(getSetupStatus());
    }

    if (action === 'setupStatus') {
      return jsonResponse(getSetupStatus());
    }
    
    if (action === 'getLast60Days') {
      return jsonResponse(getLast60Days());
    }
    
    if (action === 'getGewicht') {
      return jsonResponse(getGewichtHistory());
    }
    
    if (action === 'getTrainingDetail') {
      const id = e.parameter.id;
      return jsonResponse(getTrainingDetail(id));
    }
    
    return jsonResponse({ status: 'error', message: 'Unbekannte Action: ' + action });
    
  } catch (err) {
    console.error('doGet Fehler:', err);
    return jsonResponse({ status: 'error', message: err.message });
  }
}

// ── POST Handler ──────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      data = e.parameter; // FormData Fallback
    }
    
    console.log('doPost empfangen:', JSON.stringify(data));
    
    const action = data.action;
    
    if (action === 'saveTraining') {
      return jsonResponse(saveTraining(data));
    }
    
    if (action === 'saveGewicht') {
      return jsonResponse(saveGewicht(data));
    }
    
    if (action === 'deleteTraining') {
      return jsonResponse(deleteTraining(data.id));
    }
    
    return jsonResponse({ status: 'error', message: 'Unbekannte Action: ' + action });
    
  } catch (err) {
    console.error('doPost Fehler:', err);
    return jsonResponse({ status: 'error', message: err.message });
  }
}

// ── Training speichern ────────────────────────────────────────────────────────
function saveTraining(data) {
  const ss = ensureSheetsReady_();
  const trainingSh = ss.getSheetByName(SHEETS.TRAINING);
  const saetzeSh   = ss.getSheetByName(SHEETS.SAETZE);
  
  const trainingId = Utilities.getUuid();
  const now = new Date().toISOString();
  
  // Training-Zeile
  trainingSh.appendRow([
    trainingId,
    data.datum,
    data.trainingstyp,
    data.dauer_min || '',
    data.notiz || '',
    data.stimmung || '',
    now
  ]);
  
  // Sätze speichern
  const saetze = typeof data.saetze === 'string' ? JSON.parse(data.saetze) : (data.saetze || []);
  saetze.forEach(satz => {
    saetzeSh.appendRow([
      trainingId,
      satz.uebung_id,
      satz.uebung_name,
      satz.satz_nr,
      satz.gewicht_kg || '',
      satz.wiederholungen || '',
      satz.dauer_sek || '',
      satz.notiz || ''
    ]);
  });
  
  return { status: 'ok', id: trainingId, message: 'Training gespeichert!' };
}

// ── Gewicht speichern ─────────────────────────────────────────────────────────
function saveGewicht(data) {
  const ss = ensureSheetsReady_();
  const sh = ss.getSheetByName(SHEETS.GEWICHT);
  
  // Prüfen ob für dieses Datum schon ein Eintrag existiert
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.datum) {
      // Update
      sh.getRange(i + 1, 2).setValue(data.gewicht_kg);
      sh.getRange(i + 1, 3).setValue(data.notiz || '');
      return { status: 'ok', message: 'Gewicht aktualisiert!' };
    }
  }
  
  sh.appendRow([data.datum, data.gewicht_kg, data.notiz || '']);
  return { status: 'ok', message: 'Gewicht gespeichert!' };
}

// ── Letzte 60 Tage laden ──────────────────────────────────────────────────────
function getLast60Days() {
  const ss = ensureSheetsReady_();
  const trainingSh = ss.getSheetByName(SHEETS.TRAINING);
  const saetzeSh   = ss.getSheetByName(SHEETS.SAETZE);
  const gewichtSh  = ss.getSheetByName(SHEETS.GEWICHT);
  
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 60);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  
  // Trainings
  const tRows = trainingSh.getDataRange().getValues();
  const trainings = [];
  tRows.slice(1).forEach(r => {
    if (r[0] && r[1] >= cutoffStr) {
      trainings.push({
        id:           r[0],
        datum:        r[1],
        trainingstyp: r[2],
        dauer_min:    r[3],
        notiz:        r[4],
        stimmung:     r[5],
      });
    }
  });
  
  // Sätze für diese Trainings
  const trainingIds = trainings.map(t => t.id);
  const sRows = saetzeSh.getDataRange().getValues();
  const saetze = [];
  sRows.slice(1).forEach(r => {
    if (r[0] && trainingIds.includes(r[0])) {
      saetze.push({
        training_id:    r[0],
        uebung_id:      r[1],
        uebung_name:    r[2],
        satz_nr:        r[3],
        gewicht_kg:     r[4],
        wiederholungen: r[5],
        dauer_sek:      r[6],
        notiz:          r[7],
      });
    }
  });
  
  // Gewicht
  const gRows = gewichtSh.getDataRange().getValues();
  const gewichte = [];
  gRows.slice(1).forEach(r => {
    if (r[0] && r[0] >= cutoffStr) {
      gewichte.push({ datum: r[0], gewicht_kg: r[1], notiz: r[2] });
    }
  });
  
  return { status: 'ok', trainings, saetze, gewichte };
}

// ── Training-Detail laden ─────────────────────────────────────────────────────
function getTrainingDetail(trainingId) {
  const ss = ensureSheetsReady_();
  const saetzeSh = ss.getSheetByName(SHEETS.SAETZE);
  const rows = saetzeSh.getDataRange().getValues();
  const saetze = [];
  rows.slice(1).forEach(r => {
    if (r[0] === trainingId) {
      saetze.push({
        uebung_id:      r[1],
        uebung_name:    r[2],
        satz_nr:        r[3],
        gewicht_kg:     r[4],
        wiederholungen: r[5],
        dauer_sek:      r[6],
        notiz:          r[7],
      });
    }
  });
  return { status: 'ok', saetze };
}

// ── Gewicht-History laden ─────────────────────────────────────────────────────
function getGewichtHistory() {
  const ss = ensureSheetsReady_();
  const sh = ss.getSheetByName(SHEETS.GEWICHT);
  const rows = sh.getDataRange().getValues();
  const gewichte = rows.slice(1).map(r => ({
    datum: r[0], gewicht_kg: r[1], notiz: r[2]
  })).filter(r => r.datum);
  return { status: 'ok', gewichte };
}

// ── Training löschen ──────────────────────────────────────────────────────────
function deleteTraining(trainingId) {
  const ss = ensureSheetsReady_();
  
  // Training-Row löschen
  const tSh = ss.getSheetByName(SHEETS.TRAINING);
  const tRows = tSh.getDataRange().getValues();
  for (let i = tRows.length - 1; i >= 1; i--) {
    if (tRows[i][0] === trainingId) {
      tSh.deleteRow(i + 1);
      break;
    }
  }
  
  // Sätze löschen
  const sSh = ss.getSheetByName(SHEETS.SAETZE);
  const sRows = sSh.getDataRange().getValues();
  for (let i = sRows.length - 1; i >= 1; i--) {
    if (sRows[i][0] === trainingId) {
      sSh.deleteRow(i + 1);
    }
  }
  
  return { status: 'ok', message: 'Training gelöscht' };
}

// ── Testfunktion (in Apps Script ausführen zum Testen) ────────────────────────
function test_init() {
  console.log(initSheets());
}
