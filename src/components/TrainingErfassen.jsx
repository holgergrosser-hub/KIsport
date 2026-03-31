import { useState } from 'react';
import { UEBUNGEN, ALLE_UEBUNGEN, KI_HINWEISE, TRAINING_TYPEN, TRAININGS_VORLAGEN } from '../data.js';
import { api } from '../api.js';

const heute = () => new Date().toISOString().split('T')[0];

const STIMMUNGEN = ['😴', '😐', '🙂', '😊', '🔥'];

const LEERER_SATZ = { satz_nr: 1, gewicht_kg: '', wiederholungen: '', dauer_sek: '', notiz: '' };

function createUebungAusVorlage(vorlage) {
  const uebung = ALLE_UEBUNGEN.find(item => item.id === vorlage.id);
  if (!uebung) return null;

  return {
    uebung_id: uebung.id,
    uebung_name: uebung.name,
    einheit: uebung.einheit,
    saetze: (vorlage.saetze?.length ? vorlage.saetze : [{ ...LEERER_SATZ }]).map((satz, index) => ({
      ...LEERER_SATZ,
      ...satz,
      satz_nr: index + 1,
    })),
  };
}

function getFeldKonfiguration(einheit) {
  switch (einheit) {
    case 'kg':
      return [
        { field: 'gewicht_kg', label: 'Gewicht (kg)', placeholder: '40', step: '0.5' },
        { field: 'wiederholungen', label: 'Wdh', placeholder: '8', step: '1' },
      ];
    case 'min':
      return [
        { field: 'dauer_sek', label: 'Zeit (Min)', placeholder: '30', step: '1', mode: 'minutes' },
      ];
    case 'sek':
      return [
        { field: 'dauer_sek', label: 'Zeit (Sek)', placeholder: '30', step: '1' },
      ];
    case 'runden':
      return [
        { field: 'wiederholungen', label: 'Runden', placeholder: '10', step: '1' },
      ];
    case 'cm':
      return [
        { field: 'gewicht_kg', label: 'Höhe (cm)', placeholder: '40', step: '1' },
        { field: 'wiederholungen', label: 'Sprünge', placeholder: '5', step: '1' },
      ];
    default:
      return [
        { field: 'gewicht_kg', label: 'Wert', placeholder: '1', step: '1' },
      ];
  }
}

function getAnzeigeWert(satz, feld) {
  if (feld.mode === 'minutes') {
    return satz.dauer_sek ? String(Number(satz.dauer_sek) / 60) : '';
  }

  return satz[feld.field] ?? '';
}

