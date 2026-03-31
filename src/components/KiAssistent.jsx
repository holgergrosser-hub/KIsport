import { useState } from 'react';
import { ALLE_UEBUNGEN, KI_HINWEISE } from '../data.js';

const GALPIN_TIPPS = [
  { titel: '3-5 Protokoll', text: 'Für Kraft: 3-5 Übungen, 3-5 Sätze, 3-5 Wdh, 3-5 Min Pause. Alles dreht sich um diese Zahl.', emoji: '💪' },
  { titel: 'Deload-Wochen', text: 'Alle 4 Wochen eine Deload-Woche (Gewichte -20%, Sätze -1). Adaptation passiert in der Erholung, nicht im Training!', emoji: '🔄' },
  { titel: 'Progressive Überlastung', text: 'Jede Woche +1 Wiederholung ODER +2,5 kg. Kein Tracking = kein Fortschritt. Immer aufschreiben.', emoji: '📈' },
  { titel: 'Zone 2 Ausdauer', text: 'Puls 60-70% Max. Bei 60 Jahren: ca. 104 bpm. Du kannst sprechen aber nicht singen. 3h/Woche Zone 2 = optimale Fettverbrennung.', emoji: '🏃' },
  { titel: 'Protein', text: '1,6-2g pro kg Körpergewicht. Gleichmäßig über den Tag verteilen. Post-Workout besonders wichtig für Muskelerhalt.', emoji: '🥩' },
  { titel: 'Schlaf', text: '7-8 Std. Pflicht. Galpin: "Sleep is the most powerful performance-enhancing tool you have — and it\'s free." Ohne Schlaf kein Fortschritt.', emoji: '😴' },
  { titel: 'Höhentraining Ajusco', text: 'Auf 2.900m: 15-20% langsamer laufen als auf Meereshöhe. Das ist physiologisch korrekt! Trinkvolumen erhöhen.', emoji: '🏔️' },
  { titel: 'HIIT Frequenz', text: 'Max. 1-2x pro Woche HIIT. Mehr ist kontraproduktiv für Fettabbau. Qualität > Quantität.', emoji: '⚡' },
];

const FAQS = [
  {
    keywords: ['protein', 'eiweiss', 'eiweiß'],
    antwort: 'Peile täglich etwa 1,6 bis 2,0 g Protein pro kg Körpergewicht an. Verteile es auf 3 bis 4 Mahlzeiten und plane nach dem Training eine proteinreiche Mahlzeit ein. Für Muskelaufbau und Muskelerhalt mit 60+ ist Konstanz wichtiger als einzelne Shakes.',
  },
  {
    keywords: ['schlaf', 'muede', 'müde', 'regeneration'],
    antwort: '7 bis 8 Stunden Schlaf sind hier Pflicht. Wenn das Training schwer wirkt, obwohl das Gewicht gleich bleibt, ist oft Regeneration der limitierende Faktor. Dann Intensität kurz senken, Spaziergang statt HIIT und Schlaf priorisieren.',
  },
  {
    keywords: ['knie', 'kniebeuge'],
    antwort: 'Bei Knieschmerz zuerst Tiefe, Standbreite und Kontrolle prüfen. Oft hilft: langsamer absenken, Gewicht reduzieren, Knie sauber über den Fuß führen und vorübergehend Goblet Squats statt schwerer Langhantel. Schmerz unter Last nicht wegtrainieren.',
  },
  {
    keywords: ['ruecken', 'rücken', 'kreuzheben'],
    antwort: 'Bei Rückenbeschwerden Last senken und nur in der kontrollierbaren Bewegungsamplitude arbeiten. Neutraler Rücken, gespannter Bauch und sauberes Hip-Hinge-Muster sind wichtiger als Gewicht. Wenn Schmerz stechend ist: Training abbrechen und medizinisch abklären.',
  },
  {
    keywords: ['zone 2', 'zone2', 'puls', 'ausdauer'],
    antwort: 'Zone 2 bedeutet lockere Dauerarbeit bei etwa 60 bis 70 % der maximalen Herzfrequenz. In deinem Kontext ist Sprechtempo der beste Test: du solltest vollständige Sätze sprechen können. Lieber zu locker als zu hart.',
  },
  {
    keywords: ['ajusco', 'hoehe', 'höhe'],
    antwort: 'Am Ajusco ist die Höhe ein echter Leistungsfaktor. Laufe dort 15 bis 20 % langsamer als auf Meereshöhe und erhöhe Trinkmenge sowie Erholung. Der langsamere Pace ist physiologisch normal und kein Trainingsrückschritt.',
  },
  {
    keywords: ['fettabbau', 'abnehmen', 'gewicht verlieren'],
    antwort: 'Für Fettabbau wirken drei Dinge zusammen: leichtes Kaloriendefizit, genügend Protein und regelmäßige Zone-2-Einheiten plus Krafttraining. HIIT ist nur ein Zusatz, nicht die Basis. Wenn Gewicht stagniert, zuerst Ernährung und Alltagsbewegung prüfen.',
  },
  {
    keywords: ['hiit', 'intervall'],
    antwort: 'HIIT maximal 1 bis 2 Mal pro Woche. Es sollte kurz, hart und technisch sauber sein. Wenn deine Beine vom Krafttraining noch schwer sind, ist an diesem Tag Zone 2 meist die bessere Entscheidung.',
  },
];

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function findeUebungsAntwort(frage) {
  const normFrage = normalizeText(frage);
  const match = ALLE_UEBUNGEN.find(ueb => {
    const normName = normalizeText(ueb.name);
    const normId = ueb.id.replace(/_/g, ' ');
    return normFrage.includes(normName) || normFrage.includes(normId);
  });

  if (!match || !KI_HINWEISE[match.id]) return null;

  const hinweis = KI_HINWEISE[match.id];
  return `${match.name}: ${hinweis.ausfuehrung}\n\nWichtig für dich: ${hinweis.tipp}\n\nGalpin-Prinzip: ${hinweis.galpin}`;
}

