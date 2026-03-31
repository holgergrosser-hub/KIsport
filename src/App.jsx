import { useState, useEffect, lazy, Suspense } from 'react';
import TrainingErfassen from './components/TrainingErfassen.jsx';
import GewichtErfassen from './components/GewichtErfassen.jsx';
const Auswertung = lazy(() => import('./components/Auswertung.jsx'));
const KiAssistent = lazy(() => import('./components/KiAssistent.jsx'));
import { api, getGasUrlState, setConfiguredGasUrl, clearConfiguredGasUrl } from './api.js';

const TABS = [
  { id: 'erfassen',   label: '+ Erfassen' },
  { id: 'auswertung', label: '📊 Auswertung' },
  { id: 'ki',         label: '🤖 KI-Coach' },
];

export default function App() {
  const [tab, setTab]           = useState('erfassen');
  const [backendOk, setBackendOk] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [setupUrl, setSetupUrl] = useState(getGasUrlState().url);
  const [setupInfo, setSetupInfo] = useState('');
  const [testingBackend, setTestingBackend] = useState(false);
  const [setupState, setSetupState] = useState(getGasUrlState());

  useEffect(() => {
    pruefeBackend();
  }, []);

  const onSave = () => setRefreshKey(k => k + 1);

  const syncSetupState = () => {
    const next = getGasUrlState();
    setSetupState(next);
    setSetupUrl(next.url);
    return next;
  };

  const pruefeBackend = async (urlOverride) => {
    setTestingBackend(true);
    try {
      const info = await api.getSetupStatus(urlOverride);
      setBackendOk(true);
      setSetupInfo(info.message || 'Verbindung erfolgreich.');
      syncSetupState();
    } catch (error) {
      setBackendOk(false);
      setSetupInfo(error.message);
      syncSetupState();
    } finally {
      setTestingBackend(false);
    }
  };

  const speichernUndTesten = async () => {
    setConfiguredGasUrl(setupUrl);
    await pruefeBackend(setupUrl.trim());
  };

  const aufEnvZuruecksetzen = async () => {
    clearConfiguredGasUrl();
    const next = syncSetupState();
    await pruefeBackend(next.url);
  };

  const renderLazyFallback = (text) => (
    <div className="page">
      <div className="loading">
        <div className="spinner" />
        <div>{text}</div>
      </div>
    </div>
  );

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
          ⚠️ Backend nicht verbunden. Trage unten die Google-Apps-Script-Web-App-URL ein und teste die Verbindung direkt in der App.
        </div>
      )}
      {backendOk === true && (
        <div style={{
          background: '#e8f5e9', color: '#2e7d32',
          padding: '0.35rem 1rem', textAlign: 'center', fontSize: '0.78rem'
        }}>
          ✅ Verbunden mit Google Sheets ({setupState.source === 'browser' ? 'URL aus Browser-Setup' : 'URL aus VITE_GAS_URL'})
        </div>
      )}

      {tab === 'erfassen' && (
        <>
          <div className="page" style={{ paddingBottom: '0.5rem' }}>
            <div className="card">
              <div className="card-title">🔌 Google Sheets Verbindung</div>
              <div className="field-help" style={{ marginBottom: '0.75rem' }}>
                Trage hier die URL deiner Apps-Script-Web-App ein. Danach kann die App ohne neuen Netlify-Deploy direkt getestet werden.
              </div>
              <div className="backend-setup-row">
                <input
                  type="url"
                  value={setupUrl}
                  onChange={e => setSetupUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                />
                <button className="btn btn-primary" onClick={speichernUndTesten} disabled={testingBackend}>
                  {testingBackend ? '⏳ Prüft...' : 'Speichern + testen'}
                </button>
              </div>
              <div className="backend-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => pruefeBackend(setupUrl.trim())} disabled={testingBackend}>
                  Verbindung prüfen
                </button>
                <button className="btn btn-secondary btn-sm" onClick={aufEnvZuruecksetzen} disabled={testingBackend}>
                  Browser-URL löschen
                </button>
              </div>
              <div className={`setup-status ${backendOk ? 'setup-ok' : 'setup-error'}`}>
                {setupInfo || 'Noch keine Verbindung geprüft.'}
              </div>
            </div>
            <GewichtErfassen onSave={onSave} />
          </div>
          <TrainingErfassen onSave={onSave} />
        </>
      )}
      {tab === 'auswertung' && (
        <Suspense fallback={renderLazyFallback('Auswertung wird geladen...')}>
          <Auswertung key={refreshKey} />
        </Suspense>
      )}
      {tab === 'ki' && (
        <Suspense fallback={renderLazyFallback('Coach wird geladen...')}>
          <KiAssistent />
        </Suspense>
      )}
    </>
  );
}
