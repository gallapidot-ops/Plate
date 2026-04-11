import { useState, useEffect, useCallback } from 'react'
import { supabase }       from './lib/supabase'
import { getProfile }     from './lib/auth'
import { getPendingRequestCount, removeFromWishlist, deletePlace } from './lib/db'
import Auth               from './components/Auth/Auth'
import ProfileSetup       from './components/ProfileSetup/ProfileSetup'
import Home               from './components/Home/Home'
import AddPlace           from './components/AddPlace/AddPlace'
import Profile            from './components/Profile/Profile'
import Notifications      from './components/Notifications/Notifications'
import UserProfile        from './components/UserProfile/UserProfile'
import Swipe              from './components/Swipe/Swipe'
import BestMatch          from './components/BestMatch/BestMatch'
import PlacePage          from './components/PlacePage/PlacePage'
import AppHeader          from './components/AppHeader/AppHeader'
import GuestSheet         from './components/GuestSheet/GuestSheet'
import { PlateMascot }   from './components/Logo/Logo'
import './App.css'

const NAV = [
  {
    id: 'home', label: 'Search',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  },
  {
    id: 'add', label: 'Add', accent: true,
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>,
  },
  {
    id: 'profile', label: 'Profile',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  },
]

function SplashLogoContent() {
  return <PlateMascot width={110} />
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

/* ── Guest profile screen ── */
function GuestProfileScreen({ onSignUp, onSignIn }) {
  return (
    <div className="guest-profile-screen">
      <div className="guest-profile-inner">
        <div className="guest-profile-avatar">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </div>
        <h2 className="guest-profile-title">Your Plate</h2>
        <p className="guest-profile-sub">
          Create a free account to save places, rate your visits, and discover what friends love.
        </p>
        <button className="btn-primary guest-profile-btn" onClick={onSignUp}>
          Create Account
        </button>
        <button className="btn-ghost guest-profile-btn" onClick={onSignIn}>
          Sign In
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [authUser,       setAuthUser]       = useState(undefined)
  const [profile,        setProfile]        = useState(null)
  const [isGuest,        setIsGuest]        = useState(false)
  const [showGuestSheet, setShowGuestSheet] = useState(false)
  const [screen,         setScreen]         = useState('home')
  const [selectedPlace,  setSelectedPlace]  = useState(null)
  const [showSwipe,      setShowSwipe]      = useState(false)
  const [showBestMatch,  setShowBestMatch]  = useState(false)
  const [viewingUserId,  setViewingUserId]  = useState(null) // UserProfile overlay
  const [notifCount,     setNotifCount]     = useState(0)
  const [addPrefill,        setAddPrefill]        = useState(null) // prefill data for AddPlace
  const [profileRefreshKey, setProfileRefreshKey] = useState(0)
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

  // Delete a place from PlacePage
  async function handleDeletePlace(placeId) {
    if (!window.confirm('Delete this place from your list?')) return
    setSelectedPlace(null)
    try {
      await deletePlace(placeId)
      setProfileRefreshKey(k => k + 1)
    } catch (e) {
      console.error('[App] deletePlace:', e)
      alert(`Could not delete: ${e.message}`)
    }
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

    // Not logged in and not in guest mode → Auth screen
    if (!authUser && !isGuest) {
      return <Auth onGuestMode={() => { setIsGuest(true); setScreen('home') }} />
    }

    // Logged in but no profile yet → setup
    if (authUser && !profile) {
      return <ProfileSetup user={authUser} onCreated={setProfile} />
    }

    // Shared rendering helpers (used by both authenticated + guest)
    const guestAction  = isGuest ? () => setShowGuestSheet(true) : null
    const exitGuest    = () => { setIsGuest(false); setShowGuestSheet(false) }

    const showUserOverlay = viewingUserId && !selectedPlace && !showSwipe
    const hideNav         = selectedPlace || showSwipe || showUserOverlay || showBestMatch

    return (
      <div className="app-shell">
        {/* Swipe overlay */}
        {!isGuest && showSwipe && (
          <div className="place-page-overlay">
            <Swipe onBack={() => setShowSwipe(false)} />
          </div>
        )}

        {/* Best Match overlay */}
        {showBestMatch && (
          <BestMatch
            onClose={() => setShowBestMatch(false)}
            onOpenPlace={p => { setShowBestMatch(false); setSelectedPlace(p) }}
          />
        )}

        {/* Place detail overlay */}
        {!showSwipe && selectedPlace && (
          <div className="place-page-overlay">
            <PlacePage
              place={selectedPlace}
              onBack={() => setSelectedPlace(null)}
              onEdit={isGuest ? undefined : handleEditPlace}
              onDelete={isGuest ? undefined : handleDeletePlace}
            />
          </div>
        )}

        {/* User profile overlay (from People search) */}
        {showUserOverlay && (
          <div className="place-page-overlay">
            <UserProfile
              userId={viewingUserId}
              currentUserId={isGuest ? null : authUser?.id}
              onBack={() => setViewingUserId(null)}
              onOpenPlace={setSelectedPlace}
              onGuestAction={guestAction}
            />
          </div>
        )}

        <div className={`app-content${showSplash ? ' app-content--splash-enter' : ''}`}>
          {screen === 'home' && (
            <Home
              onSearch={() => {}}
              onViewUser={setViewingUserId}
              currentUserId={isGuest ? null : authUser?.id}
              onGuestAction={guestAction}
              onOpenPlace={setSelectedPlace}
              onOpenBestMatch={() => setShowBestMatch(true)}
            />
          )}
          {screen === 'add' && !isGuest && (
            <AddPlace
              key={addPrefill ? JSON.stringify({p: addPrefill.placeId ?? addPrefill.place?.name, e: addPrefill.editMode}) : 'new'}
              onSaved={handleAddSaved}
              prefill={addPrefill}
            />
          )}
          {screen === 'notifications' && !isGuest && (
            <Notifications onNotifCountChange={handleNotifCountChange} />
          )}
          {screen === 'profile' && !isGuest && (
            <Profile
              onOpenPlace={setSelectedPlace}
              currentProfile={profile}
              onWishlistVisit={handleWishlistVisit}
              refreshKey={profileRefreshKey}
              onProfileUpdated={setProfile}
              onOpenInbox={() => setScreen('notifications')}
              notifCount={notifCount}
            />
          )}
          {screen === 'profile' && isGuest && (
            <GuestProfileScreen onSignUp={exitGuest} onSignIn={exitGuest} />
          )}
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
                onClick={() => {
                  if (isGuest && item.id === 'add') { setShowGuestSheet(true); return }
                  setScreen(item.id)
                  if (item.id !== 'add') setAddPrefill(null)
                }}
              >
                <span style={{ position: 'relative', display: 'inline-flex' }}>
                  {item.icon}
                  {!isGuest && item.id === 'notifications' && notifCount > 0 && (
                    <span className="nav-badge">{notifCount > 9 ? '9+' : notifCount}</span>
                  )}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        )}

        {/* Guest sheet — shown when guest taps a restricted action */}
        {isGuest && showGuestSheet && (
          <GuestSheet
            onSignUp={exitGuest}
            onDismiss={() => setShowGuestSheet(false)}
          />
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