export default function TrainingErfassen({ onSave }) {
  const [datum, setDatum]           = useState(heute());
  const [typ, setTyp]               = useState('');
  const [dauer, setDauer]           = useState('');
  const [stimmung, setStimmung]     = useState('🙂');
  const [notiz, setNotiz]           = useState('');
  const [uebungen, setUebungen]     = useState([]); // [{uebung_id, uebung_name, einheit, saetze:[]}]
  const [kiUebung, setKiUebung]     = useState(null);
  const [uebungFilter, setUebungFilter] = useState('');
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const vorlage = typ ? TRAININGS_VORLAGEN[typ] : null;

  // Übung zum Training hinzufügen
  const addUebung = (ueb) => {
    if (uebungen.find(u => u.uebung_id === ueb.id)) return;
    setUebungen(prev => [...prev, {
      uebung_id: ueb.id,
      uebung_name: ueb.name,
      einheit: ueb.einheit,
      saetze: [{ ...LEERER_SATZ }]
    }]);
    setKiUebung(ueb.id);
  };

  const removeUebung = (id) => setUebungen(prev => prev.filter(u => u.uebung_id !== id));

  const addAlleUebungen = () => {
    const vorhandeneIds = new Set(uebungen.map(u => u.uebung_id));
    const neu = getUebungenFuerTyp()
      .filter(ueb => !vorhandeneIds.has(ueb.id))
      .map(ueb => ({
        uebung_id: ueb.id,
        uebung_name: ueb.name,
        einheit: ueb.einheit,
        saetze: [{ ...LEERER_SATZ }],
      }));

    if (!neu.length) {
      showToast('ℹ️ Alle passenden Übungen sind bereits hinzugefügt.');
      return;
    }

    setUebungen(prev => [...prev, ...neu]);
    setKiUebung(neu[0]?.uebung_id || null);
  };

  const ladeVorlage = (nextTyp, showInfo = true) => {
    const nextVorlage = TRAININGS_VORLAGEN[nextTyp];
    if (!nextVorlage) {
      setUebungen([]);
      setKiUebung(null);
      setDauer('');
      return;
    }

    const vorlagenUebungen = nextVorlage.uebungen
      .map(createUebungAusVorlage)
      .filter(Boolean);

    setUebungen(vorlagenUebungen);
    setKiUebung(vorlagenUebungen[0]?.uebung_id || null);
    setDauer(nextVorlage.dauer_min === '' ? '' : String(nextVorlage.dauer_min || ''));

    if (showInfo) {
      showToast(nextVorlage.uebungen.length
        ? '✅ Tagesvorlage geladen.'
        : 'ℹ️ Ruhetag ausgewählt. Keine Übungen vorausgefüllt.');
    }
  };

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
      if (u.saetze.length === 1) {
        return { ...u, saetze: [{ ...LEERER_SATZ }] };
      }
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

  const sichtbareUebungen = getUebungenFuerTyp().filter(ueb =>
    ueb.name.toLowerCase().includes(uebungFilter.trim().toLowerCase())
  );

  const feldWertSetzen = (uebungId, idx, feld, wert) => {
    if (feld.mode === 'minutes') {
      const minuten = wert === '' ? '' : String(Math.round(Number(wert) * 60));
      updateSatz(uebungId, idx, 'dauer_sek', minuten);
      return;
    }

    updateSatz(uebungId, idx, feld.field, wert);
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
          <select value={typ} onChange={e => { const nextTyp = e.target.value; setTyp(nextTyp); setUebungFilter(''); ladeVorlage(nextTyp); }}>
            <option value="">– wählen –</option>
            {TRAINING_TYPEN.map(t => <option key={t.id} value={t.id}>{t.label} ({t.tag})</option>)}
          </select>
          {typ && (
            <div className="field-help">
              {TRAINING_TYPEN.find(t => t.id === typ)?.label} gewählt. {vorlage?.hinweis || 'Du kannst einzelne Übungen antippen oder die Tagesvorlage neu laden.'}
            </div>
          )}
        </div>
        {typ && (
          <div className="template-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => ladeVorlage(typ)}>
              Tagesvorlage neu laden
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => { setUebungen([]); setKiUebung(null); showToast('Training geleert.'); }}>
              Übungen leeren
            </button>
          </div>
        )}
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
          <div className="exercise-toolbar">
            <input
              type="text"
              value={uebungFilter}
              onChange={e => setUebungFilter(e.target.value)}
              placeholder="Übung suchen..."
            />
            <button className="btn btn-secondary" onClick={addAlleUebungen}>
              Alle passenden Übungen laden
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {sichtbareUebungen.map(ueb => {
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
          {sichtbareUebungen.length === 0 && (
            <div className="empty" style={{ padding: '1rem 0 0' }}>Keine passende Übung für die Suche gefunden.</div>
          )}
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
          {(() => {
            const felder = getFeldKonfiguration(ueb.einheit);
            const gridStyle = { gridTemplateColumns: `2.5rem repeat(${felder.length}, minmax(0, 1fr)) 2rem` };

            return (
              <>
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

          <div className="exercise-summary">
            {felder.map(feld => (
              <span key={feld.field + feld.label} className="exercise-pill">{feld.label}</span>
            ))}
          </div>

          <div className="satz-row" style={{ ...gridStyle, fontWeight: 700, fontSize: '0.78rem', color: '#999', borderBottom: '2px solid #eee' }}>
            <div>Satz</div>
            {felder.map(feld => <div key={feld.field + feld.label}>{feld.label}</div>)}
            <div></div>
          </div>

          {ueb.saetze.map((satz, idx) => (
            <div className="satz-row" style={gridStyle} key={idx}>
              <div><span className="satz-nr">{satz.satz_nr}</span></div>
              {felder.map(feld => (
                <input
                  key={feld.field + feld.label}
                  type="number"
                  step={feld.step}
                  value={getAnzeigeWert(satz, feld)}
                  onChange={e => feldWertSetzen(ueb.uebung_id, idx, feld, e.target.value)}
                  placeholder={feld.placeholder}
                  style={{ textAlign: 'center' }}
                />
              ))}
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: '1rem' }}
                onClick={() => removeSatz(ueb.uebung_id, idx)}>✕</button>
            </div>
          ))}

          <button className="btn btn-sm btn-secondary" style={{ marginTop: '0.6rem' }}
            onClick={() => addSatz(ueb.uebung_id)}>
            + Satz hinzufügen
          </button>
              </>
            );
          })()}
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
