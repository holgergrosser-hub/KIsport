import { GAS_URL } from './data.js';

// ── GET Requests ──────────────────────────────────────────────────────────────
export async function apiGet(action, params = {}) {
  const url = new URL(GAS_URL);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── POST Requests (FormData – kein Content-Type Header per Skill) ─────────────
export async function apiPost(data) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, val]) => {
    formData.append(key, typeof val === 'object' ? JSON.stringify(val) : val);
  });
  
  const res = await fetch(GAS_URL, { method: 'POST', body: formData });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Convenience Funktionen ────────────────────────────────────────────────────
export const api = {
  getLast60Days:      ()      => apiGet('getLast60Days'),
  getGewicht:         ()      => apiGet('getGewicht'),
  getTrainingDetail:  (id)    => apiGet('getTrainingDetail', { id }),
  saveTraining:       (data)  => apiPost({ action: 'saveTraining', ...data }),
  saveGewicht:        (data)  => apiPost({ action: 'saveGewicht', ...data }),
  deleteTraining:     (id)    => apiPost({ action: 'deleteTraining', id }),
  ping:               ()      => apiGet('ping'),
};
