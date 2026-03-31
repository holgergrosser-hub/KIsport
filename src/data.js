// ── Konfiguration ─────────────────────────────────────────────────────────────
// HIER deine Google Apps Script URL eintragen nach dem Deployment!
export const GAS_URL = import.meta.env.VITE_GAS_URL || 'DEINE_GAS_URL_HIER';

// ── Übungen aus dem 16-Wochen Galpin × Ajusco Plan ───────────────────────────
export const UEBUNGEN = {
  kraft: {
    label: '💪 Kraft',
    unterkoerper: [
      { id: 'kniebeuge',         name: 'Kniebeuge',                  einheit: 'kg' },
      { id: 'rum_kreuzheben',    name: 'Rum. Kreuzheben',            einheit: 'kg' },
      { id: 'ausfallschritte',   name: 'Ausfallschritte',            einheit: 'kg' },
      { id: 'bulg_kniebeuge',    name: 'Bulgarische Kniebeuge',      einheit: 'kg' },
      { id: 'hip_thrust',        name: 'Hip Thrust',                 einheit: 'kg' },
      { id: 'wadenpressen',      name: 'Wadenpressen',               einheit: 'kg' },
    ],
    oberkoerper: [
      { id: 'bankdruecken',      name: 'Bankdrücken',                einheit: 'kg' },
      { id: 'klimmzuege',        name: 'Klimmzüge / Latzug',         einheit: 'kg' },
      { id: 'schulterdruecken',  name: 'Schulterdrücken (DB)',        einheit: 'kg' },
      { id: 'rudern',            name: 'Rudern (Cable/DB)',           einheit: 'kg' },
      { id: 'bizeps_trizeps',    name: 'Bizeps + Trizeps Supersatz', einheit: 'kg' },
      { id: 'dips',              name: 'Dips',                       einheit: 'kg' },
    ],
    ganzkoerper: [
      { id: 'kreuzheben',        name: 'Kreuzheben',                 einheit: 'kg' },
      { id: 'box_jumps',         name: 'Box Jumps',                  einheit: 'cm' },
      { id: 'medball_slam',      name: 'Med-Ball Slam',              einheit: 'kg' },
      { id: 'kb_swing',          name: 'Kettlebell Swing',           einheit: 'kg' },
      { id: 'plank',             name: 'Plank',                      einheit: 'sek' },
      { id: 'sprint',            name: 'Sprint 30m',                 einheit: 'sek' },
    ],
  },
  ausdauer: {
    label: '🏃 Ausdauer',
    laufen: [
      { id: 'gehen',             name: 'Gehen',                      einheit: 'min' },
      { id: 'joggen',            name: 'Joggen',                     einheit: 'min' },
      { id: 'laufen_10km',       name: 'Lauf gesamt',               einheit: 'min' },
      { id: 'zone2',             name: 'Zone 2 Cardio',              einheit: 'min' },
    ],
    intervall: [
      { id: 'hiit',              name: 'HIIT (Runden)',              einheit: 'runden' },
      { id: 'radfahren',         name: 'Radfahren',                  einheit: 'min' },
      { id: 'schwimmen',         name: 'Schwimmen',                  einheit: 'min' },
    ],
  },
};

// Flache Liste aller Übungen für Suche/Lookup
export const ALLE_UEBUNGEN = [
  ...UEBUNGEN.kraft.unterkoerper,
  ...UEBUNGEN.kraft.oberkoerper,
  ...UEBUNGEN.kraft.ganzkoerper,
  ...UEBUNGEN.ausdauer.laufen,
  ...UEBUNGEN.ausdauer.intervall,
];

