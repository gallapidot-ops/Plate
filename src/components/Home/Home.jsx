import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Zap, MessageCircle, Users, Star, Coffee, Croissant, Sunrise, Sun, Moon, GlassWater, Wine } from 'lucide-react'
import { addPlaceToWishlist, searchPlaces, searchUsers, followUser, unfollowUser, sendFollowRequest, cancelFollowRequest } from '../../lib/db'
import { PlateCircleLogo } from '../Logo/Logo'
import './Home.css'

/* ── Data ── */

const MEAL_TYPES = [
  { id: 'cafe',        label: 'Café',         subtitle: 'morning · slow · coffee',          Icon: Coffee     },
  { id: 'brunch',      label: 'Brunch',        subtitle: 'eggs · late start · weekends',     Icon: Sunrise    },
  { id: 'lunch',       label: 'Lunch',         subtitle: 'midday · fresh · sit-down',        Icon: Sun        },
  { id: 'dinner',      label: 'Dinner',        subtitle: 'evening · full meal · candlelit',  Icon: Moon       },
  { id: 'bakery_deli', label: 'Bakery & Deli', subtitle: 'pastry · fresh bread · grab & go', Icon: Croissant  },
  { id: 'drinks',      label: 'Drinks',        subtitle: 'cocktails · wine · evening',       Icon: GlassWater },
  { id: 'happy_hour',  label: 'Happy Hour',    subtitle: 'drinks · snacks · after work',     Icon: Wine       },
]

const EXPERIENCES = [
  { id: 'quick_light',     label: 'Quick & Light',    subtitle: 'fast · solo · on the move',   Icon: Zap           },
  { id: 'catchup',         label: 'Catch-up',          subtitle: 'friends · chill · good chat', Icon: MessageCircle },
  { id: 'shared_table',    label: 'Shared Table',      subtitle: 'group · feast · together',    Icon: Users         },
  { id: 'full_experience', label: 'Full Experience',   subtitle: 'occasion · slow · memorable', Icon: Star          },
]

const EXP_LABELS = {
  quick_light:     'Quick & Light',
  catchup:         'Catch-up',
  shared_table:    'Shared Table',
  full_experience: 'Full Experience',
}

const TAGS = [
  { id: 'kosher',         label: 'Kosher'                },
  { id: 'open_shabbat',   label: 'Open on Shabbat'       },
  { id: 'vegan',          label: 'Vegan-Friendly'        },
  { id: 'outdoor',        label: 'Outdoor Seating'       },
  { id: 'rooftop',        label: 'Rooftop'               },
  { id: 'sea_view',       label: 'Sea View'              },
  { id: 'work_friendly',  label: 'Work-Friendly'         },
  { id: 'romantic',       label: 'Good for Dates'        },
  { id: 'group_friendly', label: 'Good for Groups'       },
  { id: 'kids',           label: 'Good for Kids'         },
  { id: 'pet_friendly',   label: 'Pet Friendly'          },
  { id: 'parking',        label: 'Parking'               },
  { id: 'late_night',     label: 'Late Night'            },
  { id: 'live_music',     label: 'Live Music'            },
  { id: 'quiet',          label: 'Quiet'                 },
  { id: 'hidden_gem',     label: 'Hidden Gem'            },
  { id: 'celebration',    label: 'Celebration'           },
  { id: 'reservation',    label: 'Reservation Required'  },
  { id: 'long_sit',       label: 'Long Sit'              },
]

const PRICES = [
  { id: 'great_value',       label: '₪'    },
  { id: 'fair',              label: '₪₪'   },
  { id: 'overpriced',        label: '₪₪₪'  },
  { id: 'worth_every_penny', label: '₪₪₪₪' },
]

const RESERVATIONS = [
  { id: 'grab_go',  label: 'No seating / Grab & Go'  },
  { id: 'walk_in',  label: 'Walk-in'                  },
  { id: 'weekends', label: 'Book on weekends'          },
  { id: 'required', label: 'Reservation required'     },
]

/* ════════════════════════════════════════
   PRIVACY ICONS
════════════════════════════════════════ */
function GlobeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
}

