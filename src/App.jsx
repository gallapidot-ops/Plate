import { useState, useEffect, useCallback } from 'react'
import { supabase }       from './lib/supabase'
import { getProfile }     from './lib/auth'
import { getPendingRequestCount, removeFromWishlist } from './lib/db'
import Auth               from './components/Auth/Auth'
import ProfileSetup       from './components/ProfileSetup/ProfileSetup'
import Home               from './components/Home/Home'
import AddPlace           from './components/AddPlace/AddPlace'
import Profile            from './components/Profile/Profile'
import Notifications      from './components/Notifications/Notifications'
import UserProfile        from './components/UserProfile/UserProfile'
import Swipe              from './components/Swipe/Swipe'
import PlacePage          from './components/PlacePage/PlacePage'
import AppHeader          from './components/AppHeader/AppHeader'
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

// Vertical logo: bars on top, baseline, PLATE wordmark, tagline below
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
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // Start fading after logo animation completes (~1.6s); fade takes 0.5s
    const t1 = setTimeout(() => setFading(true), 1700)
    const t2 = setTimeout(() => onDone(),         2300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div className={`splash-overlay${fading ? ' splash-overlay--fade' : ''}`}>
      <div className="splash-logo-card">
        <div className="splash-logo-inner">
          <SplashLogoContent />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [authUser,       setAuthUser]       = useState(undefined)
  const [profile,        setProfile]        = useState(null)
  const [screen,         setScreen]         = useState('home')
  const [selectedPlace,  setSelectedPlace]  = useState(null)
  const [showSwipe,      setShowSwipe]      = useState(false)
  const [viewingUserId,  setViewingUserId]  = useState(null) // UserProfile overlay
  const [notifCount,     setNotifCount]     = useState(0)
  const [addPrefill,     setAddPrefill]     = useState(null) // prefill data for AddPlace
  const [showSplash,     setShowSplash]     = useState(
    () => !sessionStorage.getItem('plate_splash_shown')
  )

  useEffect(() => {
    if (showSplash) sessionStorage.setItem('plate_splash_shown', '1')
  }, [showSplash])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null
      setAuthUser(user)
      if (user) {
        getProfile(user.id).then(p => setProfile(p))
        getPendingRequestCount().then(setNotifCount)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setAuthUser(user)
      if (user) {
        getProfile(user.id).then(p => setProfile(p))
        getPendingRequestCount().then(setNotifCount)
      } else {
        setProfile(null)
        setNotifCount(0)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Real-time: watch for new follow requests addressed to this user
  useEffect(() => {
    if (!authUser?.id) return

    const channel = supabase
      .channel(`follow-requests-${authUser.id}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'follow_requests',
          filter: `to_user_id=eq.${authUser.id}`,
        },
        (payload) => {
          if (payload.new?.status === 'pending') {
            setNotifCount(c => c + 1)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [authUser?.id])

  // Called by Notifications when count changes (accept/decline removes items)
  const handleNotifCountChange = useCallback((count) => {
    setNotifCount(count)
  }, [])

  // Wishlist → "I've been here!" opens AddPlace pre-filled with the place
  function handleWishlistVisit(wishlistItem) {
    setAddPrefill({ place: wishlistItem, wishlistPlaceId: wishlistItem.id })
    setScreen('add')
  }

  // Edit an existing saved place
  function handleEditPlace(rawPlace) {
    const primaryMealType = rawPlace.meal_types?.[0] ?? null
    const existingRating  = rawPlace.ratings?.[primaryMealType]
    setAddPrefill({
      editMode:       true,
      placeId:        rawPlace.id,
      place:          { ...rawPlace, placeId: rawPlace.google_place_id },
      experienceType: rawPlace.experience_type ?? null,
      mealType:       primaryMealType,
      extraTypes:     rawPlace.meal_types?.slice(1) ?? [],
      date:           rawPlace.last_visited ?? '',
      isRegular:      rawPlace.is_regular   ?? false,
      price:          existingRating?.price ?? null,
      rating: {
        taste:     existingRating?.taste     ?? null,
        spread:    existingRating?.spread    ?? null,
        aesthetic: existingRating?.aesthetic ?? null,
        service:   existingRating?.service   ?? null,
      },
      note: rawPlace.personal_note ?? '',
      tags: rawPlace.tags          ?? [],
    })
    setSelectedPlace(null)
    setScreen('add')
  }

  // After AddPlace saves — clean up wishlist if needed, navigate back
  const handleAddSaved = useCallback(async (savedData) => {
    const prefill = addPrefill
    setAddPrefill(null)
    if (prefill?.wishlistPlaceId) {
      try { await removeFromWishlist(prefill.wishlistPlaceId) } catch (e) { console.error(e) }
      setScreen('profile')
    } else {
      setScreen('home')
    }
  }, [addPrefill])

  function renderContent() {
    if (authUser === undefined) {
      return <div style={{ height: '100svh', background: 'var(--color-bg)' }} />
    }
    if (!authUser) return <Auth />
    if (!profile)  return <ProfileSetup user={authUser} onCreated={setProfile} />

    const showUserOverlay = viewingUserId && !selectedPlace && !showSwipe
    const hideNav         = selectedPlace || showSwipe || showUserOverlay

    return (
      <div className="app-shell">
        {/* Swipe overlay */}
        {showSwipe && (
          <div className="place-page-overlay">
            <Swipe onBack={() => setShowSwipe(false)} />
          </div>
        )}

        {/* Place detail overlay */}
        {!showSwipe && selectedPlace && (
          <div className="place-page-overlay">
            <PlacePage
              place={selectedPlace}
              onBack={() => setSelectedPlace(null)}
              onEdit={handleEditPlace}
            />
          </div>
        )}

        {/* User profile overlay (from People search) */}
        {showUserOverlay && (
          <div className="place-page-overlay">
            <UserProfile
              userId={viewingUserId}
              currentUserId={authUser.id}
              onBack={() => setViewingUserId(null)}
              onOpenPlace={setSelectedPlace}
            />
          </div>
        )}

        {!hideNav && (
          <AppHeader
            onOpenInbox={() => setScreen('notifications')}
            notifCount={notifCount}
            onGoHome={() => setScreen('home')}
          />
        )}

        <div className={`app-content${showSplash ? ' app-content--splash-enter' : ''}`}>
          {screen === 'home'          && <Home onSearch={() => {}} onViewUser={setViewingUserId} currentUserId={authUser?.id} />}
          {screen === 'add'           && <AddPlace key={addPrefill ? JSON.stringify({p: addPrefill.placeId ?? addPrefill.place?.name, e: addPrefill.editMode}) : 'new'} onSaved={handleAddSaved} prefill={addPrefill} />}
          {screen === 'notifications' && <Notifications onNotifCountChange={handleNotifCountChange} />}
          {screen === 'profile'       && <Profile onOpenPlace={setSelectedPlace} currentProfile={profile} onWishlistVisit={handleWishlistVisit} />}
        </div>

        {!hideNav && (
          <nav className="bottom-nav">
            {NAV.map(item => (
              <button
                key={item.id}
                className={[
                  'bottom-nav-item',
                  item.accent        ? 'bottom-nav-item--accent' : '',
                  screen === item.id ? 'bottom-nav-item--active' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => { setScreen(item.id); if (item.id !== 'add') setAddPrefill(null) }}
              >
                <span style={{ position: 'relative', display: 'inline-flex' }}>
                  {item.icon}
                  {item.id === 'notifications' && notifCount > 0 && (
                    <span className="nav-badge">{notifCount > 9 ? '9+' : notifCount}</span>
                  )}
                </span>
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
