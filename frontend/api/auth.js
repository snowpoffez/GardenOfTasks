/**
 * Auth API – for testing your backend authentication.
 * Set VITE_API_URL in .env (e.g. http://localhost:8000) or we default to localhost:8000.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: (username || '').trim(), password: password || '' }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = data.detail || (res.status === 401 ? 'Invalid username or password' : 'Login failed')
    throw new Error(message)
  }
  return data
}

export async function register(username, password) {
  const res = await fetch(`${API_BASE}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: (username || '').trim(), password: password || '' }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = data.detail || (res.status === 400 ? 'Username already exists' : 'Sign up failed')
    throw new Error(message)
  }
  return data
}
