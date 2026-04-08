import { useState, useEffect, useRef } from 'react'
import { Zap, MessageCircle, Users, Star, Coffee, Croissant, Sunrise, Sun, Moon, GlassWater } from 'lucide-react'
import { addPlaceToWishlist, searchPlaces, searchUsers } from '../../lib/db'
import './Home.css'

const MEAL_TYPES = [
  { id: 'cafe',        label: 'Café',         Icon: Coffee     },
  { id: 'brunch',      label: 'Brunch',        Icon: Sunrise    },
  { id: 'lunch',       label: 'Lunch',         Icon: Sun        },
  { id: 'dinner',      label: 'Dinner',        Icon: Moon       },
  { id: 'bakery_deli', label: 'Bakery & Deli', Icon: Croissant  },
  { id: 'drinks',      label: 'Drinks',        Icon: GlassWater },
]

const EXPERIENCES = [
  { id: 'quick_light',     label: 'Quick & Light',      Icon: Zap           },
  { id: 'catchup',         label: 'Catch-up / Hangout', Icon: MessageCircle },
  { id: 'shared_table',    label: 'Shared Table',       Icon: Users         },
  { id: 'full_experience', label: 'Full Experience',    Icon: Star          },
]

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

function PlateLogo() {
  return (
    <div className="plate-logo-bare">
      {/* Left: bars + baseline */}
      <div className="plate-logo-mark">
        <svg className="plate-bars-svg" width="93" height="105" viewBox="0 0 93 105" fill="none">
          <rect className="plate-bar plate-bar--1" x="0"  y="55" width="18" height="50"  rx="9" fill="#3D4F7C" fillOpacity="0.40" />
          <rect className="plate-bar plate-bar--2" x="25" y="25" width="18" height="80"  rx="9" fill="#3D4F7C" fillOpacity="0.65" />
          <rect className="plate-bar plate-bar--3" x="50" y="0"  width="18" height="105" rx="9" fill="#3D4F7C" fillOpacity="1.00" />
          <rect className="plate-bar plate-bar--4" x="75" y="35" width="18" height="70"  rx="9" fill="#3D4F7C" fillOpacity="0.65" />
        </svg>
        <div className="plate-baseline" />
      </div>
      {/* Right: wordmark + tagline */}
      <div className="plate-logo-text">
        <div className="plate-wordmark">PLATE</div>
        <div className="plate-tagline">discover · rate · share</div>
      </div>
    </div>
  )
}