// ── KI-Hinweise pro Übung ─────────────────────────────────────────────────────
export const KI_HINWEISE = {
  kniebeuge: {
    ausfuehrung: 'Füße schulterbreit, Zehen leicht auswärts. Knie folgen den Zehen. Rücken gerade, Brust hoch. Tief bis Oberschenkel parallel zum Boden.',
    tipp: 'Bei 60+ besonders auf kontrollierte Absenkphase achten (3 Sek runter). Goblet-Kniebeuge mit Kettlebell ist gelenkschonender als Barbell.',
    galpin: 'Galpin: "Squat depth is individual — go as deep as your mobility allows without losing spinal position."',
  },
  rum_kreuzheben: {
    ausfuehrung: 'Stange an Oberschenkeln, Hüfte nach hinten schieben, Knie leicht gebeugt. Dehnung in der hinteren Oberschenkelmuskulatur spüren. Rücken neutral.',
    tipp: 'Keine Rundung im unteren Rücken! Wenn du die Dehnung nicht spürst, gehe nicht tiefer als nötig.',
    galpin: 'Galpin: "Hip hinge is the king of posterior chain movements. Feel the stretch, not the strain."',
  },
  kreuzheben: {
    ausfuehrung: 'Füße hüftbreit, Stange über Mittelfuß. Hüfte runter, Brust hoch, Schulterblätter über der Stange. Stange nah am Körper halten beim Heben.',
    tipp: 'Schwerste Übung der Woche — immer frisch ausgeführt, nicht am Ende des Trainings! Bei 60+ Gewicht konservativ wählen.',
    galpin: 'Galpin: "Deadlift is the ultimate strength test — intensity is the driver. 5×5 heavy beats 3×12 light."',
  },
  bankdruecken: {
    ausfuehrung: 'Schulterblätter zusammendrücken und in Bank "eingraben". Füße fest am Boden. Stange zum unteren Brustkorb, Ellbogen 45° zum Körper.',
    tipp: 'Kontrollierte Absenkphase 3 Sek. Bei Schulterproblemen: Dumbbell-Variante ist gelenkschonender.',
    galpin: 'Galpin: "Cadence 3-1-1: 3 seconds down, 1 pause, 1 second up. This maximizes muscle tension."',
  },
  klimmzuege: {
    ausfuehrung: 'Schulterblätter aktiv nach unten ziehen bevor du hochziehst. Volle Bewegungsamplitude — komplett runter hängen, Kinn über Stange.',
    tipp: 'Latzug mit Kabelzug ist eine gute Alternative. Wichtig: Schulterblätter aktiv, nicht nur mit Armen ziehen.',
    galpin: 'Galpin: "Pull-ups are the best upper body pulling movement. If you can\'t do 5, use assistance. Progress from there."',
  },
  schulterdruecken: {
    ausfuehrung: 'Stehend oder sitzend. Kein Hohlkreuz — Core anspannen. Hanteln auf Schulterhöhe, dann senkrecht nach oben drücken.',
    tipp: 'Bei Schulterproblemen: Arnie-Press oder seitliche Variante. Nie hinter dem Kopf drücken.',
    galpin: 'Galpin: "Overhead pressing is functional strength — it mirrors real-world pushing patterns."',
  },
  hip_thrust: {
    ausfuehrung: 'Oberer Rücken auf Bank. Füße schulterbreit, Knie 90°. Hüfte nach oben drücken bis Körper eine Linie bildet. Oben 1 Sek halten.',
    tipp: 'Gesäß wirklich maximal anspannen oben. Knie nicht nach innen fallen lassen.',
    galpin: 'Galpin: "Glute strength is underrated for overall athletic performance and injury prevention."',
  },
  box_jumps: {
    ausfuehrung: 'Tief in die Hocke, dann explosiv springen. WEICH landen — Knie federt ab. Schrittweise von der Box runter, nie rückwärts springen.',
    tipp: 'Power-Block immer ZUERST im Training — mit vollem Energieniveau. 3×5 mit voller Erholung ist besser als 3×10 mit Erschöpfung.',
    galpin: 'Galpin: "Power training done first, when the nervous system is fresh. 5 reps max — quality over quantity."',
  },
  kb_swing: {
    ausfuehrung: 'Kein Squat — es ist ein Hip Hinge! Kettlebell zwischen den Beinen, Hüfte explosiv nach vorn. Arme pendeln nur mit, heben die KB nicht.',
    tipp: 'Russischer Swing (bis Schulterhöhe) ist sicherer als American Swing (über Kopf). Fokus auf Hüftexplosion.',
    galpin: 'Galpin: "The swing is a ballistic hip hinge — power, not endurance. Feel the glute snap at the top."',
  },
  plank: {
    ausfuehrung: 'Ellbogen unter Schultern. Körper eine gerade Linie. Po nicht hochschieben, nicht durchhängen. Atemtechnik wichtig — normal atmen!',
    tipp: 'Wenn du 60 Sek locker hälst: Schwierigkeitsgrad erhöhen (Seitenplank, instabiler Untergrund).',
    galpin: 'Galpin: "Core stability, not core strength through range. Plank trains what the core actually does in real life."',
  },
  ausfallschritte: {
    ausfuehrung: 'Großer Schritt vor. Hinteres Knie fast auf Boden. Vorderes Knie bleibt über dem Fuß, nicht darüber hinaus. Oberkörper aufrecht.',
    tipp: 'Alternierend ist koordinativ anspruchsvoller. Walking Lunges als Variation.',
    galpin: 'Galpin: "Unilateral training exposes and corrects strength imbalances between sides."',
  },
  gehen: {
    ausfuehrung: 'Zügiges Tempo. Puls bleibt unter 130 bpm. Arme schwingen mit. Aufrechte Haltung.',
    tipp: 'Phase 1 (Wo 1-4): Gehen ist echtes Training! Gelenke vorbereiten für das spätere Joggen. Nicht unterschätzen.',
    galpin: 'Galpin: "Zone 2 training — you should be able to speak in full sentences. If not, slow down."',
  },
  joggen: {
    ausfuehrung: 'Puls 120-145 bpm. Konversationstempo — du kannst sprechen, aber nicht singen. Kurze Schritte sind besser als große Sätze.',
    tipp: 'Am Ajusco (2.900m): 15-20% langsamer als auf Meereshöhe laufen! Das ist physiologisch korrekt, kein Versagen.',
    galpin: 'Galpin: "Aerobic base is the foundation of all fitness. Don\'t skip Zone 2 — it\'s your fat-burning engine."',
  },
  laufen_10km: {
    ausfuehrung: 'Dein großes Ziel! Steadypace, kein Sprint am Anfang. Trinken alle 20-25 Min. Nach Halbzeit kurze Gehpause erlaubt.',
    tipp: 'Woche 16: Du hast 16 Wochen trainiert — vertraue dem Prozess. Ersten 5 km sehr locker.',
    galpin: 'Galpin: "The race is won in training. Trust the process — your body has adapted more than you think."',
  },
  zone2: {
    ausfuehrung: 'Dauerleistung 45+ Min bei 60-70% maximaler Herzfrequenz. Formel: (220 - Alter) × 0,65. Bei 60 Jahren ≈ 104 bpm.',
    tipp: 'Zone 2 ist der Fettverbrennungs-Haupttreiber. Langsam und konstant ist korrekt — nicht schneller!',
    galpin: 'Galpin: "Zone 2 is the most underrated training tool for fat loss. 3h/week builds an incredible aerobic base."',
  },
  hiit: {
    ausfuehrung: '20 Sek VOLLGAS, 40 Sek Erholung. 10 Runden. Fahrrad, Ruder oder Sprint. Nie Kraft direkt davor.',
    tipp: 'Galpin empfiehlt max 1-2x/Woche HIIT. Mehr ist kontraproduktiv für Fettabbau und Regeneration.',
    galpin: 'Galpin: "HIIT once or twice per week is optimal. More is not better — recovery is when adaptation happens."',
  },
  wadenpressen: {
    ausfuehrung: 'Volle Bewegungsamplitude — ganz runter hängen, ganz hoch auf Zehenspitzen. Langsam absenken (3 Sek).',
    tipp: 'Waden sind hartnäckig — höhere Wiederholungen (15-20) sind effektiver als schwere Gewichte.',
    galpin: 'Galpin: "Calves respond well to volume and frequency. Full range of motion is non-negotiable."',
  },
  rudern: {
    ausfuehrung: 'Ellbogen nach hinten, Schulterblätter am Ende zusammendrücken. Kein Schwung mit dem Oberkörper. Kontrolle auf dem Weg zurück.',
    tipp: 'Rudern ist der Ausgleich für das viele Drücken (Bankdrücken, Schulterdrücken). Verhältnis 1:1 anstreben.',
    galpin: 'Galpin: "Balance pushing with pulling. Most people push too much and pull too little."',
  },
  bizeps_trizeps: {
    ausfuehrung: 'Bizeps: Ellbogen fixiert, kein Schwung. Trizeps: Volles Strecken. Supersatz = kein Pause zwischen beiden.',
    tipp: 'Kein Schwung beim Bizepscurl. Langsamere Ausführung (3-1-1) ist effektiver als schnell und schwer.',
    galpin: 'Galpin: "Arm training is accessory work — technique and contraction quality matter more than load."',
  },
  medball_slam: {
    ausfuehrung: 'Ball über Kopf, dann mit vollem Körpereinsatz auf Boden schlagen. Knie beugen beim Absenken. Volle Kraft — das ist Power-Training!',
    tipp: 'Power-Block: 3×5 mit voller Erholung (90 Sek). Qualität der Explosivität > Quantität.',
    galpin: 'Galpin: "Power output is king. 5 maximal reps > 15 moderate reps for power development."',
  },
  bulg_kniebeuge: {
    ausfuehrung: 'Hinterer Fuß auf Bank. Vorderer Fuß weit vor. Senkrecht nach unten, Knie nicht nach innen. Anspruchsvoll — leichteres Gewicht als normale Kniebeuge.',
    tipp: 'Zeigt Kraftunterschiede zwischen Beinen. Schwächere Seite bestimmt das Gewicht.',
    galpin: 'Galpin: "Unilateral lower body training is superior for identifying and correcting imbalances."',
  },
  dips: {
    ausfuehrung: 'Schulterblätter runter und hinten. Ellbogen eng am Körper. Tief genug — Oberarm parallel zum Boden. Langsam runter, explosiv hoch.',
    tipp: 'Vorwärts lehnen = mehr Brust. Aufrecht = mehr Trizeps. Bei Schulterprob.: Bench Dips vermeiden.',
    galpin: 'Galpin: "Dips are a compound movement — not just a tricep exercise. Full range of motion always."',
  },
  sprint: {
    ausfuehrung: '10-30m vollgasSprints. Volle Erholung (2 Min) zwischen den Sprints. Explosiver Start, hohe Kniehebefrequenz.',
    tipp: 'Power-Training: 3-4 Sprints maximal. Nicht bis zur Erschöpfung — jeder Sprint soll max. Kraft haben.',
    galpin: 'Galpin: "Sprinting is the most powerful tool for maintaining fast-twitch muscle fibers as we age."',
  },
  radfahren: {
    ausfuehrung: 'Für Zone 2: entspanntes Tempo, Puls 104-130 bpm. Für HIIT: 20 Sek maximal, 40 Sek locker rollen.',
    tipp: 'Gelenkschonender als Laufen — gut für Ruhetage oder wenn Knie schmerzen.',
    galpin: 'Galpin: "Cycling is excellent for aerobic development with minimal joint stress."',
  },
  schwimmen: {
    ausfuehrung: 'Gleichmäßiges Tempo. Atemtechnik beachten — auf jeder Seite atmen. Kraul oder Rücken für Ausdauer.',
    tipp: 'Beste Alternative wenn Gelenke schmerzen. Ganzkörper-Training mit minimalem Impact.',
    galpin: 'Galpin: "Swimming combines aerobic conditioning with full-body strength — underrated for overall fitness."',
  },
};

