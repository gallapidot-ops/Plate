import { useState } from 'react'
import Home      from './components/Home/Home'
import AddPlace  from './components/AddPlace/AddPlace'
import Profile   from './components/Profile/Profile'
import Swipe     from './components/Swipe/Swipe'
import PlacePage from './components/PlacePage/PlacePage'
import './App.css'

const NAV = [
  {
    id: 'home', label: 'חיפוש',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  },
  {
    id: 'add', label: 'הוסיפי', accent: true,
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>,
  },
  {
    id: 'profile', label: 'פרופיל',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  },
]

export default function App() {
  const [screen,        setScreen]        = useState('home')
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [showSwipe,     setShowSwipe]     = useState(false)

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
        {screen === 'profile' && <Profile onOpenPlace={setSelectedPlace} />}
      </div>

      {/* ── Bottom nav (hidden when overlay is open) ── */}
      {!selectedPlace && !showSwipe && (
        <nav className="bottom-nav" dir="rtl">
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
