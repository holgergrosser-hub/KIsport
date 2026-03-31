import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { api } from '../api.js';
import { TRAINING_TYPEN, ALLE_UEBUNGEN } from '../data.js';

const TYP_EMOJI = {
  kraft_uk: '💪', kraft_ok: '💪', ganzkoerper: '🔥',
  laufen: '🏃', hiit: '⚡', aktiv: '🌿', frei: '💤'
};
const TYP_COLOR = {
  kraft_uk: '#0F3460', kraft_ok: '#0F3460', ganzkoerper: '#E65100',
  laufen: '#2E7D32', hiit: '#E94560', aktiv: '#9C27B0', frei: '#9E9E9E'
};

function formatDatum(str) {
  if (!str) return '';
  const d = new Date(str);
  return `${d.getDate()}.${d.getMonth() + 1}.`;
}

const UEBUNG_META = Object.fromEntries(ALLE_UEBUNGEN.map(ueb => [ueb.id, ueb]));

function getCardioMinuten(satz) {
  const meta = UEBUNG_META[satz.uebung_id];

  if (meta?.einheit === 'min') {
    if (satz.dauer_sek) return Number(satz.dauer_sek) / 60;
    return Number(satz.gewicht_kg) || 0;
  }

  if (meta?.einheit === 'sek') {
    return satz.dauer_sek ? Number(satz.dauer_sek) / 60 : 0;
  }

  return 0;
}

