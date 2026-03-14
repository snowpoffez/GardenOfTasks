import { useState } from 'react'

// Mock: replace with API call to check if account exists (e.g. GET /auth/check?identifier=...)
function checkAccountExists(identifier) {
  const trimmed = (identifier || '').trim().toLowerCase()
  // Simulate existing accounts for demo
  const existing = new Set(['test@test.com', 'user', 'demo'])
  return existing.has(trimmed)
}

export default function LoginPage({ onLoginSuccess, onBack }) {
  const [step, setStep] = useState('identify') // 'identify' | 'password' | 'signup'
  const [identifier, setIdentifier] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState('')

  const handleIdentifySubmit = (e) => {
    e.preventDefault()
    setError('')
    const value = identifier.trim()
    if (!value) return
    setIsChecking(true)
    // Simulate network delay; replace with: await api.get('/auth/check', { params: { identifier: value } })
    setTimeout(() => {
      setIsChecking(false)
      const exists = checkAccountExists(value)
      if (exists) {
        setStep('password')
        setPassword('')
      } else {
        setStep('signup')
        setEmail(value.includes('@') ? value : '')
        setPassword('')
      }
    }, 300)
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!password.trim()) return
    // Mock login success; replace with: await api.post('/auth/login', { identifier, password })
    setTimeout(() => onLoginSuccess(), 200)
  }

  const handleSignupSubmit = (e) => {
    e.preventDefault()
    setError('')
    const eTrim = email.trim()
    const pTrim = password.trim()
    if (!eTrim || !pTrim) {
      setError('Email and password are required.')
      return
    }
    // Mock signup success; replace with: await api.post('/auth/signup', { email: eTrim, password: pTrim })
    setTimeout(() => onLoginSuccess(), 200)
  }

  const resetToIdentify = () => {
    setStep('identify')
    setIdentifier('')
    setEmail('')
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
              Enter your username or email to continue.
            </p>
            <input
              type="text"
              autoComplete="username email"
              placeholder="Username or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
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
              Account for <strong>{identifier}</strong>
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
              No account found. Sign up with your email and a password.
            </p>
            <input
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
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
              Use a different email or username
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