function beantworteFrage(frage) {
  const uebungsAntwort = findeUebungsAntwort(frage);
  if (uebungsAntwort) return uebungsAntwort;

  const normFrage = normalizeText(frage);
  const faq = FAQS.find(eintrag => eintrag.keywords.some(keyword => normFrage.includes(keyword)));
  if (faq) return faq.antwort;

  return 'Ich beantworte Fragen hier lokal und ohne externen KI-Dienst. Frag am besten konkret nach Protein, Schlaf, Zone 2, HIIT, Fettabbau, Ajusco-Höhe oder nenne direkt eine Übung wie Kniebeuge, Kreuzheben oder Bankdrücken.';
}

export default function KiAssistent() {
  const [gewaehlt, setGewaehlt] = useState(null);
  const [frage, setFrage]       = useState('');
  const [antwort, setAntwort]   = useState('');
  const [loading, setLoading]   = useState(false);

  const uebHinweis = gewaehlt ? KI_HINWEISE[gewaehlt] : null;
  const uebName = gewaehlt ? ALLE_UEBUNGEN.find(u => u.id === gewaehlt)?.name : '';

  const fragenAn = () => {
    if (!frage.trim()) return;
    setLoading(true);
    setAntwort('');
    setAntwort(beantworteFrage(frage));
    setLoading(false);
  };

  return (
    <div className="page">
      <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>🤖 KI-Trainingsassistent</h2>

      {/* Frage an KI */}
      <div className="card">
        <div className="card-title">💬 Stell mir eine Frage</div>
        <div className="field-help" style={{ marginBottom: '0.75rem' }}>
          Lokaler Coachmodus aktiv. Die Antworten funktionieren jetzt ohne externen API-Schlüssel.
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <input
            type="text"
            value={frage}
            onChange={e => setFrage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fragenAn()}
            placeholder="z.B. Warum schmerzen meine Knie beim Kniebeugen?"
          />
          <button className="btn btn-primary" onClick={fragenAn} disabled={loading} style={{ whiteSpace: 'nowrap' }}>
            {loading ? '⏳' : '➤ Fragen'}
          </button>
        </div>

        {/* Schnellfragen */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
          {[
            'Wie viel Protein brauche ich?',
            'Was essen vor dem Training?',
            'Knie schmerzen – was tun?',
            'Wie lange sollte ich schlafen?',
            'Welche Übungen bei Rückenschmerzen?',
            'Zone 2 Puls für mein Alter berechnen',
          ].map(q => (
            <button key={q} className="btn btn-sm btn-secondary"
              onClick={() => { setFrage(q); }}>
              {q}
            </button>
          ))}
        </div>

        {antwort && (
          <div className="ki-box">
            <div className="ki-box-title">🤖 Antwort deines Coaches</div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{antwort}</div>
          </div>
        )}
      </div>

      {/* Übungshinweise */}
      <div className="card">
        <div className="card-title">📚 Ausführungshinweise – Übung wählen</div>
        <div style={{ marginBottom: '0.75rem' }}>
          <select value={gewaehlt || ''} onChange={e => setGewaehlt(e.target.value || null)}>
            <option value="">– Übung wählen –</option>
            {ALLE_UEBUNGEN.filter(u => KI_HINWEISE[u.id]).map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        {uebHinweis && (
          <div>
            <div className="ki-box" style={{ marginBottom: '0.5rem' }}>
              <div className="ki-box-title">🏋️ {uebName} – Ausführung</div>
              <div style={{ lineHeight: 1.6 }}>{uebHinweis.ausfuehrung}</div>
            </div>
            <div className="ki-box">
              <div className="ki-box-title">💡 Tipp für 60+</div>
              <div style={{ lineHeight: 1.6 }}>{uebHinweis.tipp}</div>
              <div className="ki-galpin">📣 {uebHinweis.galpin}</div>
            </div>
          </div>
        )}
      </div>

      {/* Galpin Prinzipien */}
      <div className="card">
        <div className="card-title">⚡ Galpins wichtigste Prinzipien</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          {GALPIN_TIPPS.map(t => (
            <div key={t.titel} style={{
              background: '#fafafa', border: '1px solid #eee',
              borderRadius: 8, padding: '0.7rem', fontSize: '0.82rem'
            }}>
              <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>
                {t.emoji} {t.titel}
              </div>
              <div style={{ color: '#555', lineHeight: 1.5 }}>{t.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
