import { useState, useRef, useCallback } from 'react'
import { createProfile, uploadAvatar, isUsernameAvailable } from '../../lib/auth'
import { autocompleteCity } from '../../lib/places'
import './ProfileSetup.css'

const AVATAR_COLORS = ['#8B3A62','#2D6A8B','#3A8B62','#8B6B2D','#5E3A8B','#2D8B7A','#8B4A2D','#4A6B8B']

function avatarColor(username) {
  const hash = (username || '?').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function getInitials(username) {
  if (!username) return '?'
  const parts = username.split(/[_.\-\s]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return username.slice(0, 2).toUpperCase()
}

const PRIVACY_OPTIONS = [
  { id: 'public',    icon: '🌍', label: 'Public',          sub: 'Everyone can see your places' },
  { id: 'followers', icon: '👥', label: 'Followers only',  sub: 'Only people you approve'      },
  { id: 'private',   icon: '🔒', label: 'Private',         sub: 'Just you'                     },
]

const USERNAME_RE = /^[a-zA-Z0-9_]+$/

export default function ProfileSetup({ user, onCreated }) {
  const [username,       setUsername]       = useState('')
  const [usernameStatus, setUsernameStatus] = useState(null) // null|'checking'|'ok'|'taken'|'invalid'|'short'
  const [city,           setCity]           = useState('')
  const [cityResults,    setCityResults]    = useState([])
  const [cityOpen,       setCityOpen]       = useState(false)
  const [privacy,        setPrivacy]        = useState('public')
  const [avatarFile,     setAvatarFile]     = useState(null)
  const [avatarPreview,  setAvatarPreview]  = useState(null)
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState(null)

  const fileRef    = useRef()
  const usernameDebounce = useRef(null)
  const cityDebounce     = useRef(null)

  /* ── Avatar ── */
  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  /* ── Username ── */
  const handleUsernameChange = useCallback((e) => {
    const val = e.target.value.trim()
    setUsername(val)
    clearTimeout(usernameDebounce.current)
    setUsernameStatus(null)

    if (!val) return
    if (val.length < 3)             { setUsernameStatus('short');   return }
    if (!USERNAME_RE.test(val))     { setUsernameStatus('invalid'); return }
    if (val.length > 20)            { setUsernameStatus('invalid'); return }

    setUsernameStatus('checking')
    usernameDebounce.current = setTimeout(async () => {
      const available = await isUsernameAvailable(val)
      setUsernameStatus(available ? 'ok' : 'taken')
    }, 500)
  }, [])

  /* ── City ── */
  const handleCityInput = useCallback((e) => {
    const val = e.target.value
    setCity(val)
    clearTimeout(cityDebounce.current)
    if (val.length < 2) { setCityResults([]); setCityOpen(false); return }
    cityDebounce.current = setTimeout(async () => {
      const results = await autocompleteCity(val)
      setCityResults(results)
      setCityOpen(results.length > 0)
    }, 350)
  }, [])

  function selectCity(name) {
    setCity(name)
    setCityOpen(false)
    setCityResults([])
  }

  /* ── Submit ── */
  async function handleSubmit() {
    if (usernameStatus !== 'ok') return
    setLoading(true); setError(null)

    try {
      let avatar_url = null
      if (avatarFile) {
        try { avatar_url = await uploadAvatar(user.id, avatarFile) }
        catch { /* avatar upload is non-fatal */ }
      }

      const profile = await createProfile({
        id:            user.id,
        email:         user.email,
        username,
        home_city:     city || null,
        privacy_level: privacy,
        avatar_url,
      })

      onCreated(profile)
    } catch (e) {
      setError(e.message || 'Something went wrong, please try again')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = usernameStatus === 'ok' && !loading

  const statusEl = {
    checking: <span className="ps-username-status ps-username-status--checking">Checking...</span>,
    ok:       <span className="ps-username-status ps-username-status--ok">✓ Available</span>,
    taken:    <span className="ps-username-status ps-username-status--err">✗ Taken</span>,
    invalid:  <span className="ps-username-status ps-username-status--err">Letters, numbers and underscores only</span>,
    short:    <span className="ps-username-status ps-username-status--err">At least 3 characters</span>,
  }[usernameStatus] ?? null

  const bg     = avatarColor(username)
  const initials = getInitials(username)

  return (
    <div className="ps-screen">
      <div className="ps-inner">

        {/* Header */}
        <div className="ps-header">
          <span className="ps-header-logo">Plate</span>
          <h1 className="ps-header-title">Create Your Profile</h1>
          <p className="ps-header-sub">Step 2 of 2</p>
        </div>

        {/* Avatar */}
        <div className="ps-avatar-wrap" onClick={() => fileRef.current?.click()}>
          <div
            className="ps-avatar"
            style={avatarPreview
              ? { backgroundImage: `url(${avatarPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: bg }
            }
          >
            {!avatarPreview && <span className="ps-avatar-initials">{initials}</span>}
            <div className="ps-avatar-overlay">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </div>
          </div>
          <span className="ps-avatar-hint">Add profile photo</span>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />

        {/* Username */}
        <div className="ps-field">
          <label className="ps-label">Username <span className="ps-required">*</span></label>
          <div className="ps-input-wrap">
            <input
              className={`ps-input${usernameStatus === 'ok' ? ' ps-input--ok' : usernameStatus && usernameStatus !== 'checking' ? ' ps-input--err' : ''}`}
              type="text"
              placeholder="letters_and_numbers"
              value={username}
              onChange={handleUsernameChange}
              maxLength={20}
              autoComplete="off"
            />
          </div>
          {statusEl}
        </div>

        {/* City */}
        <div className="ps-field">
          <label className="ps-label">Home City</label>
          <div className="ps-city-wrap">
            <input
              className="ps-input"
              type="text"
              placeholder="Tel Aviv, Jerusalem..."
              value={city}
              onChange={handleCityInput}
              onBlur={() => setTimeout(() => setCityOpen(false), 150)}
              onFocus={() => cityResults.length > 0 && setCityOpen(true)}
            />
            {cityOpen && (
              <ul className="ps-city-results">
                {cityResults.map(r => (
                  <li
                    key={r.placeId}
                    className="ps-city-result-item"
                    onMouseDown={() => selectCity(r.name)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {r.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Privacy */}
        <div className="ps-field">
          <label className="ps-label">Privacy</label>
          <div className="ps-privacy-cards">
            {PRIVACY_OPTIONS.map(opt => (
              <button
                key={opt.id}
                className={`ps-privacy-card${privacy === opt.id ? ' ps-privacy-card--active' : ''}`}
                onClick={() => setPrivacy(opt.id)}
                type="button"
              >
                <span className="ps-privacy-icon">{opt.icon}</span>
                <span className="ps-privacy-label">{opt.label}</span>
                <span className="ps-privacy-sub">{opt.sub}</span>
                {privacy === opt.id && (
                  <div className="ps-privacy-check">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="ps-error">{error}</p>}

        {/* Submit */}
        <button
          className="ps-submit-btn"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {loading ? 'Creating profile...' : 'Create my profile'}
        </button>

      </div>
    </div>
  )
}