export default function Auswertung() {
  const [loading, setLoading]   = useState(true);
  const [trainings, setTrainings] = useState([]);
  const [saetze, setSaetze]     = useState([]);
  const [gewichte, setGewichte] = useState([]);
  const [detail, setDetail]     = useState(null); // aufgeklapptes Training
  const [filter, setFilter]     = useState('alle');

  useEffect(() => { laden(); }, []);

  const laden = async () => {
    setLoading(true);
    try {
      const d = await api.getLast60Days();
      setTrainings(d.trainings || []);
      setSaetze(d.saetze || []);
      setGewichte(d.gewichte || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="page"><div className="loading"><div className="spinner" /><div>Lade Daten...</div></div></div>
  );

  // ── Stats ────────────────────────────────────────────────────────────────
  const sortiertT = [...trainings].sort((a, b) => a.datum > b.datum ? 1 : -1);
  const sortierteGewichte = [...gewichte].sort((a, b) => a.datum > b.datum ? 1 : -1);
  const kraftCount   = trainings.filter(t => t.trainingstyp?.startsWith('kraft') || t.trainingstyp === 'ganzkoerper').length;
  const laufCount    = trainings.filter(t => t.trainingstyp === 'laufen').length;
  const hiitCount    = trainings.filter(t => t.trainingstyp === 'hiit').length;
  const gesamtDauer  = trainings.reduce((s, t) => s + (Number(t.dauer_min) || 0), 0);
  const aktGewicht   = sortierteGewichte.length ? sortierteGewichte[sortierteGewichte.length - 1].gewicht_kg : '–';
  const startGewicht = sortierteGewichte.length ? sortierteGewichte[0].gewicht_kg : null;
  const gewichtDelta = startGewicht && aktGewicht !== '–' ? (aktGewicht - startGewicht).toFixed(1) : null;

  // ── Gewicht-Chart-Daten ──────────────────────────────────────────────────
  const gewichtChart = [...sortierteGewichte]
    .map(g => ({ datum: formatDatum(g.datum), kg: Number(g.gewicht_kg) }));

  // ── Trainings pro Woche ──────────────────────────────────────────────────
  const wochenMap = {};
  sortiertT.forEach(t => {
    const d = new Date(t.datum);
    const wo = `KW${getWeek(d)}`;
    wochenMap[wo] = (wochenMap[wo] || 0) + 1;
  });
  const wochenChart = Object.entries(wochenMap).map(([wo, n]) => ({ wo, n }));

  // ── Bestleistungen ───────────────────────────────────────────────────────
  const bestMap = {};
  saetze.forEach(s => {
    const meta = UEBUNG_META[s.uebung_id];
    if (meta?.einheit !== 'kg') return;
    if (!s.gewicht_kg) return;
    const k = s.uebung_name;
    if (!bestMap[k] || Number(s.gewicht_kg) > Number(bestMap[k].gewicht_kg)) {
      bestMap[k] = s;
    }
  });
  const bests = Object.values(bestMap).sort((a, b) => Number(b.gewicht_kg) - Number(a.gewicht_kg)).slice(0, 8);

  // ── Längste Laufzeit ────────────────────────────────────────────────────
  const laufSaetze = saetze.filter(s => ['gehen','joggen','laufen_10km','zone2'].includes(s.uebung_id));
  const besteZeit = laufSaetze.length
    ? Math.max(...laufSaetze.map(s => getCardioMinuten(s)))
    : 0;

  // ── gefilterte Liste ─────────────────────────────────────────────────────
  const gefiltertT = filter === 'alle'
    ? [...trainings].sort((a, b) => b.datum > a.datum ? 1 : -1)
    : [...trainings].filter(t => t.trainingstyp === filter).sort((a, b) => b.datum > a.datum ? 1 : -1);

  return (
    <div className="page">
      <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>📊 Auswertung – letzte 60 Tage</h2>

      {/* ── KPIs ── */}
      <div className="grid-4" style={{ marginBottom: '1rem' }}>
        <div className="stat-box">
          <div className="stat-val">{trainings.length}</div>
          <div className="stat-label">Einheiten</div>
        </div>
        <div className="stat-box">
          <div className="stat-val">{Math.round(gesamtDauer / 60)}h</div>
          <div className="stat-label">Gesamtzeit</div>
        </div>
        <div className="stat-box">
          <div className="stat-val">{aktGewicht !== '–' ? `${aktGewicht} kg` : '–'}</div>
          <div className="stat-label">Akt. Gewicht {gewichtDelta && <span style={{ color: Number(gewichtDelta) < 0 ? '#2E7D32' : '#E94560' }}>({gewichtDelta > 0 ? '+' : ''}{gewichtDelta})</span>}</div>
        </div>
        <div className="stat-box">
          <div className="stat-val">{laufCount}</div>
          <div className="stat-label">Lauf-Einheiten</div>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '1rem' }}>
        <div className="stat-box">
          <div className="stat-val" style={{ color: '#0F3460' }}>{kraftCount}</div>
          <div className="stat-label">💪 Kraft</div>
        </div>
        <div className="stat-box">
          <div className="stat-val" style={{ color: '#E94560' }}>{hiitCount}</div>
          <div className="stat-label">⚡ HIIT</div>
        </div>
        <div className="stat-box">
          <div className="stat-val" style={{ color: '#2E7D32' }}>{besteZeit > 0 ? `${besteZeit.toFixed(1).replace('.0', '')} Min` : '–'}</div>
          <div className="stat-label">🏃 Längste Laufzeit</div>
        </div>
      </div>

      {/* ── Gewicht-Chart ── */}
      {gewichtChart.length > 1 && (
        <div className="card">
          <div className="card-title">⚖️ Gewichtsverlauf</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gewichtChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="datum" tick={{ fontSize: 11 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v} kg`, 'Gewicht']} />
                <Line type="monotone" dataKey="kg" stroke="#E94560" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Trainings pro Woche ── */}
      {wochenChart.length > 0 && (
        <div className="card">
          <div className="card-title">📅 Trainings pro Woche</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wochenChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="wo" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v, 'Einheiten']} />
                <Bar dataKey="n" fill="#0F3460" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Bestleistungen ── */}
      {bests.length > 0 && (
        <div className="card">
          <div className="card-title">🏆 Bestleistungen (Gewicht)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {bests.map(b => (
              <div key={b.uebung_id + b.gewicht_kg} style={{
                background: '#f5f5f5', borderRadius: 8, padding: '0.5rem 0.75rem',
                fontSize: '0.82rem'
              }}>
                <div style={{ fontWeight: 700 }}>{b.uebung_name}</div>
                <div style={{ color: '#E94560', fontWeight: 700 }}>{b.gewicht_kg} kg</div>
                {b.wiederholungen && <div style={{ color: '#999', fontSize: '0.75rem' }}>× {b.wiederholungen} Wdh</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Training-Liste ── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div className="card-title" style={{ margin: 0 }}>📋 Trainingshistorie</div>
          <button className="btn btn-sm btn-secondary" onClick={laden}>🔄 Aktualisieren</button>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <button className={`btn btn-sm ${filter === 'alle' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('alle')}>Alle</button>
          {TRAINING_TYPEN.map(t => (
            <button key={t.id}
              className={`btn btn-sm ${filter === t.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(t.id)}>
              {t.label.split(' ')[0]} {t.label.split(' ').slice(1).join(' ')}
            </button>
          ))}
        </div>

        {gefiltertT.length === 0 && <div className="empty">Noch keine Einträge in dieser Kategorie.</div>}

        {gefiltertT.map(t => {
          const isOpen = detail === t.id;
          const saetzeT = saetze.filter(s => s.training_id === t.id);
          const uebNamen = [...new Set(saetzeT.map(s => s.uebung_name))];
          const typInfo = TRAINING_TYPEN.find(x => x.id === t.trainingstyp);
          return (
            <div key={t.id}>
              <div className="training-item" onClick={() => setDetail(isOpen ? null : t.id)}>
                <div className="training-dot"
                  style={{ background: (TYP_COLOR[t.trainingstyp] || '#ccc') + '22' }}>
                  {TYP_EMOJI[t.trainingstyp] || '🏃'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {typInfo?.label || t.trainingstyp}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#999' }}>
                    {new Date(t.datum).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                    {t.dauer_min ? ` · ${t.dauer_min} Min` : ''}
                    {t.stimmung ? ` · ${t.stimmung}` : ''}
                  </div>
                  {uebNamen.length > 0 && (
                    <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '0.2rem' }}>
                      {uebNamen.join(' · ')}
                    </div>
                  )}
                  {t.notiz && <div style={{ fontSize: '0.8rem', color: '#777', marginTop: '0.2rem', fontStyle: 'italic' }}>"{t.notiz}"</div>}
                </div>
                <div style={{ color: '#ccc' }}>{isOpen ? '▲' : '▼'}</div>
              </div>

              {/* Detail-Ansicht */}
              {isOpen && saetzeT.length > 0 && (
                <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 8, padding: '0.75rem', marginBottom: '0.6rem' }}>
                  {[...new Set(saetzeT.map(s => s.uebung_name))].map(uName => {
                    const uSaetze = saetzeT.filter(s => s.uebung_name === uName);
                    return (
                      <div key={uName} style={{ marginBottom: '0.6rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>{uName}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {uSaetze.map((s, i) => (
                            <div key={i} style={{
                              background: '#fff', border: '1px solid #eee',
                              borderRadius: 6, padding: '0.3rem 0.6rem', fontSize: '0.8rem'
                            }}>
                              <strong>Satz {s.satz_nr}:</strong>{' '}
                              {s.gewicht_kg ? `${s.gewicht_kg} kg ` : ''}
                              {s.wiederholungen ? `× ${s.wiederholungen} Wdh` : ''}
                              {s.dauer_sek ? `${s.dauer_sek} Sek` : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ISO Wochennummer
function getWeek(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}
