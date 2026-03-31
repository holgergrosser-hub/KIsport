import { GAS_URL } from './data.js';

const STORAGE_KEY = 'fitness_tracker_gas_url';
const PLACEHOLDER_URL = 'DEINE_GAS_URL_HIER';

function isPlaceholderUrl(url) {
  return !url || url === PLACEHOLDER_URL || url.includes('DEINE_GAS_URL_HIER');
}

function isValidHttpUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function getGasUrlState() {
  const storedUrl = typeof window !== 'undefined'
    ? window.localStorage.getItem(STORAGE_KEY) || ''
    : '';
  const envUrl = GAS_URL || '';
  const url = storedUrl || envUrl;
  const source = storedUrl ? 'browser' : 'env';
  const configured = isValidHttpUrl(url) && !isPlaceholderUrl(url);

  return { url, source, configured };
}

export function setConfiguredGasUrl(url) {
  const value = url.trim();
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, value);
  }
}

export function clearConfiguredGasUrl() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

function requireGasUrl(urlOverride) {
  const url = urlOverride || getGasUrlState().url;

  if (isPlaceholderUrl(url)) {
    throw new Error('Google-Apps-Script-URL fehlt. Trage die Web-App-URL im Setup-Feld der App ein oder setze VITE_GAS_URL.');
  }

  if (!isValidHttpUrl(url)) {
    throw new Error('Die Google-Apps-Script-URL ist ungültig. Erwartet wird eine vollständige https-URL der Web-App.');
  }

  return url;
}

// ── GET Requests ──────────────────────────────────────────────────────────────
export async function apiGet(action, params = {}, urlOverride) {
  const url = new URL(requireGasUrl(urlOverride));
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── POST Requests (FormData – kein Content-Type Header per Skill) ─────────────
export async function apiPost(data, urlOverride) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, val]) => {
    formData.append(key, typeof val === 'object' ? JSON.stringify(val) : val);
  });
  
  const res = await fetch(requireGasUrl(urlOverride), { method: 'POST', body: formData });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Convenience Funktionen ────────────────────────────────────────────────────
export const api = {
  getLast60Days:      ()          => apiGet('getLast60Days'),
  getGewicht:         ()          => apiGet('getGewicht'),
  getTrainingDetail:  (id)        => apiGet('getTrainingDetail', { id }),
  saveTraining:       (data)      => apiPost({ action: 'saveTraining', ...data }),
  saveGewicht:        (data)      => apiPost({ action: 'saveGewicht', ...data }),
  deleteTraining:     (id)        => apiPost({ action: 'deleteTraining', id }),
  ping:               (url)       => apiGet('ping', {}, url),
  getSetupStatus:     (url)       => apiGet('setupStatus', {}, url),
};
