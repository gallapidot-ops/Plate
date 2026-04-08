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

export default function App() {
  // undefined = still loading, null = not logged in, object = logged in
  const [authUser,       setAuthUser]       = useState(undefined)
  const [profile,        setProfile]        = useState(null)
  const [screen,         setScreen]         = useState('home')
  const [selectedPlace,  setSelectedPlace]  = useState(null)
  const [showSwipe,      setShowSwipe]      = useState(false)

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null
      setAuthUser(user)
      if (user) getProfile(user.id).then(p => setProfile(p))
    })

    // Listen for login / logout / token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setAuthUser(user)
      if (user) getProfile(user.id).then(p => setProfile(p))
      else      setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  /* ── Loading splash ── */
  if (authUser === undefined) {
    return (
      <div className="splash-screen">
        <div className="splash-logo-card">
          <div className="splash-logo-inner">
            <div className="splash-bars">
              <div className="splash-bar splash-bar--1" />
              <div className="splash-bar splash-bar--2" />
              <div className="splash-bar splash-bar--3" />
              <div className="splash-bar splash-bar--4" />
            </div>
            <div className="splash-baseline" />
            <div className="splash-wordmark">PLATE</div>
            <div className="splash-tagline">discover · rate · share</div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Not logged in ── */
  if (!authUser) return <Auth />

  /* ── Logged in but no profile yet ── */
  if (!profile) return <ProfileSetup user={authUser} onCreated={setProfile} />

  /* ── Main app ── */
  return (
    <div className="app-shell">

      {/* ── Discover overlay (Swipe) ── */}
      {showSwipe && (
        <div className="place-page-overlay">
          <Swipe onBack={() => setShowSwipe(false)} />
        </div>
      )}

      {/* ── Place Page overlay ── */}
      {!showSwipe && selectedPlace && (
        <div className="place-page-overlay">
          <PlacePage place={selectedPlace} onBack={() => setSelectedPlace(null)} />
        </div>
      )}

      {/* ── Main screens ── */}
      <div className="app-content">
        {screen === 'home'    && <Home onSearch={() => {}} />}
        {screen === 'add'     && <AddPlace onSaved={() => setScreen('home')} />}
        {screen === 'profile' && <Profile onOpenPlace={setSelectedPlace} currentProfile={profile} />}
      </div>

      {/* ── Bottom nav ── */}
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
