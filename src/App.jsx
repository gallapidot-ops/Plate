import { useState, useEffect } from 'react'
import { supabase }    from './lib/supabase'
import { getProfile }  from './lib/auth'
import Auth            from './components/Auth/Auth'
import ProfileSetup    from './components/ProfileSetup/ProfileSetup'
import Home            from './components/Home/Home'
import AddPlace        from './components/AddPlace/AddPlace'
import Profile         from './components/Profile/Profile'
import Swipe           from './components/Swipe/Swipe'
import PlacePage       from './components/PlacePage/PlacePage'
import './App.css'

const NAV = [
  {
    id: 'home', label: 'Search',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  },
  {
    id: 'add', label: 'Add', accent: true,
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>,
  },
  {
    id: 'profile', label: 'Profile',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  },
]

// Logo markup shared between splash card and the morph target feel
function SplashLogoContent() {
  return (
    <>
      <svg className="splash-bars-svg" width="93" height="105" viewBox="0 0 93 105" fill="none">
        <rect className="splash-bar splash-bar--1" x="0"  y="55" width="18" height="50"  rx="9" fill="#3D4F7C" fillOpacity="0.40" />
        <rect className="splash-bar splash-bar--2" x="25" y="25" width="18" height="80"  rx="9" fill="#3D4F7C" fillOpacity="0.65" />
        <rect className="splash-bar splash-bar--3" x="50" y="0"  width="18" height="105" rx="9" fill="#3D4F7C" fillOpacity="1.00" />
        <rect className="splash-bar splash-bar--4" x="75" y="35" width="18" height="70"  rx="9" fill="#3D4F7C" fillOpacity="0.65" />
      </svg>
      <div className="splash-baseline" />
      <div className="splash-wordmark">PLATE</div>
      <div className="splash-tagline">discover · rate · share</div>
    </>
  )
}

function SplashOverlay({ onDone }) {
  // phase: 'hold' → 'morph' → done (unmount)
  const [phase, setPhase] = useState('hold')

  useEffect(() => {
    // Logo animation fully completes at ~1.6s; start morph just after
    const morphTimer = setTimeout(() => setPhase('morph'), 1550)
    // Morph takes 0.8s card + 0.2s delay on bg = 1.0s total; add 0.1s buffer
    const doneTimer  = setTimeout(() => onDone(), 1550 + 1000)
    return () => { clearTimeout(morphTimer); clearTimeout(doneTimer) }
  }, [onDone])

  return (
    <div className={`splash-overlay splash-overlay--${phase}`}>
      <div className="splash-logo-card">
        <div className="splash-logo-inner">
          <SplashLogoContent />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  // undefined = still loading, null = not logged in, object = logged in
  const [authUser,      setAuthUser]      = useState(undefined)
  const [profile,       setProfile]       = useState(null)
  const [screen,        setScreen]        = useState('home')
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [showSwipe,     setShowSwipe]     = useState(false)
  // Show splash once per session
  const [showSplash,    setShowSplash]    = useState(
    () => !sessionStorage.getItem('plate_splash_shown')
  )

  useEffect(() => {
    if (showSplash) sessionStorage.setItem('plate_splash_shown', '1')
  }, [showSplash])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null
      setAuthUser(user)
      if (user) getProfile(user.id).then(p => setProfile(p))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setAuthUser(user)
      if (user) getProfile(user.id).then(p => setProfile(p))
      else      setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  /* ── Render app content (under the splash) ── */
  function renderContent() {
    if (authUser === undefined) {
      // Still checking session — show blank bg while splash plays
      return <div style={{ height: '100svh', background: 'var(--color-bg)' }} />
    }
    if (!authUser) return <Auth />
    if (!profile)  return <ProfileSetup user={authUser} onCreated={setProfile} />

    return (
      <div className="app-shell">
        {showSwipe && (
          <div className="place-page-overlay">
            <Swipe onBack={() => setShowSwipe(false)} />
          </div>
        )}
        {!showSwipe && selectedPlace && (
          <div className="place-page-overlay">
            <PlacePage place={selectedPlace} onBack={() => setSelectedPlace(null)} />
          </div>
        )}
        <div className={`app-content${showSplash ? ' app-content--splash-enter' : ''}`}>
          {screen === 'home'    && <Home onSearch={() => {}} />}
          {screen === 'add'     && <AddPlace onSaved={() => setScreen('home')} />}
          {screen === 'profile' && <Profile onOpenPlace={setSelectedPlace} currentProfile={profile} />}
        </div>
        {!selectedPlace && !showSwipe && (
          <nav className="bottom-nav">
            {NAV.map(item => (
              <button
                key={item.id}
                className={`bottom-nav-item ${item.accent ? 'bottom-nav-item--accent' : ''} ${screen === item.id ? 'bottom-nav-item--active' : ''}`}
                onClick={() => setScreen(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    )
  }

  return (
    <>
      {renderContent()}
      {showSplash && <SplashOverlay onDone={() => setShowSplash(false)} />}
    </>
  )
}
