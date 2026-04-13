/**
 * API client — single source of truth for all HTTP calls to the backend.
 * All functions normalize errors to { code, message } objects.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

/**
 * Shared fetch wrapper with consistent error normalization.
 * @param {string} path
 * @param {RequestInit} options
 * @returns {Promise<any>} parsed JSON body
 */
async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const defaults = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  };

  let response;
  try {
    response = await fetch(url, { ...defaults, ...options, headers: { ...defaults.headers, ...(options.headers || {}) } });
  } catch (err) {
    // Network failure (offline, DNS failure, CORS preflight failure, AbortError)
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

/**
 * Send email text for phishing analysis.
 * @param {string} emailText
 * @param {AbortSignal} [signal]
 * @returns {Promise<Object>} analysis result
 */
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

/**
 * Register a new user account.
 * @param {{ username: string, email: string, password: string }} fields
 */
export async function register({ username, email, password }) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

/**
 * Log in and receive a session cookie.
 * @param {{ email: string, password: string }} fields
 * @returns {Promise<{ user: Object }>}
 */
export async function login({ email, password }) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/** Log out and clear the session cookie. */
export async function logout() {
  return apiFetch('/auth/logout', { method: 'POST' });
}

/**
 * Fetch the currently authenticated user (used on mount).
 * Returns null instead of throwing on 401.
 */
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

/** Fetch the authenticated user's scan history. */
export async function getHistory() {
  return apiFetch('/history');
}
