/**
 * Auth API – for testing your backend authentication.
 * Set VITE_API_URL in .env (e.g. http://localhost:8000) or we default to localhost:8000.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getDetailMessage(detail, fallback) {
  if (detail == null) return fallback
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0]
    if (first?.msg) return first.msg
    if (typeof first === 'string') return first
  }
  return fallback
}

function wrapNetworkError(err) {
  const msg = err?.message || ''
  if (msg.includes('fetch') || err?.name === 'TypeError') {
    return new Error(
      "Can't reach the server. Check that the backend is running and the URL is correct (e.g. " +
        API_BASE +
        "). If you use a different port or host, set VITE_API_URL in frontend/.env."
    )
  }
  return err instanceof Error ? err : new Error(String(err))
}

export async function login(username, password) {
  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: (username || '').trim(), password: password || '' }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const message = getDetailMessage(data.detail, res.status === 401 ? 'Invalid username or password' : 'Login failed')
      throw new Error(message)
    }
    return data
  } catch (err) {
    throw wrapNetworkError(err)
  }
}

export async function register(username, password) {
  try {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: (username || '').trim(), password: password || '' }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const message = getDetailMessage(data.detail, res.status === 400 ? 'Username already exists' : 'Sign up failed')
      throw new Error(message)
    }
    return data
  } catch (err) {
    throw wrapNetworkError(err)
  }
}
