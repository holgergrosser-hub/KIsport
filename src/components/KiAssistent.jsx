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

export default function KiAssistent() {
  const [gewaehlt, setGewaehlt] = useState(null);
  const [frage, setFrage]       = useState('');
  const [antwort, setAntwort]   = useState('');
  const [loading, setLoading]   = useState(false);

  const uebHinweis = gewaehlt ? KI_HINWEISE[gewaehlt] : null;
  const uebName = gewaehlt ? ALLE_UEBUNGEN.find(u => u.id === gewaehlt)?.name : '';

  const fragenAn = async () => {
    if (!frage.trim()) return;
    setLoading(true);
    setAntwort('');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `Du bist ein persönlicher Fitness-Coach für Holger Grosser (60 Jahre, Deutschland/Mexico City).
Holger folgt dem "Galpin × Ajusco 16-Wochen-Plan" (Krafttraining nach Dr. Andy Galpin + 10km Laufaufbau zum Ajusco-Berg).
Ziele: Fettabbau, Kraft aufbauen, 10km laufen.
Gib kurze, praktische Antworten auf Deutsch. Beziehe dich auf Galpins Prinzipien wenn relevant.
Berücksichtige das Alter (60+): Gelenkschutz, Regeneration, Proteinbedarf wichtiger als bei Jüngeren.
Halte Antworten unter 200 Wörter.`,
          messages: [{ role: 'user', content: frage }]
        })
      });
      const d = await res.json();
      setAntwort(d.content?.[0]?.text || 'Keine Antwort erhalten.');
    } catch (e) {
      setAntwort('Fehler beim Laden: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>🤖 KI-Trainingsassistent</h2>

      {/* Frage an KI */}
      <div className="card">
        <div className="card-title">💬 Stell mir eine Frage</div>
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
