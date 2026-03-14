import { useState } from 'react'

// Mock: replace with API call to check if account exists (e.g. GET /auth/check?username=...)
function checkAccountExists(username) {
  const trimmed = (username || '').trim().toLowerCase()
  const existing = new Set(['test', 'user', 'demo'])
  return existing.has(trimmed)
}

export default function LoginPage({ onLoginSuccess, onBack }) {
  const [step, setStep] = useState('identify') // 'identify' | 'password' | 'signup'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState('')

  const handleIdentifySubmit = (e) => {
    e.preventDefault()
    setError('')
    const value = username.trim()
    if (!value) return
    setIsChecking(true)
    // Simulate network delay; replace with: await api.get('/auth/check', { params: { username: value } })
    setTimeout(() => {
      setIsChecking(false)
      const exists = checkAccountExists(value)
      setStep(exists ? 'password' : 'signup')
      setPassword('')
    }, 300)
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!password.trim()) return
    // Mock login success; replace with: await api.post('/auth/login', { username, password })
    setTimeout(() => onLoginSuccess(), 200)
  }

  const handleSignupSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!password.trim()) {
      setError('Password is required.')
      return
    }
    // Mock signup success; replace with: await api.post('/auth/signup', { username, password })
    setTimeout(() => onLoginSuccess(), 200)
  }

  const resetToIdentify = () => {
    setStep('identify')
    setUsername('')
    setPassword('')
    setError('')
  }

  const inputClass =
    'w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2'
  const inputStyle = {
    backgroundColor: 'var(--col-bg-card)',
    borderColor: 'var(--col-border)',
    color: 'var(--col-text-body)',
  }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center p-8 min-h-0 overflow-auto"
      style={{ backgroundColor: 'var(--col-bg-page)' }}
    >
      <div className="w-full max-w-sm flex flex-col gap-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="self-start text-sm font-medium opacity-90 hover:opacity-100"
            style={{ color: 'var(--col-text-body)' }}
          >
            ← Back
          </button>
        )}

        {step === 'identify' && (
          <form onSubmit={handleIdentifySubmit} className="flex flex-col gap-4">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--col-text-heading)' }}>
              Log in or sign up
            </h1>
            <p className="text-sm" style={{ color: 'var(--col-text-muted)' }}>
              Enter your username to continue.
            </p>
            <input
              type="text"
              autoComplete="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
            <button type="submit" disabled={isChecking} className="btn-accent py-2.5 rounded-lg font-medium">
              {isChecking ? 'Checking…' : 'Continue'}
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--col-text-heading)' }}>
              Enter password
            </h1>
            <p className="text-sm" style={{ color: 'var(--col-text-muted)' }}>
              Account for <strong>{username}</strong>
            </p>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
            {error && <p className="text-sm" style={{ color: 'var(--col-danger)' }}>{error}</p>}
            <button type="submit" className="btn-accent py-2.5 rounded-lg font-medium">
              Log in
            </button>
            <button type="button" onClick={resetToIdentify} className="text-sm font-medium" style={{ color: 'var(--col-text-muted)' }}>
              Use a different account
            </button>
          </form>
        )}

        {step === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--col-text-heading)' }}>
              Create account
            </h1>
            <p className="text-sm" style={{ color: 'var(--col-text-muted)' }}>
              No account found for <strong>{username}</strong>. Choose a password to sign up.
            </p>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
            {error && <p className="text-sm" style={{ color: 'var(--col-danger)' }}>{error}</p>}
            <button type="submit" className="btn-accent py-2.5 rounded-lg font-medium">
              Sign up
            </button>
            <button type="button" onClick={resetToIdentify} className="text-sm font-medium" style={{ color: 'var(--col-text-muted)' }}>
              Use a different username
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
