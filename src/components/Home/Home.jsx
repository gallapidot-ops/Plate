import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Zap, MessageCircle, Users, Star, Coffee, Croissant, Sunrise, Sun, Moon, GlassWater } from 'lucide-react'
import { addPlaceToWishlist, searchPlaces, searchUsers, followUser, unfollowUser, sendFollowRequest, cancelFollowRequest } from '../../lib/db'
import './Home.css'

/* ── Data ── */

const MEAL_TYPES = [
  { id: 'cafe',        label: 'Café',         subtitle: 'morning · slow · coffee',          Icon: Coffee     },
  { id: 'brunch',      label: 'Brunch',        subtitle: 'eggs · late start · weekends',     Icon: Sunrise    },
  { id: 'lunch',       label: 'Lunch',         subtitle: 'midday · fresh · sit-down',        Icon: Sun        },
  { id: 'dinner',      label: 'Dinner',        subtitle: 'evening · full meal · candlelit',  Icon: Moon       },
  { id: 'bakery_deli', label: 'Bakery & Deli', subtitle: 'pastry · fresh bread · grab & go', Icon: Croissant  },
  { id: 'drinks',      label: 'Drinks',        subtitle: 'cocktails · wine · evening',       Icon: GlassWater },
]

const EXPERIENCES = [
  { id: 'quick_light',     label: 'Quick & Light',    subtitle: 'fast · solo · on the move',   Icon: Zap           },
  { id: 'catchup',         label: 'Catch-up',          subtitle: 'friends · chill · good chat', Icon: MessageCircle },
  { id: 'shared_table',    label: 'Shared Table',      subtitle: 'group · feast · together',    Icon: Users         },
  { id: 'full_experience', label: 'Full Experience',   subtitle: 'occasion · slow · memorable', Icon: Star          },
]

const EXP_LABELS = {
  quick_light:     'Quick & Light',
  catchup:         'Catch-up / Hangout',
  shared_table:    'Shared Table',
  full_experience: 'Full Experience',
}

const TAGS = [
  { id: 'kosher',         label: 'Kosher'         },
  { id: 'pet_friendly',   label: 'Pet Friendly'   },
  { id: 'celebration',    label: 'Celebration'    },
  { id: 'date',           label: 'Date Night'     },
  { id: 'business',       label: 'Business'       },
  { id: 'healthy',        label: 'Healthy'        },
  { id: 'brunch_buffet',  label: 'Brunch Buffet'  },
  { id: 'large_group',    label: 'Large Group 6+' },
  { id: 'nice_view',      label: 'Nice View'      },
  { id: 'outdoor',        label: 'Outdoor'        },
  { id: 'vegan',          label: 'Vegan'          },
  { id: 'work_friendly',  label: 'Work-Friendly'  },
  { id: 'romantic',       label: 'Romantic'       },
  { id: 'group_friendly', label: 'Group Friendly' },
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

/* ── Swipe hook ── */
function useSwipe(onNext, onPrev) {
  const startX = useRef(null)
  return {
    onTouchStart: e => { startX.current = e.touches[0].clientX },
    onTouchEnd: e => {
      if (startX.current === null) return
      const dx = e.changedTouches[0].clientX - startX.current
      if (dx < -50) onNext()
      else if (dx > 50) onPrev()
      startX.current = null
    },
  }
}

/* ── Arrow SVGs ── */
function ChevronLeft() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  )
}
function ChevronRight() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  )
}