// ── Trainingstag-Typen ────────────────────────────────────────────────────────
export const TRAINING_TYPEN = [
  { id: 'kraft_uk',   label: '💪 Kraft – Unterkörper',     tag: 'Montag' },
  { id: 'hiit',       label: '⚡ HIIT',                     tag: 'Dienstag' },
  { id: 'kraft_ok',   label: '💪 Kraft – Oberkörper',      tag: 'Mittwoch' },
  { id: 'laufen',     label: '🏃 Laufen / Zone 2',          tag: 'Donnerstag' },
  { id: 'ganzkoerper',label: '🔥 Ganzkörper + Power',       tag: 'Freitag' },
  { id: 'aktiv',      label: '🌿 Aktive Erholung',          tag: 'Samstag' },
  { id: 'frei',       label: '💤 Ruhetag',                  tag: 'Sonntag' },
];

export const TRAININGS_VORLAGEN = {
  kraft_uk: {
    dauer_min: 50,
    hinweis: 'Unterkörper mit Fokus auf Grundübungen und kontrollierter Technik.',
    uebungen: [
      { id: 'kniebeuge', saetze: [{ wiederholungen: '5' }, { wiederholungen: '5' }, { wiederholungen: '5' }] },
      { id: 'rum_kreuzheben', saetze: [{ wiederholungen: '8' }, { wiederholungen: '8' }, { wiederholungen: '8' }] },
      { id: 'ausfallschritte', saetze: [{ wiederholungen: '10' }, { wiederholungen: '10' }] },
      { id: 'wadenpressen', saetze: [{ wiederholungen: '15' }, { wiederholungen: '15' }] },
    ],
  },
  hiit: {
    dauer_min: 20,
    hinweis: 'Kurz, intensiv, danach vollständig erholen.',
    uebungen: [
      { id: 'hiit', saetze: [{ wiederholungen: '10' }] },
    ],
  },
  kraft_ok: {
    dauer_min: 50,
    hinweis: 'Oberkörper mit Druck- und Zugbewegungen im Gleichgewicht.',
    uebungen: [
      { id: 'bankdruecken', saetze: [{ wiederholungen: '5' }, { wiederholungen: '5' }, { wiederholungen: '5' }] },
      { id: 'klimmzuege', saetze: [{ wiederholungen: '8' }, { wiederholungen: '8' }, { wiederholungen: '8' }] },
      { id: 'schulterdruecken', saetze: [{ wiederholungen: '8' }, { wiederholungen: '8' }] },
      { id: 'rudern', saetze: [{ wiederholungen: '10' }, { wiederholungen: '10' }] },
    ],
  },
  laufen: {
    dauer_min: 45,
    hinweis: 'Locker genug bleiben, damit du sprechen kannst.',
    uebungen: [
      { id: 'zone2', saetze: [{ dauer_sek: '2700' }] },
    ],
  },
  ganzkoerper: {
    dauer_min: 55,
    hinweis: 'Erst explosiv, dann schwer, dann stabilisieren.',
    uebungen: [
      { id: 'box_jumps', saetze: [{ wiederholungen: '5' }, { wiederholungen: '5' }, { wiederholungen: '5' }] },
      { id: 'kreuzheben', saetze: [{ wiederholungen: '5' }, { wiederholungen: '5' }, { wiederholungen: '5' }] },
      { id: 'kb_swing', saetze: [{ wiederholungen: '10' }, { wiederholungen: '10' }, { wiederholungen: '10' }] },
      { id: 'plank', saetze: [{ dauer_sek: '45' }, { dauer_sek: '45' }, { dauer_sek: '45' }] },
    ],
  },
  aktiv: {
    dauer_min: 30,
    hinweis: 'Aktive Regeneration ohne hohe Intensität.',
    uebungen: [
      { id: 'gehen', saetze: [{ dauer_sek: '1800' }] },
    ],
  },
  frei: {
    dauer_min: '',
    hinweis: 'Ruhetag. Nur dokumentieren, wenn du bewusst Pause gemacht hast.',
    uebungen: [],
  },
};
