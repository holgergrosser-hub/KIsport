import { useState, useEffect } from 'react';
import TrainingErfassen from './components/TrainingErfassen.jsx';
import GewichtErfassen from './components/GewichtErfassen.jsx';
import Auswertung from './components/Auswertung.jsx';
import KiAssistent from './components/KiAssistent.jsx';
import { api } from './api.js';

const TABS = [
  { id: 'erfassen',   label: '+ Erfassen' },
  { id: 'auswertung', label: '📊 Auswertung' },
  { id: 'ki',         label: '🤖 KI-Coach' },
];

export default function App() {
  const [tab, setTab]           = useState('erfassen');
  const [backendOk, setBackendOk] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    api.ping()
      .then(() => setBackendOk(true))
      .catch(() => setBackendOk(false));
  }, []);

  const onSave = () => setRefreshKey(k => k + 1);

  return (
    <>
      <nav className="nav">
        <div className="nav-logo">💪 Fitness Tracker</div>
        {TABS.map(t => (
          <button key={t.id}
            className={`nav-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      {/* Backend-Status */}
      {backendOk === false && (
        <div style={{
          background: '#ffebee', color: '#c62828',
          padding: '0.5rem 1rem', textAlign: 'center', fontSize: '0.82rem'
        }}>
          ⚠️ Backend nicht verbunden. Bitte GAS_URL in Netlify-Umgebungsvariablen eintragen.
        </div>
      )}
      {backendOk === true && (
        <div style={{
          background: '#e8f5e9', color: '#2e7d32',
          padding: '0.35rem 1rem', textAlign: 'center', fontSize: '0.78rem'
        }}>
          ✅ Verbunden mit Google Sheets
        </div>
      )}

      {tab === 'erfassen' && (
        <>
          <div className="page" style={{ paddingBottom: '0.5rem' }}>
            <GewichtErfassen onSave={onSave} />
          </div>
          <TrainingErfassen onSave={onSave} />
        </>
      )}
      {tab === 'auswertung' && <Auswertung key={refreshKey} />}
      {tab === 'ki' && <KiAssistent />}
    </>
  );
}
