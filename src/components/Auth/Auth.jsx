import { useState } from 'react'
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../../lib/auth'
import './Auth.css'

const ERROR_MAP = {
  'Invalid login credentials':          'אימייל או סיסמה שגויים',
  'Email not confirmed':                'יש לאשר את האימייל תחילה',
  'User already registered':            'האימייל הזה כבר רשום — נסי להתחבר',
  'Password should be at least 6 characters': 'הסיסמה חייבת להכיל לפחות 6 תווים',
}

function translateError(msg) {
  for (const [key, val] of Object.entries(ERROR_MAP)) {
    if (msg?.includes(key)) return val
  }
  return msg || 'אירעה שגיאה, נסי שוב'
}

export default function Auth() {
  const [mode,     setMode]     = useState('signin') // 'signin' | 'signup'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [success,  setSuccess]  = useState(false)

  async function handleGoogle() {
    setError(null); setLoading(true)
    try { await signInWithGoogle() }
    catch (e) { setError(translateError(e.message)); setLoading(false) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(email, password)
        setSuccess(true)
      }
    } catch (e) {
      setError(translateError(e.message))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-screen" dir="rtl">
        <div className="auth-inner">
          <div className="auth-success-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <h2 className="auth-success-title">בדקי את האימייל שלך</h2>
          <p className="auth-success-sub">שלחנו לך קישור לאישור ל-{email}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-screen" dir="rtl">
      <div className="auth-inner">

        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-text">Plate</span>
          <p className="auth-logo-sub">המקומות שלך, ביחד</p>
        </div>

        {/* Google */}
        <button className="auth-google-btn" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M46.145 24.504c0-1.619-.145-3.18-.415-4.681H24v8.856h12.421c-.536 2.888-2.164 5.335-4.613 6.977v5.799h7.471c4.371-4.025 6.866-9.951 6.866-16.951z"/>
            <path fill="#34A853" d="M24 47c6.237 0 11.467-2.067 15.279-5.595l-7.471-5.799c-2.067 1.381-4.713 2.197-7.808 2.197-6.006 0-11.088-4.056-12.903-9.504H3.442v5.99C7.237 42.007 15.01 47 24 47z"/>
            <path fill="#FBBC05" d="M11.097 28.299A13.858 13.858 0 0 1 10.364 24c0-1.493.256-2.943.733-4.299v-5.99H3.442A22.987 22.987 0 0 0 1 24c0 3.71.888 7.221 2.442 10.289l7.655-5.99z"/>
            <path fill="#EA4335" d="M24 10.197c3.384 0 6.424 1.163 8.812 3.448l6.61-6.61C35.463 3.296 30.233 1 24 1 15.01 1 7.237 5.993 3.442 13.711l7.655 5.99C12.912 14.253 17.994 10.197 24 10.197z"/>
          </svg>
          המשך עם Google
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <span>או</span>
        </div>

        {/* Email form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            dir="ltr"
          />
          <input
            className="auth-input"
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            dir="ltr"
          />
          {error && <p className="auth-error">{error}</p>}
          <button className="auth-submit-btn" type="submit" disabled={loading || !email || !password}>
            {loading ? '...' : mode === 'signin' ? 'התחברי' : 'הירשמי'}
          </button>
        </form>

        {/* Toggle */}
        <p className="auth-toggle">
          {mode === 'signin' ? 'אין לך חשבון?' : 'כבר יש לך חשבון?'}
          {' '}
          <button
            className="auth-toggle-btn"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null) }}
          >
            {mode === 'signin' ? 'הירשמי' : 'התחברי'}
          </button>
        </p>

      </div>
    </div>
  )
}
