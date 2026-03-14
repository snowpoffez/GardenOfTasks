import { useState } from 'react'
import { login, register, checkUser } from '../api/auth'

export default function LoginPage({ onLoginSuccess, onBack }) {
  const [step, setStep] = useState('identify') // 'identify' | 'password' | 'signup'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleIdentifySubmit = async (e) => {
    e.preventDefault()
    setError('')
    const value = username.trim()
    if (!value) return
    setIsChecking(true)
    try {
      const exists = await checkUser(value)
      setStep(exists ? 'password' : 'signup')
      setPassword('')
    } catch {
      setError('Could not reach server')
    } finally {
      setIsChecking(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!password.trim()) return
    setIsLoading(true)
    try {
      const data = await login(username, password)
      onLoginSuccess({ username: data.username ?? username.trim(), user_id: data.user_id })
    } catch (err) {
      setError(err.message || 'Invalid username or password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!password.trim()) {
      setError('Password is required.')
      return
    }
    setIsLoading(true)
    try {
      const data = await register(username, password)
      onLoginSuccess({ username: username.trim(), user_id: data.user_id })
    } catch (err) {
      setError(err.message || 'Sign up failed')
    } finally {
      setIsLoading(false)
    }
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
              Welcome back!
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
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              className={inputClass}
              style={inputStyle}
            />
            {error && <p className="text-sm" style={{ color: 'var(--col-danger)' }}>{error}</p>}
            <button type="submit" disabled={isLoading} className="btn-accent py-2.5 rounded-lg font-medium">
              {isLoading ? '…' : 'Log in'}
            </button>
            <button type="button" onClick={resetToIdentify} className="text-sm font-medium" style={{ color: 'var(--col-text-muted)' }}>
              Use a different account
            </button>
          </form>
        )}

        {step === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--col-text-heading)' }}>
              Sign up
            </h1>
            <p className="text-sm" style={{ color: 'var(--col-text-muted)' }}>
              The username &quot;<strong>{username}</strong>&quot; has not been registered yet. Choose a password to sign up:
            </p>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              className={inputClass}
              style={inputStyle}
            />
            {error && <p className="text-sm" style={{ color: 'var(--col-danger)' }}>{error}</p>}
            <button type="submit" disabled={isLoading} className="btn-accent py-2.5 rounded-lg font-medium">
              {isLoading ? '…' : 'Sign up'}
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
