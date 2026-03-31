import { useState } from 'react';
import { UEBUNGEN, ALLE_UEBUNGEN, KI_HINWEISE, TRAINING_TYPEN } from '../data.js';
import { api } from '../api.js';

const heute = () => new Date().toISOString().split('T')[0];

const STIMMUNGEN = ['😴', '😐', '🙂', '😊', '🔥'];

const EINHEIT_LABEL = { kg: 'Gewicht (kg)', min: 'Zeit (Min)', sek: 'Sek', runden: 'Runden', cm: 'Höhe (cm)' };

export default function TrainingErfassen({ onSave }) {
  const [datum, setDatum]           = useState(heute());
  const [typ, setTyp]               = useState('');
  const [dauer, setDauer]           = useState('');
  const [stimmung, setStimmung]     = useState('🙂');
  const [notiz, setNotiz]           = useState('');
  const [uebungen, setUebungen]     = useState([]); // [{uebung_id, uebung_name, einheit, saetze:[]}]
  const [kiUebung, setKiUebung]     = useState(null);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  // Übung zum Training hinzufügen
  const addUebung = (ueb) => {
    if (uebungen.find(u => u.uebung_id === ueb.id)) return;
    setUebungen(prev => [...prev, {
      uebung_id: ueb.id,
      uebung_name: ueb.name,
      einheit: ueb.einheit,
      saetze: [{ satz_nr: 1, gewicht_kg: '', wiederholungen: '', dauer_sek: '', notiz: '' }]
    }]);
    setKiUebung(ueb.id);
  };

  const removeUebung = (id) => setUebungen(prev => prev.filter(u => u.uebung_id !== id));

  const addSatz = (uebungId) => {
    setUebungen(prev => prev.map(u => {
      if (u.uebung_id !== uebungId) return u;
      const nr = u.saetze.length + 1;
      const last = u.saetze[u.saetze.length - 1];
      return { ...u, saetze: [...u.saetze, { ...last, satz_nr: nr }] };
    }));
  };

  const removeSatz = (uebungId, idx) => {
    setUebungen(prev => prev.map(u => {
      if (u.uebung_id !== uebungId) return u;
      const neu = u.saetze.filter((_, i) => i !== idx).map((s, i) => ({ ...s, satz_nr: i + 1 }));
      return { ...u, saetze: neu };
    }));
  };

  const updateSatz = (uebungId, idx, field, val) => {
    setUebungen(prev => prev.map(u => {
      if (u.uebung_id !== uebungId) return u;
      const saetze = u.saetze.map((s, i) => i === idx ? { ...s, [field]: val } : s);
      return { ...u, saetze };
    }));
  };

  // Verfügbare Übungen je nach Trainingstyp
  const getUebungenFuerTyp = () => {
    if (!typ) return ALLE_UEBUNGEN;
    if (typ === 'kraft_uk')    return UEBUNGEN.kraft.unterkoerper;
    if (typ === 'kraft_ok')    return UEBUNGEN.kraft.oberkoerper;
    if (typ === 'ganzkoerper') return [...UEBUNGEN.kraft.ganzkoerper];
    if (typ === 'laufen')      return UEBUNGEN.ausdauer.laufen;
    if (typ === 'hiit')        return UEBUNGEN.ausdauer.intervall;
    return ALLE_UEBUNGEN;
  };

  const speichern = async () => {
    if (!datum || !typ) { showToast('⚠️ Datum und Trainingstyp wählen!'); return; }
    setSaving(true);
    try {
      const saetzeFlach = [];
      uebungen.forEach(u => {
        u.saetze.forEach(s => saetzeFlach.push({ uebung_id: u.uebung_id, uebung_name: u.uebung_name, ...s }));
      });
      await api.saveTraining({ datum, trainingstyp: typ, dauer_min: dauer, stimmung, notiz, saetze: saetzeFlach });
      showToast('✅ Training gespeichert!');
      // Reset
      setTyp(''); setDauer(''); setStimmung('🙂'); setNotiz(''); setUebungen([]);
      onSave && onSave();
    } catch (e) {
      showToast('❌ Fehler: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const ki = kiUebung ? KI_HINWEISE[kiUebung] : null;

  return (
    <div className="page">
      <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>🏋️ Training erfassen</h2>

      {/* Basis-Infos */}
      <div className="card">
        <div className="grid-2" style={{ marginBottom: '0.75rem' }}>
          <div>
            <label>Datum</label>
            <input type="date" value={datum} onChange={e => setDatum(e.target.value)} />
          </div>
          <div>
            <label>Dauer (Min)</label>
            <input type="number" value={dauer} onChange={e => setDauer(e.target.value)} placeholder="45" />
          </div>
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Trainingstyp</label>
          <select value={typ} onChange={e => { setTyp(e.target.value); setUebungen([]); }}>
            <option value="">– wählen –</option>
            {TRAINING_TYPEN.map(t => <option key={t.id} value={t.id}>{t.label} ({t.tag})</option>)}
          </select>
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Stimmung</label>
          <div className="stimmung-row">
            {STIMMUNGEN.map(s => (
              <button key={s} className={`stimmung-btn ${stimmung === s ? 'selected' : ''}`}
                onClick={() => setStimmung(s)}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <label>Notiz (optional)</label>
          <textarea value={notiz} onChange={e => setNotiz(e.target.value)} placeholder="Wie lief das Training?" rows={2} />
        </div>
      </div>

      {/* Übungen wählen */}
      {typ && (
        <div className="card">
          <div className="card-title">➕ Übungen hinzufügen</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {getUebungenFuerTyp().map(ueb => {
              const schonDrin = uebungen.find(u => u.uebung_id === ueb.id);
              return (
                <button key={ueb.id}
                  className={`btn btn-sm ${schonDrin ? 'btn-green' : 'btn-secondary'}`}
                  onClick={() => schonDrin ? null : addUebung(ueb)}>
                  {schonDrin ? '✓ ' : ''}{ueb.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* KI-Hinweis */}
      {ki && (
        <div className="ki-box">
          <div className="ki-box-title">🤖 KI-Hinweis: {ALLE_UEBUNGEN.find(u => u.id === kiUebung)?.name}</div>
          <div><strong>Ausführung:</strong> {ki.ausfuehrung}</div>
          <div style={{ marginTop: '0.3rem' }}><strong>Tipp:</strong> {ki.tipp}</div>
          <div className="ki-galpin">📣 {ki.galpin}</div>
        </div>
      )}

      {/* Sätze erfassen */}
      {uebungen.map(ueb => (
        <div className="card" key={ueb.uebung_id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>{ueb.uebung_name}</span>
              {KI_HINWEISE[ueb.uebung_id] && (
                <button className="btn btn-sm btn-secondary"
                  onClick={() => setKiUebung(kiUebung === ueb.uebung_id ? null : ueb.uebung_id)}>
                  🤖 Hinweis
                </button>
              )}
            </div>
            <button className="btn btn-sm btn-danger" onClick={() => removeUebung(ueb.uebung_id)}>✕</button>
          </div>

          {/* Header */}
          <div className="satz-row" style={{ fontWeight: 700, fontSize: '0.78rem', color: '#999', borderBottom: '2px solid #eee' }}>
            <div>Satz</div>
            <div>{EINHEIT_LABEL[ueb.einheit] || ueb.einheit}</div>
            <div>Wdh / Runden</div>
            <div>Zeit (Sek)</div>
            <div></div>
          </div>

          {ueb.saetze.map((satz, idx) => (
            <div className="satz-row" key={idx}>
              <div><span className="satz-nr">{satz.satz_nr}</span></div>
              <input type="number" value={satz.gewicht_kg}
                onChange={e => updateSatz(ueb.uebung_id, idx, 'gewicht_kg', e.target.value)}
                placeholder="–" style={{ textAlign: 'center' }} />
              <input type="number" value={satz.wiederholungen}
                onChange={e => updateSatz(ueb.uebung_id, idx, 'wiederholungen', e.target.value)}
                placeholder="–" style={{ textAlign: 'center' }} />
              <input type="number" value={satz.dauer_sek}
                onChange={e => updateSatz(ueb.uebung_id, idx, 'dauer_sek', e.target.value)}
                placeholder="–" style={{ textAlign: 'center' }} />
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: '1rem' }}
                onClick={() => removeSatz(ueb.uebung_id, idx)}>✕</button>
            </div>
          ))}

          <button className="btn btn-sm btn-secondary" style={{ marginTop: '0.6rem' }}
            onClick={() => addSatz(ueb.uebung_id)}>
            + Satz hinzufügen
          </button>
        </div>
      ))}

      {/* Speichern */}
      <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
        onClick={speichern} disabled={saving}>
        {saving ? '⏳ Speichert...' : '💾 Training speichern'}
      </button>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