/* ════════════════════════════════════════
   STEP 1 — Meal Type  (red background)
════════════════════════════════════════ */
function MealStep({ mealIndex, onChangeMeal, onNext, onSwitchToPeople }) {
  const n    = MEAL_TYPES.length
  const meal = MEAL_TYPES[mealIndex]
  const swipe = useSwipe(
    () => onChangeMeal((mealIndex + 1) % n),
    () => onChangeMeal((mealIndex - 1 + n) % n),
  )

  return (
    <div className="conv-step conv-step--meal" {...swipe}>
      {/* Sub-tabs */}
      <div className="conv-tabs">
        <button className="conv-tab conv-tab--active">Places</button>
        <button className="conv-tab" onClick={onSwitchToPeople}>People</button>
      </div>

      {/* Centered meal selector */}
      <div className="conv-center">
        <div className="conv-arrows-row">
          <button
            className="conv-arrow"
            onClick={() => onChangeMeal((mealIndex - 1 + n) % n)}
            aria-label="Previous meal type"
          >
            <ChevronLeft />
          </button>

          <div className="conv-card-content">
            <h1 className="conv-card-name">{meal.label}</h1>
            <p className="conv-card-subtitle">{meal.subtitle}</p>
          </div>

          <button
            className="conv-arrow"
            onClick={() => onChangeMeal((mealIndex + 1) % n)}
            aria-label="Next meal type"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="conv-dots">
        {MEAL_TYPES.map((_, i) => (
          <button
            key={i}
            className={`conv-dot${i === mealIndex ? ' conv-dot--active' : ''}`}
            onClick={() => onChangeMeal(i)}
            aria-label={`Select ${MEAL_TYPES[i].label}`}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="conv-footer">
        <button className="conv-btn conv-btn--dark" onClick={onNext}>
          This one →
        </button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   STEP 2 — Vibe  (sea-blue background)
════════════════════════════════════════ */
function VibeStep({ vibeIdx, onChangeVibe, onNext, onSkip, onBack }) {
  const n    = EXPERIENCES.length
  const exp  = EXPERIENCES[vibeIdx]
  const swipe = useSwipe(
    () => onChangeVibe((vibeIdx + 1) % n),
    () => onChangeVibe((vibeIdx - 1 + n) % n),
  )

  return (
    <div className="conv-step conv-step--vibe" {...swipe}>
      <div className="conv-top-row">
        <button className="conv-back" onClick={onBack} aria-label="Back">←</button>
        <button className="conv-skip" onClick={onSkip}>Skip</button>
      </div>

      <div className="conv-center">
        <p className="conv-question">What's the vibe?</p>

        <div className="conv-arrows-row">
          <button
            className="conv-arrow"
            onClick={() => onChangeVibe((vibeIdx - 1 + n) % n)}
            aria-label="Previous vibe"
          >
            <ChevronLeft />
          </button>

          <div className="conv-card-content">
            <h1 className="conv-card-name">{exp.label}</h1>
            <p className="conv-card-subtitle">{exp.subtitle}</p>
          </div>

          <button
            className="conv-arrow"
            onClick={() => onChangeVibe((vibeIdx + 1) % n)}
            aria-label="Next vibe"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="conv-dots">
        {EXPERIENCES.map((_, i) => (
          <button
            key={i}
            className={`conv-dot${i === vibeIdx ? ' conv-dot--active' : ''}`}
            onClick={() => onChangeVibe(i)}
          />
        ))}
      </div>

      <div className="conv-footer">
        <button className="conv-btn conv-btn--dark" onClick={onNext}>
          Next →
        </button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   STEP 3 — Where  (cream background)
════════════════════════════════════════ */
function WhereStep({ location, onChangeLocation, onSearch, onSkip, onBack }) {
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
      </div>

      <div className="conv-footer">
        <button className="conv-btn conv-btn--red" onClick={onSearch}>
          Search →
        </button>
      </div>
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
            Close
          </button>
        </div>
      </div>
    </>
  )
}

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

function ResultsPanel({ mealType, location, filters, onBack, onGuestAction, onOpenPlace }) {
  const [activeTab,       setActiveTab]       = useState(onGuestAction ? 'explore' : 'mine')
  const [results,         setResults]         = useState([])
  const [loading,         setLoading]         = useState(true)
  const [savedToWishlist, setSavedToWishlist] = useState(new Set())
  const [savingWishlist,  setSavingWishlist]  = useState(new Set())
  const [drawerOpen,      setDrawerOpen]      = useState(false)
  const [localFilters,    setLocalFilters]    = useState(filters)

  const mealLabel = MEAL_TYPES.find(m => m.id === mealType)?.label || ''

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setResults([])
    const scope = activeTab === 'mine' ? 'mine' : activeTab === 'social' ? 'social' : 'all'
    searchPlaces({
      mealType,
      experience:  localFilters.experience,
      location,
      tags:        localFilters.tags,
      price:       localFilters.price,
      reservation: localFilters.reservation,
      scope,
    }).then(data => {
      if (!cancelled) { setResults(data); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [activeTab, mealType, location, localFilters])

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

  const activeCount = [localFilters.experience, ...localFilters.price, ...localFilters.reservation, ...localFilters.tags].filter(Boolean).length

  return (
    <div className="home-results">
      {/* Header */}
      <div className="home-results-header">
        <button className="home-results-back" onClick={onBack} aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div className="home-results-title-wrap">
          <span className="home-results-title">{mealLabel}</span>
          {!loading && <span className="home-results-count">{results.length} place{results.length !== 1 ? 's' : ''}</span>}
        </div>
        <button
          type="button"
          className={`results-filter-btn${activeCount > 0 ? ' results-filter-btn--active' : ''}`}
          onClick={() => setDrawerOpen(true)}
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

      {/* Results list */}
      <div className="home-results-list">
        {loading ? (
          <p className="home-results-empty">Loading…</p>
        ) : results.length === 0 ? (
          <p className="home-results-empty">No results found</p>
        ) : results.map(place => {
          const isSaved  = savedToWishlist.has(place.id)
          const isSaving = savingWishlist.has(place.id)
          return (
            <div
              key={place.id}
              className="home-result-card"
              onClick={() => onOpenPlace?.(place)}
              style={{ cursor: onOpenPlace ? 'pointer' : 'default' }}
            >
              <div className="home-result-body">
                <div className="home-result-top-row">
                  <span className="home-result-name">{place.name}</span>
                  {place.computed_score != null && (
                    <div className="home-result-score">
                      <span className="home-result-score-val">{place.computed_score}</span>
                      <span className="home-result-score-max">/25</span>
                    </div>
                  )}
                </div>
                <span className="home-result-addr">{place.address}</span>
                {place.experience_type && (
                  <span className="home-result-exp">{EXP_LABELS[place.experience_type]}</span>
                )}
              </div>
              <button
                className={`home-result-bookmark${isSaved ? ' home-result-bookmark--saved' : ''}`}
                onClick={e => { e.stopPropagation(); handleBookmark(place) }}
                disabled={isSaving || isSaved}
                aria-label={isSaved ? 'Saved' : 'Save to Wishlist'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24"
                  fill={isSaved ? 'var(--color-accent)' : 'none'}
                  stroke={isSaved ? 'var(--color-accent)' : 'currentColor'}
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  style={isSaving ? { opacity: 0.4 } : {}}
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
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
export default function Home({ onSearch, onViewUser, currentUserId, onGuestAction, onOpenPlace }) {
  const [tab,          setTab]         = useState('places') // 'places' | 'people'
  const [step,         setStep]        = useState(1)        // 1 | 2 | 3
  const [mealIndex,    setMealIndex]   = useState(0)
  const [vibeIdx,      setVibeIdx]     = useState(0)
  const [vibeSelected, setVibeSelected] = useState(false)
  const [location,     setLocation]    = useState('')
  const [showResults,  setShowResults] = useState(false)
  const [filters,      setFilters]     = useState({ experience: null, tags: [], price: [], reservation: [] })

  /* Results */
  if (showResults) {
    const experience = vibeSelected ? EXPERIENCES[vibeIdx].id : null
    return (
      <ResultsPanel
        mealType={MEAL_TYPES[mealIndex].id}
        location={location}
        filters={{ ...filters, experience }}
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
  function handleMealNext()  { setStep(2) }
  function handleVibeNext()  { setVibeSelected(true);  setStep(3) }
  function handleVibeSkip()  { setVibeSelected(false); setStep(3) }
  function handleSearch()    { setShowResults(true); onSearch?.({ mealType: MEAL_TYPES[mealIndex].id, location }) }
  function handleWhereSkip() { setLocation(''); setShowResults(true); onSearch?.({ mealType: MEAL_TYPES[mealIndex].id, location: '' }) }

  return (
    <div className="home-conv">
      {step === 1 && (
        <MealStep
          mealIndex={mealIndex}
          onChangeMeal={setMealIndex}
          onNext={handleMealNext}
          onSwitchToPeople={() => setTab('people')}
        />
      )}
      {step === 2 && (
        <VibeStep
          vibeIdx={vibeIdx}
          onChangeVibe={setVibeIdx}
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
        />
      )}
    </div>
  )
}