function LockIconSmall() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

function HourglassIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 22h14M5 2h14"/>
      <path d="M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12 7.59 16.41A2 2 0 0 0 7 17.83V22"/>
      <path d="M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2"/>
    </svg>
  )
}

/* ════════════════════════════════════════
   STEP 1 — Meal Type  (red background)
   Multi-select pill grid
════════════════════════════════════════ */
function MealStep({ selectedMeals, onToggleMeal, onNext, onSwitchToPeople, onOpenBestMatch }) {
  const count = selectedMeals.size

  return (
    <div className="conv-step conv-step--meal">
      {/* Top bar: logo + tabs */}
      <div className="conv-top-bar">
        <PlateCircleLogo size={44} circleFill="none" stroke="rgba(255,255,255,0.88)" />
        <div className="conv-tabs">
          <button className="conv-tab conv-tab--active">Places</button>
          <button className="conv-tab" onClick={onSwitchToPeople}>People</button>
        </div>
      </div>

      {/* Pill grid */}
      <div className="conv-center conv-center--scroll">
        <p className="conv-question">What are you in the mood for?</p>
        <div className="conv-pills-grid">
          {MEAL_TYPES.map(m => (
            <button
              key={m.id}
              className={`conv-pill${selectedMeals.has(m.id) ? ' conv-pill--active' : ''}`}
              onClick={() => onToggleMeal(m.id)}
            >
              <m.Icon size={20} strokeWidth={1.5} />
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="conv-footer">
        <button
          className="conv-btn conv-btn--dark"
          onClick={onNext}
          disabled={count === 0}
        >
          {count >= 2 ? 'These →' : 'This one →'}
        </button>
        {onOpenBestMatch && (
          <button className="bm-entry-link" onClick={onOpenBestMatch}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Best Match
          </button>
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   STEP 2 — Vibe  (sea-blue background)
   Multi-select pill grid
════════════════════════════════════════ */
function VibeStep({ selectedVibes, onToggleVibe, onNext, onSkip, onBack }) {
  const count = selectedVibes.size

  return (
    <div className="conv-step conv-step--vibe">
      <div className="conv-top-row">
        <button className="conv-back" onClick={onBack} aria-label="Back">←</button>
        <button className="conv-skip" onClick={onSkip}>Skip</button>
      </div>

      <div className="conv-center conv-center--scroll">
        <p className="conv-question">What's the vibe?</p>
        <div className="conv-pills-grid">
          {EXPERIENCES.map(e => (
            <button
              key={e.id}
              className={`conv-pill conv-pill--tall${selectedVibes.has(e.id) ? ' conv-pill--active' : ''}`}
              onClick={() => onToggleVibe(e.id)}
            >
              <e.Icon size={20} strokeWidth={1.5} />
              <span className="conv-pill-label">{e.label}</span>
              <span className="conv-pill-sub">{e.subtitle}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="conv-footer">
        <button className="conv-btn conv-btn--dark" onClick={onNext}>
          {count >= 2 ? 'These vibes →' : count === 1 ? 'This vibe →' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   STEP 3 — Where  (cream background)
════════════════════════════════════════ */
function WhereStep({ location, onChangeLocation, onSearch, onSkip, onBack, filters, onChangeFilters }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const activeCount = [...filters.price, ...filters.reservation, ...filters.tags].filter(Boolean).length

  return (
    <div className="conv-step conv-step--where">
      <div className="conv-top-row">
        <button className="conv-back conv-back--dark" onClick={onBack} aria-label="Back">←</button>
        <button className="conv-skip conv-skip--dark" onClick={onSkip}>Skip</button>
      </div>

      <div className="conv-center conv-center--left">
        <h1 className="conv-question conv-question--dark">Where are you?</h1>
        <div className="conv-location-wrap">
          <svg className="conv-location-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <input
            className="conv-location-input"
            type="text"
            placeholder="City, neighborhood, street…"
            value={location}
            onChange={e => onChangeLocation(e.target.value)}
          />
        </div>

        {/* Active filter pills */}
        {activeCount > 0 && (
          <div className="conv-active-filters">
            {filters.tags.map(id => {
              const tag = TAGS.find(t => t.id === id)
              return tag ? (
                <span key={id} className="conv-active-filter-pill">
                  {tag.label}
                  <button onClick={() => onChangeFilters(f => ({ ...f, tags: f.tags.filter(t => t !== id) }))} aria-label={`Remove ${tag.label}`}>×</button>
                </span>
              ) : null
            })}
            {filters.price.map(id => {
              const p = PRICES.find(pr => pr.id === id)
              return p ? (
                <span key={id} className="conv-active-filter-pill">
                  {p.label}
                  <button onClick={() => onChangeFilters(f => ({ ...f, price: f.price.filter(pr => pr !== id) }))} aria-label={`Remove ${p.label}`}>×</button>
                </span>
              ) : null
            })}
            {filters.reservation.map(id => {
              const r = RESERVATIONS.find(rv => rv.id === id)
              return r ? (
                <span key={id} className="conv-active-filter-pill">
                  {r.label}
                  <button onClick={() => onChangeFilters(f => ({ ...f, reservation: f.reservation.filter(rv => rv !== id) }))} aria-label={`Remove ${r.label}`}>×</button>
                </span>
              ) : null
            })}
          </div>
        )}
      </div>

      <div className="conv-footer">
        <button
          type="button"
          className={`conv-more-filters${activeCount > 0 ? ' conv-more-filters--active' : ''}`}
          onClick={() => setDrawerOpen(true)}
        >
          {activeCount > 0 ? `Filters (${activeCount}) ✓` : 'More filters +'}
        </button>
        <button className="conv-btn conv-btn--red" onClick={onSearch}>
          Search →
        </button>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        setFilters={onChangeFilters}
      />
    </div>
  )
}

/* ════════════════════════════════════════
   FILTERS DRAWER
════════════════════════════════════════ */
function Drawer({ open, onClose, filters, setFilters }) {
  if (!open) return null

  function toggleTag(id) {
    setFilters(f => ({
      ...f,
      tags: f.tags.includes(id) ? f.tags.filter(t => t !== id) : [...f.tags, id],
    }))
  }

  function toggleArray(key, id) {
    setFilters(f => ({
      ...f,
      [key]: f[key].includes(id) ? f[key].filter(x => x !== id) : [...f[key], id],
    }))
  }

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-handle" />
        <div className="drawer-scroll">
          <div className="drawer-section">
            <h3 className="drawer-section-title">Tags</h3>
            <div className="drawer-chips">
              {TAGS.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  className={`chip chip--sm ${filters.tags.includes(tag.id) ? 'chip--active' : ''}`}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
          <div className="drawer-section">
            <h3 className="drawer-section-title">Price</h3>
            <div className="drawer-chips">
              {PRICES.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`chip ${filters.price.includes(p.id) ? 'chip--active' : ''}`}
                  onClick={() => toggleArray('price', p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="drawer-section">
            <h3 className="drawer-section-title">Reservation</h3>
            <div className="drawer-chips">
              {RESERVATIONS.map(r => (
                <button
                  key={r.id}
                  type="button"
                  className={`chip ${filters.reservation.includes(r.id) ? 'chip--active' : ''}`}
                  onClick={() => toggleArray('reservation', r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="drawer-footer">
          <button
            type="button"
            className="btn-ghost drawer-clear"
            onClick={() => setFilters(f => ({ ...f, tags: [], price: [], reservation: [] }))}
          >
            Clear all
          </button>
          <button type="button" className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </>
  )
}

/* ════════════════════════════════════════
   PEOPLE TAB
════════════════════════════════════════ */
function PeopleTab({ onViewUser, currentUserId, onGuestAction }) {
  const [query,        setQuery]        = useState('')
  const [results,      setResults]      = useState([])
  const [searching,    setSearching]    = useState(false)
  const [followStates, setFollowStates] = useState({})
  const [acting,       setActing]       = useState(new Set())

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setSearching(false); return }
    let cancelled = false
    setSearching(true)
    searchUsers(query).then(data => {
      if (!cancelled) { setResults(data); setSearching(false); setFollowStates({}) }
    })
    return () => { cancelled = true }
  }, [query])

  useEffect(() => {
    if (!currentUserId) return
    const channel = supabase
      .channel(`follows-accepted-${currentUserId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'follows', filter: `follower_id=eq.${currentUserId}` },
        payload => {
          const acceptedId = payload.new?.following_id
          if (acceptedId) setFollowStates(s => ({ ...s, [acceptedId]: 'following' }))
        })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [currentUserId])

  async function handleFollow(e, user) {
    e.stopPropagation()
    if (onGuestAction) { onGuestAction(); return }
    if (acting.has(user.id)) return
    setActing(s => new Set(s).add(user.id))
    const state = followStates[user.id] ?? 'none'
    try {
      if (state === 'following')       { await unfollowUser(user.id);        setFollowStates(s => ({ ...s, [user.id]: 'none' })) }
      else if (state === 'requested')  { await cancelFollowRequest(user.id); setFollowStates(s => ({ ...s, [user.id]: 'none' })) }
      else if (user.privacy_level === 'public') { await followUser(user.id); setFollowStates(s => ({ ...s, [user.id]: 'following' })) }
      else                             { await sendFollowRequest(user.id);   setFollowStates(s => ({ ...s, [user.id]: 'requested' })) }
    } catch (err) { console.error('[PeopleTab] follow:', err) }
    finally { setActing(s => { const n = new Set(s); n.delete(user.id); return n }) }
  }

  function followBtnContent(user) {
    if (acting.has(user.id)) return '…'
    const state = followStates[user.id] ?? 'none'
    if (state === 'following') return '✓'
    if (state === 'requested') return <HourglassIcon />
    return '+'
  }

  function followBtnClass(user) {
    const state = followStates[user.id] ?? 'none'
    if (state === 'following') return 'home-people-follow-btn home-people-follow-btn--following'
    if (state === 'requested') return 'home-people-follow-btn home-people-follow-btn--requested'
    return 'home-people-follow-btn'
  }

  return (
    <div className="home-people">
      <div className="home-people-search-wrap">
        <svg className="home-people-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          className="home-people-input"
          placeholder="Search by @username"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button className="home-people-clear" onClick={() => setQuery('')} aria-label="Clear">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>
      <div className="home-people-list">
        {searching && <p className="home-people-empty">Searching…</p>}
        {!searching && query.trim().length < 2 && <p className="home-people-empty">Type at least 2 characters to search</p>}
        {!searching && query.trim().length >= 2 && results.length === 0 && <p className="home-people-empty">No users found for "{query}"</p>}
        {!searching && results.map(user => (
          <div key={user.id} className="home-people-card" onClick={() => onViewUser?.(user.id)} style={{ cursor: 'pointer' }}>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name || user.username} className="home-people-avatar" />
            ) : (
              <div className="home-people-avatar home-people-avatar--placeholder">
                {(user.username || '?')[0].toUpperCase()}
              </div>
            )}
            <div className="home-people-info">
              <span className="home-people-name">{user.name || user.username}</span>
              <span className="home-people-meta">@{user.username}{user.home_city ? ` · ${user.home_city}` : ''}</span>
            </div>
            <span className="home-people-privacy" title={user.privacy_level}>
              {user.privacy_level === 'public' ? <GlobeIcon /> : <LockIconSmall />}
            </span>
            <button className={followBtnClass(user)} onClick={e => handleFollow(e, user)} disabled={acting.has(user.id)}>
              {followBtnContent(user)}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   RESULTS PANEL (Step 4)
════════════════════════════════════════ */
const RESULTS_TABS = [
  { id: 'mine',    label: 'My Places'      },
  { id: 'social',  label: 'Me + Following' },
  { id: 'explore', label: 'Explore'        },
]

function ResultsPanel({ mealTypes, experiences, location, filters, onBack, onGuestAction, onOpenPlace }) {
  const [activeTab,       setActiveTab]       = useState(onGuestAction ? 'explore' : 'mine')
  const [results,         setResults]         = useState([])
  const [loading,         setLoading]         = useState(true)
  const [savedToWishlist, setSavedToWishlist] = useState(new Set())
  const [savingWishlist,  setSavingWishlist]  = useState(new Set())
  const [drawerOpen,      setDrawerOpen]      = useState(false)
  const [localFilters,    setLocalFilters]    = useState(filters)

  const mealLabel = mealTypes.length === 1
    ? (MEAL_TYPES.find(m => m.id === mealTypes[0])?.label || mealTypes[0])
    : mealTypes.map(id => MEAL_TYPES.find(m => m.id === id)?.label || id).join(', ')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setResults([])
    const scope = activeTab === 'mine' ? 'mine' : activeTab === 'social' ? 'social' : 'all'
    searchPlaces({
      mealTypes,
      experiences,
      location,
      tags:        localFilters.tags,
      price:       localFilters.price,
      reservation: localFilters.reservation,
      scope,
    }).then(data => {
      if (!cancelled) { setResults(data); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [activeTab, JSON.stringify(mealTypes), JSON.stringify(experiences), location, localFilters])

  async function handleBookmark(place) {
    if (onGuestAction) { onGuestAction(); return }
    if (savedToWishlist.has(place.id) || savingWishlist.has(place.id)) return
    setSavingWishlist(prev => new Set(prev).add(place.id))
    try {
      await addPlaceToWishlist({ name: place.name, address: place.address, photo_url: place.photo_url })
      setSavedToWishlist(prev => new Set(prev).add(place.id))
    } catch (e) { console.error('[Home] addPlaceToWishlist:', e) }
    finally { setSavingWishlist(prev => { const s = new Set(prev); s.delete(place.id); return s }) }
  }

  const activeCount = [...localFilters.price, ...localFilters.reservation, ...localFilters.tags].filter(Boolean).length
  const vibeLabel   = experiences.length === 1
    ? EXP_LABELS[experiences[0]]
    : experiences.length > 1 ? `${experiences.length} vibes` : null

  return (
    <div className="home-results">
      {/* Header */}
      <div className="home-results-header">
        <button className="home-results-back" onClick={onBack} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div className="home-results-title-wrap">
          <h1 className="home-results-title">{mealLabel}</h1>
          <p className="home-results-subtitle">
            {!loading && `${results.length} place${results.length !== 1 ? 's' : ''}`}
            {location ? ` · ${location}` : ''}
            {vibeLabel ? ` · ${vibeLabel}` : ''}
            {activeCount > 0 ? ` · ${activeCount} filter${activeCount !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
        <button
          type="button"
          className={`results-filter-btn${activeCount > 0 ? ' results-filter-btn--active' : ''}`}
          onClick={() => setDrawerOpen(true)}
          aria-label="Filters"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="6" y2="6"/><line x1="8" x2="20" y1="12" y2="12"/><line x1="12" x2="20" y1="18" y2="18"/>
          </svg>
          {activeCount > 0 && <span className="results-filter-badge">{activeCount}</span>}
        </button>
      </div>

      {/* Scope tabs */}
      <div className="home-results-tabs">
        {RESULTS_TABS.filter(t => !onGuestAction || t.id === 'explore').map(tab => (
          <button
            key={tab.id}
            className={`home-results-tab${activeTab === tab.id ? ' home-results-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results list — Spotify-style rows */}
      <div className="home-results-list">
        {loading ? (
          <p className="home-results-empty">Loading…</p>
        ) : results.length === 0 ? (
          <p className="home-results-empty">No results found</p>
        ) : results.map(place => {
          const isSaved  = savedToWishlist.has(place.id)
          const isSaving = savingWishlist.has(place.id)
          const meta = [place.address, place.experience_type ? EXP_LABELS[place.experience_type] : null].filter(Boolean).join(' · ')
          return (
            <div
              key={place.id}
              className="home-result-row"
              onClick={() => onOpenPlace?.(place)}
              style={{ cursor: onOpenPlace ? 'pointer' : 'default' }}
            >
              <div className="home-result-info">
                <span className="home-result-name">{place.name}</span>
                {meta && <span className="home-result-meta">{meta}</span>}
              </div>
              <div className="home-result-right">
                {place.computed_score != null && (
                  <div className="home-result-score">
                    <span className="home-result-score-val">{place.computed_score}</span>
                    <span className="home-result-score-max">/25</span>
                  </div>
                )}
                <button
                  className={`home-result-bookmark${isSaved ? ' home-result-bookmark--saved' : ''}`}
                  onClick={e => { e.stopPropagation(); handleBookmark(place) }}
                  disabled={isSaving || isSaved}
                  aria-label={isSaved ? 'Saved' : 'Save'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24"
                    fill={isSaved ? '#C63B2F' : 'none'}
                    stroke={isSaved ? '#C63B2F' : 'currentColor'}
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    style={isSaving ? { opacity: 0.4 } : {}}
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={localFilters}
        setFilters={setLocalFilters}
      />
    </div>
  )
}

/* ════════════════════════════════════════
   HOME — main export
════════════════════════════════════════ */
export default function Home({ onSearch, onViewUser, currentUserId, onGuestAction, onOpenPlace, onOpenBestMatch }) {
  const [tab,           setTab]          = useState('places')
  const [step,          setStep]         = useState(1)
  const [selectedMeals, setSelectedMeals] = useState(() => new Set())
  const [selectedVibes, setSelectedVibes] = useState(() => new Set())
  const [location,      setLocation]     = useState('')
  const [showResults,   setShowResults]  = useState(false)
  const [filters,       setFilters]      = useState({ tags: [], price: [], reservation: [] })

  function toggleMeal(id) {
    setSelectedMeals(prev => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id); else s.add(id)
      return s
    })
  }

  function toggleVibe(id) {
    setSelectedVibes(prev => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id); else s.add(id)
      return s
    })
  }

  /* Results */
  if (showResults) {
    return (
      <ResultsPanel
        mealTypes={[...selectedMeals]}
        experiences={[...selectedVibes]}
        location={location}
        filters={filters}
        onBack={() => { setShowResults(false); setStep(1) }}
        onGuestAction={onGuestAction}
        onOpenPlace={onOpenPlace}
      />
    )
  }

  /* People tab */
  if (tab === 'people') {
    return (
      <div className="home-conv">
        <div className="conv-subtabs-people">
          <button className="conv-tab-dark" onClick={() => setTab('places')}>Places</button>
          <button className="conv-tab-dark conv-tab-dark--active">People</button>
        </div>
        <PeopleTab onViewUser={onViewUser} currentUserId={currentUserId} onGuestAction={onGuestAction} />
      </div>
    )
  }

  /* Conversational flow */
  function handleMealNext()  { if (selectedMeals.size > 0) setStep(2) }
  function handleVibeNext()  { setStep(3) }
  function handleVibeSkip()  { setSelectedVibes(new Set()); setStep(3) }
  function handleSearch()    { setShowResults(true); onSearch?.({ mealTypes: [...selectedMeals], location }) }
  function handleWhereSkip() { setLocation(''); setShowResults(true); onSearch?.({ mealTypes: [...selectedMeals], location: '' }) }

  return (
    <div className="home-conv">
      {step === 1 && (
        <MealStep
          selectedMeals={selectedMeals}
          onToggleMeal={toggleMeal}
          onNext={handleMealNext}
          onSwitchToPeople={() => setTab('people')}
          onOpenBestMatch={onOpenBestMatch}
        />
      )}
      {step === 2 && (
        <VibeStep
          selectedVibes={selectedVibes}
          onToggleVibe={toggleVibe}
          onNext={handleVibeNext}
          onSkip={handleVibeSkip}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <WhereStep
          location={location}
          onChangeLocation={setLocation}
          onSearch={handleSearch}
          onSkip={handleWhereSkip}
          onBack={() => setStep(2)}
          filters={filters}
          onChangeFilters={setFilters}
        />
      )}
    </div>
  )
}
