import { useState } from 'react';
import { api } from '../api.js';

const heute = () => new Date().toISOString().split('T')[0];

export default function GewichtErfassen({ onSave }) {
  const [datum, setDatum]       = useState(heute());
  const [gewicht, setGewicht]   = useState('');
  const [notiz, setNotiz]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const speichern = async () => {
    if (!gewicht) { showToast('⚠️ Gewicht eingeben!'); return; }
    setSaving(true);
    try {
      await api.saveGewicht({ datum, gewicht_kg: gewicht, notiz });
      showToast('✅ Gewicht gespeichert!');
      setGewicht(''); setNotiz('');
      onSave && onSave();
    } catch (e) {
      showToast('❌ Fehler: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="card-title">⚖️ Körpergewicht erfassen</div>
      <div className="grid-3" style={{ marginBottom: '0.75rem' }}>
        <div>
          <label>Datum</label>
          <input type="date" value={datum} onChange={e => setDatum(e.target.value)} />
        </div>
        <div>
          <label>Gewicht (kg)</label>
          <input type="number" step="0.1" value={gewicht}
            onChange={e => setGewicht(e.target.value)} placeholder="85.0" />
        </div>
        <div>
          <label>Notiz</label>
          <input type="text" value={notiz} onChange={e => setNotiz(e.target.value)} placeholder="optional" />
        </div>
      </div>
      <button className="btn btn-primary" onClick={speichern} disabled={saving}>
        {saving ? '⏳...' : '💾 Speichern'}
      </button>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
