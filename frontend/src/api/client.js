/**
 * API client — single source of truth for all HTTP calls to the backend.
 * All functions normalize errors to { code, message } objects.
 *
 * Auth uses Authorization: Bearer <token> headers so the JWT works
 * cross-origin (Vercel → Render) without SameSite cookie restrictions.
 * The token is persisted in localStorage so it survives page reloads.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001';

// ---------------------------------------------------------------------------
// Token store
// ---------------------------------------------------------------------------

let _authToken = localStorage.getItem('phishnet_auth_token') || null;

export function setAuthToken(token) {
  _authToken = token;
  if (token) localStorage.setItem('phishnet_auth_token', token);
  else        localStorage.removeItem('phishnet_auth_token');
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;

  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (_authToken) headers['Authorization'] = `Bearer ${_authToken}`;

  let response;
  try {
    response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    const networkErr = new Error('Cannot reach server. Check your connection.');
    networkErr.code = 'NETWORK_ERROR';
    throw networkErr;
  }

  if (!response.ok) {
    let body = {};
    try { body = await response.json(); } catch { /* ignore parse error */ }
    const err = new Error(body.message || `Request failed (${response.status})`);
    err.code = body.code || 'REQUEST_ERROR';
    err.status = response.status;
    throw err;
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

export async function analyzeEmail(emailText, signal) {
  return apiFetch('/analyze', {
    method: 'POST',
    body: JSON.stringify({ email_text: emailText }),
    signal,
  });
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function register({ username, email, password }) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export async function login({ email, password }) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.token) setAuthToken(data.token);
  return data;
}

export async function logout() {
  setAuthToken(null);
  return apiFetch('/auth/logout', { method: 'POST' });
}

export async function getMe() {
  try {
    return await apiFetch('/auth/me');
  } catch (err) {
    if (err.status === 401) return null;
    throw err;
  }
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

export async function getHistory() {
  return apiFetch('/history');
}