function MealCard({ item, active, onClick }) {
  const { Icon } = item
  return (
    <div
      className={`meal-card ${active ? 'meal-card--active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <Icon size={20} strokeWidth={1.5} className="meal-card-icon" />
      <span className="meal-card-label">{item.label}</span>
    </div>
  )
}

/* ── Filters drawer (no Core Experience — it lives on the main screen) ── */
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
      <div className="drawer" dir="rtl">
        <div className="drawer-handle" />

        <div className="drawer-scroll">
          {/* Tags */}
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

          {/* Price */}
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

          {/* Reservation */}
          <div className="drawer-section">
            <h3 className="drawer-section-title">Need Reservation</h3>
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

/* ── People tab ── */
function PeopleTab() {
  const [query,     setQuery]     = useState('')
  const [results,   setResults]   = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setSearching(false)
      return
    }
    let cancelled = false
    setSearching(true)
    searchUsers(query).then(data => {
      if (!cancelled) {
        setResults(data)
        setSearching(false)
      }
    })
    return () => { cancelled = true }
  }, [query])

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
        {searching && (
          <p className="home-people-empty">Searching…</p>
        )}
        {!searching && query.trim().length < 2 && (
          <p className="home-people-empty">Type at least 2 characters to search</p>
        )}
        {!searching && query.trim().length >= 2 && results.length === 0 && (
          <p className="home-people-empty">No users found for "{query}"</p>
        )}
        {!searching && results.map(user => (
          <div key={user.id} className="home-people-card">
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
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Search results panel ── */
const RESULTS_TABS = [
  { id: 'mine',    label: 'My Places'      },
  { id: 'social',  label: 'Me + Following' },
  { id: 'explore', label: 'Explore'        },
]

const EXP_LABELS = {
  quick_light:     'Quick & Light',
  catchup:         'Catch-up / Hangout',
  shared_table:    'Shared Table',
  full_experience: 'Full Experience',
}

function ResultsPanel({ mealType, location, filters, onBack }) {
  const [activeTab,       setActiveTab]       = useState('mine')
  const [results,         setResults]         = useState([])
  const [loading,         setLoading]         = useState(true)
  const [savedToWishlist, setSavedToWishlist] = useState(new Set())
  const [savingWishlist,  setSavingWishlist]  = useState(new Set())

  const mealLabel = MEAL_TYPES.find(m => m.id === mealType)?.label || ''

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setResults([])

    const scope = activeTab === 'mine'   ? 'mine'
                : activeTab === 'social' ? 'social'
                : 'all'

    searchPlaces({
      mealType,
      experience:  filters.experience,
      location,
      tags:        filters.tags,
      price:       filters.price,
      reservation: filters.reservation,
      scope,
    }).then(data => {
      if (!cancelled) {
        setResults(data)
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [activeTab, mealType, location, filters])

  async function handleBookmark(place) {
    if (savedToWishlist.has(place.id) || savingWishlist.has(place.id)) return
    setSavingWishlist(prev => new Set(prev).add(place.id))
    try {
      await addPlaceToWishlist({ name: place.name, address: place.address, photo_url: place.photo_url })
      setSavedToWishlist(prev => new Set(prev).add(place.id))
    } catch (e) {
      console.error('[Home] addPlaceToWishlist:', e)
    } finally {
      setSavingWishlist(prev => { const s = new Set(prev); s.delete(place.id); return s })
    }
  }

  return (
    <div className="home-results" dir="rtl">
      {/* Back + title */}
      <div className="home-results-header">
        <button className="home-results-back" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
        <div className="home-results-title-wrap">
          <span className="home-results-title">{mealLabel}</span>
          {!loading && (
            <span className="home-results-count">{results.length} place{results.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* 3-way selector */}
      <div className="home-results-tabs">
        {RESULTS_TABS.map(tab => (
          <button
            key={tab.id}
            className={`home-results-tab${activeTab === tab.id ? ' home-results-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'explore' && <span className="home-results-tab-sub"> · כולם</span>}
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
            <div key={place.id} className="home-result-card">
              {place.photo_url && (
                <img src={place.photo_url} alt={place.name} className="home-result-img" />
              )}
              <div className="home-result-body">
                <span className="home-result-name">{place.name}</span>
                <span className="home-result-addr">{place.address}</span>
                {place.experience_type && (
                  <span className="home-result-exp">{EXP_LABELS[place.experience_type]}</span>
                )}
              </div>
              {place.computed_score != null && (
                <div className="home-result-score">
                  <span className="home-result-score-val">{place.computed_score}</span>
                  <span className="home-result-score-max">/25</span>
                </div>
              )}
              <button
                className={`home-result-bookmark${isSaved ? ' home-result-bookmark--saved' : ''}`}
                onClick={() => handleBookmark(place)}
                disabled={isSaving || isSaved}
                aria-label={isSaved ? 'Saved to Wishlist' : 'Add to Wishlist'}
              >
                {isSaving ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24"
                    fill={isSaved ? 'var(--color-accent)' : 'none'}
                    stroke={isSaved ? 'var(--color-accent)' : 'currentColor'}
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Home({ onSearch }) {
  const [tab,         setTab]         = useState('places')
  const [mealType,    setMealType]    = useState(null)
  const [location,    setLocation]    = useState('')
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [expTooltip,  setExpTooltip]  = useState(false)
  const [filters, setFilters] = useState({
    experience:  null,
    tags:        [],
    price:       [],
    reservation: [],
  })
  const scrollRef = useRef(null)

  const activeCount = [
    filters.experience,
    ...filters.price,
    ...filters.reservation,
    ...filters.tags,
  ].filter(Boolean).length

  function handleSearch() {
    if (!mealType) return
    setShowResults(true)
    onSearch?.({ mealType, location, ...filters })
  }

  if (showResults) {
    return (
      <ResultsPanel
        mealType={mealType}
        location={location}
        filters={filters}
        onBack={() => setShowResults(false)}
      />
    )
  }

  return (
    <div className="home">
      {/* Logo — fixed at top, never scrolls */}
      <div className="home-header">
        <PlateLogo />
      </div>

      {/* Sub-tabs */}
      <div className="home-subtabs">
        <button
          className={`home-subtab ${tab === 'places' ? 'home-subtab--active' : ''}`}
          onClick={() => setTab('places')}
        >Places</button>
        <button
          className={`home-subtab ${tab === 'people' ? 'home-subtab--active' : ''}`}
          onClick={() => setTab('people')}
        >People</button>
      </div>

      {/* People tab */}
      {tab === 'people' && <PeopleTab />}

      {/* Places tab — middle content + pinned CTA */}
      {tab === 'places' && (
        <div className="home-places-layout">

          {/* Scrollable middle content */}
          <div className="home-places-body">

            {/* Meal type */}
            <div className="meal-strip-wrap">
              <div className="meal-strip" ref={scrollRef}>
                {MEAL_TYPES.map(item => (
                  <MealCard
                    key={item.id}
                    item={item}
                    active={mealType === item.id}
                    onClick={() => setMealType(prev => prev === item.id ? null : item.id)}
                  />
                ))}
              </div>
            </div>

            {/* Core Experience */}
            <div className="home-section">
              <div className="exp-label-row">
                <button
                  className="exp-info-dot"
                  onClick={() => setExpTooltip(t => !t)}
                  aria-label="What is Core Experience?"
                >●</button>
                <span className="exp-label-editorial">Core Experience</span>
                {expTooltip && (
                  <div className="exp-tooltip" role="tooltip">
                    The mood and purpose of your visit — not just what you eat, but how you want to feel.
                    <button className="exp-tooltip-close" onClick={() => setExpTooltip(false)} aria-label="Close">×</button>
                  </div>
                )}
              </div>
              <div className="exp-strip-wrap">
                <div className="exp-strip">
                  {EXPERIENCES.map(({ id, label, Icon }) => (
                    <div
                      key={id}
                      className={`exp-card${filters.experience === id ? ' exp-card--active' : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => setFilters(f => ({ ...f, experience: f.experience === id ? null : id }))}
                      onKeyDown={e => e.key === 'Enter' && setFilters(f => ({ ...f, experience: f.experience === id ? null : id }))}
                    >
                      <Icon size={18} strokeWidth={1.5} className="exp-card-icon" />
                      <span className="exp-card-label">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="home-section">
              <label className="field-label">Location</label>
              <div className="location-wrap">
                <svg className="location-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <input
                  className="field-input location-input"
                  type="text"
                  placeholder="City, neighborhood, street…"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
            </div>

            {/* More filters */}
            <div className="home-section home-more-row">
              <button
                type="button"
                className={`more-btn ${activeCount > 0 ? 'more-btn--active' : ''}`}
                onClick={() => setDrawerOpen(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" x2="20" y1="6" y2="6"/><line x1="8" x2="20" y1="12" y2="12"/><line x1="12" x2="20" y1="18" y2="18"/>
                </svg>
                More Filters
                {activeCount > 0 && <span className="more-btn-badge">{activeCount}</span>}
              </button>
              {activeCount > 0 && (
                <div className="active-filters-preview">
                  {filters.experience && (
                    <span className="active-filter-chip">
                      {EXPERIENCES.find(e => e.id === filters.experience)?.label}
                    </span>
                  )}
                  {filters.price.map(p => (
                    <span key={p} className="active-filter-chip">
                      {PRICES.find(pr => pr.id === p)?.label}
                    </span>
                  ))}
                  {filters.tags.slice(0, 2).map(t => (
                    <span key={t} className="active-filter-chip">
                      {TAGS.find(tag => tag.id === t)?.label}
                    </span>
                  ))}
                  {(filters.tags.length + filters.reservation.length) > 2 && (
                    <span className="active-filter-chip">
                      +{filters.tags.length + filters.reservation.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>

          </div>{/* end home-places-body */}

          {/* Search CTA — pinned to bottom */}
          <div className="home-cta">
            <button
              type="button"
              className="search-btn"
              disabled={!mealType}
              onClick={handleSearch}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Search
            </button>
            {!mealType && (
              <p className="search-hint">Select a meal type to continue</p>
            )}
          </div>

        </div>
      )}{/* end places tab */}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  )
}
