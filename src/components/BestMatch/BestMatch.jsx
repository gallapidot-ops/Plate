import { useState, useRef } from 'react'
import { autocomplete, getPlaceDetails, checkOpenNow } from '../../lib/places'
import { getPlacesForDiscovery } from '../../lib/db'
import './BestMatch.css'

/* ── Options ── */
const MEAL_OPTIONS = [
  { key: 'cafe',        keys: ['cafe'],                         label: 'Café'          },
  { key: 'brunch',      keys: ['brunch'],                       label: 'Brunch'        },
  { key: 'lunch',       keys: ['lunch'],                        label: 'Lunch'         },
  { key: 'dinner',      keys: ['dinner'],                       label: 'Dinner'        },
  { key: 'bakery_deli', keys: ['bakery', 'deli', 'bakery_deli'],label: 'Bakery & Deli' },
  { key: 'drinks',      keys: ['drinks'],                       label: 'Drinks'        },
]

const VIBE_OPTIONS = [
  { id: 'quick_light',     label: 'Quick & Light'  },
  { id: 'catchup',         label: 'Catch-up'       },
  { id: 'shared_table',    label: 'Shared Table'   },
  { id: 'full_experience', label: 'Full Experience' },
]

const WALK_OPTIONS = [
  { value: 5,  label: '5',   sublabel: 'min walk', hint: 'up to 0.4 km', km: 0.4  },
  { value: 10, label: '10',  sublabel: 'min walk', hint: 'up to 0.8 km', km: 0.8  },
  { value: 15, label: '15',  sublabel: 'min walk', hint: 'up to 1.2 km', km: 1.2  },
  { value: 20, label: 'Any', sublabel: '',          hint: 'no limit',     km: 9999 },
]

const DRIVE_OPTIONS = [
  { value: 5,  label: '5 min',   km: 2.0  },
  { value: 10, label: '10 min',  km: 4.0  },
  { value: 15, label: '15 min',  km: 8.0  },
  { value: 20, label: '20+ min', km: 25.0 },
]

const EMPTY_QUIPS = [
  "Wow, you're tough to please. Even Gordon Ramsay would approve.",
  "Zero matches. You might be a food critic in disguise.",
  "Nothing? Bold move. The city's finest — all skipped by you.",
]

/* ── Haversine straight-line distance (km) ── */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

/* ── Format distance: "X min walk" up to 20 min, then "X.X km away" ── */
function formatDistance(km) {
  if (!km || km <= 0) return ''
  const mins = Math.round(km / 0.08) // ~4.8 km/h walking pace
  if (mins <= 20) return `${mins} min walk`
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km away`
}

/* ── Trim address to "Street, City" — drop postal code and country ── */
function formatAddress(addr) {
  if (!addr) return ''
  return addr.split(',').map(p => p.trim()).slice(0, 2).join(', ')
}

/* ══════════════════════════════════════
   SWIPE CARD
══════════════════════════════════════ */
function SwipeCard({ place, onSwipe, isTop, isNext, dragDx, userLoc }) {
  const startX = useRef(null)
  const startY = useRef(null)
  const [dx, setDx]         = useState(0)
  const [dy, setDy]         = useState(0)
  const [dragging, setDragging] = useState(false)
  const [exiting, setExiting]   = useState(null) // 'left' | 'right'

  const rotation    = dx * 0.065
  const likeOpacity = Math.min(1, Math.max(0, dx / 65))
  const nopeOpacity = Math.min(1, Math.max(0, -dx / 65))

  function onTouchStart(e) {
    if (!isTop || exiting) return
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    setDragging(true)
  }

  function onTouchMove(e) {
    if (!isTop || startX.current === null) return
    setDx(e.touches[0].clientX - startX.current)
    setDy((e.touches[0].clientY - startY.current) * 0.18)
  }

  function onTouchEnd() {
    if (!isTop || startX.current === null) return
    const finalDx = dx
    setDragging(false)
    if (Math.abs(finalDx) > 80) {
      const dir = finalDx > 0 ? 'right' : 'left'
      setExiting(dir)
      setTimeout(() => {
        onSwipe(dir)
        setDx(0); setDy(0); setExiting(null)
      }, 320)
    } else {
      setDx(0); setDy(0)
    }
    startX.current = null
  }

  let transform, transition
  if (exiting) {
    const tx = exiting === 'right' ? '130vw' : '-130vw'
    const rot = exiting === 'right' ? 22 : -22
    transform  = `translate(${tx}, ${dy}px) rotate(${rot}deg)`
    transition = 'transform 0.32s ease'
  } else if (dragging) {
    transform  = `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`
    transition = 'none'
  } else {
    transform  = `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`
    transition = 'transform 0.25s'
  }

  if (isNext) {
    const progress = Math.min(1, Math.abs(dragDx) / 100)
    const scale = 0.94 + progress * 0.06
    return (
      <div
        className="bm-card bm-card--next"
        style={{ transform: `scale(${scale}) translateY(14px)`, transition: 'transform 0.15s' }}
      >
        <CardInner place={place} likeOpacity={0} nopeOpacity={0} userLoc={userLoc} />
      </div>
    )
  }

  return (
    <div
      className="bm-card bm-card--top"
      style={{ transform, transition }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <CardInner place={place} likeOpacity={likeOpacity} nopeOpacity={nopeOpacity} userLoc={userLoc} />
    </div>
  )
}

function CardInner({ place, likeOpacity, nopeOpacity, userLoc }) {
  const distKm = (userLoc?.lat && userLoc?.lng && place.lat && place.lng)
    ? haversineKm(userLoc.lat, userLoc.lng, place.lat, place.lng)
    : null

  return (
    <>
      {place.photo_url
        ? <img src={place.photo_url} alt={place.name} className="bm-card-photo" />
        : <div className="bm-card-photo-placeholder" />
      }
      <div className="bm-card-overlay" />

      {/* Hours unknown indicator */}
      {place.hoursUnknown && (
        <div className="bm-card-hours-unknown">hours unknown</div>
      )}

      {/* SAVE / SKIP badges */}
      <div className="bm-badge bm-badge--save" style={{ opacity: likeOpacity }}>SAVE</div>
      <div className="bm-badge bm-badge--skip" style={{ opacity: nopeOpacity }}>SKIP</div>

      {/* Content */}
      <div className="bm-card-content">
        <div className="bm-card-score-row">
          <span className="bm-card-score">{place.computed_score}</span>
          <span className="bm-card-score-max">/25</span>
        </div>
        <h2 className="bm-card-name">{place.name}</h2>
        <p className="bm-card-addr">{formatAddress(place.address)}</p>
        {distKm !== null && (
          <p className="bm-card-dist">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px', opacity: 0.75 }}>
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {formatDistance(distKm)}
          </p>
        )}
      </div>
    </>
  )
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function BestMatch({ onClose, onOpenPlace }) {
  // step: 'location' | 'distance' | 'prefs' | 'loading' | 'swipe' | 'results'
  const [step, setStep] = useState('location')

  /* Step 1 — location */
  const [locQuery,  setLocQuery]  = useState('')
  const [locSugg,   setLocSugg]   = useState([])
  const [location,  setLocation]  = useState(null) // { name, lat, lng }
  const locTimer = useRef(null)

  /* Step 2 — distance */
  const [walkMins,    setWalkMins]    = useState(10)
  const [travelMode,  setTravelMode]  = useState('walk') // 'walk' | 'drive'

  /* Step 3 — preferences */
  const [selMeals,       setSelMeals]       = useState(() => new Set())
  const [selVibes,       setSelVibes]       = useState(() => new Set())
  const [openNowFilter,  setOpenNowFilter]  = useState(false)
  const [loadErr,        setLoadErr]        = useState(null)

  /* Step 4 — swipe */
  const [cards,   setCards]   = useState([])
  const [idx,     setIdx]     = useState(0)
  const [maybe,   setMaybe]   = useState([])
  const [history, setHistory] = useState([]) // [{idx, dir, place}]
  const [topDx,   setTopDx]   = useState(0)  // shared dx for next-card scale effect

  /* ── Location autocomplete ── */
  function handleLocInput(e) {
    const q = e.target.value
    setLocQuery(q)
    setLocation(null)
    clearTimeout(locTimer.current)
    if (q.length < 2) { setLocSugg([]); return }
    locTimer.current = setTimeout(async () => {
      setLocSugg(await autocomplete(q))
    }, 300)
  }

  async function handleSelectLoc(sug) {
    setLocQuery(sug.mainText || sug.name)
    setLocSugg([])
    const details = await getPlaceDetails(sug.placeId)
    if (details?.lat && details?.lng) {
      setLocation({ name: sug.mainText || sug.name, lat: details.lat, lng: details.lng })
    }
  }

  /* ── Fetch + filter + open-now check ── */
  async function startSwipe() {
    setStep('loading')
    setLoadErr(null)
    try {
      const mealKeys = selMeals.size > 0
        ? [...selMeals].flatMap(key => MEAL_OPTIONS.find(m => m.key === key)?.keys ?? [key])
        : []
      const vibeKeys = [...selVibes]

      const all    = await getPlacesForDiscovery({ mealTypes: mealKeys, experienceTypes: vibeKeys })
      const opts   = travelMode === 'drive' ? DRIVE_OPTIONS : WALK_OPTIONS
      const maxKm  = opts.find(w => w.value === walkMins)?.km ?? 0.65

      const nearby = all.filter(p => {
        if (!p.lat || !p.lng) return false
        return haversineKm(location.lat, location.lng, p.lat, p.lng) <= maxKm
      })

      // Optionally check open-now status (only when toggle is ON)
      let filtered
      if (openNowFilter) {
        const toCheck = nearby.slice(0, 20)
        const withOpenStatus = await Promise.all(
          toCheck.map(async p => {
            const openNow = p.google_place_id ? await checkOpenNow(p.google_place_id) : null
            return { ...p, openNow, hoursUnknown: openNow === null }
          })
        )
        // Keep open + hours-unknown; drop confirmed-closed
        filtered = withOpenStatus.filter(p => p.openNow !== false)
      } else {
        filtered = nearby.map(p => ({ ...p, hoursUnknown: false }))
      }

      setCards(filtered.slice(0, 10))
      setIdx(0)
      setMaybe([])
      setHistory([])
      setStep('swipe')
    } catch (e) {
      setLoadErr(e.message)
      setStep('prefs')
    }
  }

  /* ── Swipe action ── */
  function handleSwipe(dir) {
    const place = cards[idx]
    if (!place) return
    if (dir === 'right') setMaybe(prev => [...prev, place])
    setHistory(prev => [...prev.slice(-9), { idx, dir, place }])
    setTopDx(0)
    if (idx + 1 >= cards.length) setStep('results')
    else setIdx(i => i + 1)
  }

  /* ── Undo ── */
  function handleUndo() {
    if (history.length === 0) return
    const last = history[history.length - 1]
    setHistory(prev => prev.slice(0, -1))
    setIdx(last.idx)
    if (last.dir === 'right') setMaybe(prev => prev.filter(p => p.id !== last.place.id))
  }

  /* ── Toggle helpers ── */
  function toggleMeal(key) {
    setSelMeals(prev => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s })
  }
  function toggleVibe(id) {
    setSelVibes(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  const quip = EMPTY_QUIPS[Math.floor(Math.random() * EMPTY_QUIPS.length)]
  const distOptions = travelMode === 'drive' ? DRIVE_OPTIONS : WALK_OPTIONS

  /* ══════════════ RENDERS ══════════════ */

  /* ── Step 1: Location ── */
  if (step === 'location') return (
    <div className="bm-screen bm-screen--location">
      <div className="bm-header">
        <button className="bm-close-btn" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
        <span className="bm-step-dot">1 / 2</span>
      </div>
      <div className="bm-body">
        {/* Decorative pin icon circle */}
        <div className="bm-loc-pin-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <h1 className="bm-title">Where are you?</h1>
        <p className="bm-sub">We'll find the best places near you</p>
        <div className="bm-loc-wrap">
          <svg className="bm-loc-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <input
            className="bm-loc-input"
            type="text"
            placeholder="Address, landmark, neighborhood…"
            value={locQuery}
            onChange={handleLocInput}
            autoFocus
          />
          {locQuery && (
            <button className="bm-loc-clear" onClick={() => { setLocQuery(''); setLocSugg([]); setLocation(null) }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
        {locSugg.length > 0 && (
          <ul className="bm-sugg-list">
            {locSugg.slice(0, 5).map(s => (
              <li key={s.placeId} className="bm-sugg-item" onMouseDown={() => handleSelectLoc(s)}>
                <span className="bm-sugg-main">{s.mainText}</span>
                {s.secondaryText && <span className="bm-sugg-sec">{s.secondaryText}</span>}
              </li>
            ))}
          </ul>
        )}
        {location && (
          <div className="bm-loc-confirmed">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            <span>{location.name}</span>
          </div>
        )}
      </div>
      <div className="bm-footer">
        <button className="bm-btn-primary" onClick={() => setStep('distance')} disabled={!location}>
          Next →
        </button>
      </div>
    </div>
  )

  /* ── Step 2: Distance ── */
  if (step === 'distance') return (
    <div className="bm-screen bm-screen--distance">
      <div className="bm-header">
        <button className="bm-back-btn" onClick={() => setStep('location')} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span className="bm-step-dot">2 / 2</span>
      </div>
      <div className="bm-body">
        {/* Clock icon circle */}
        <div className="bm-dist-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <h1 className="bm-title">How far are you willing to go?</h1>
        <p className="bm-sub">From <strong>{location?.name}</strong></p>

        <div className="bm-dist-grid">
          {WALK_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`bm-dist-card${walkMins === opt.value ? ' bm-dist-card--active' : ''}`}
              onClick={() => setWalkMins(opt.value)}
            >
              <span className="bm-dist-num">{opt.label}</span>
              {opt.sublabel && <span className="bm-dist-sub">{opt.sublabel}</span>}
              <span className="bm-dist-hint">{opt.hint}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="bm-footer">
        <button className="bm-btn-primary" onClick={() => setStep('prefs')}>
          Find my place →
        </button>
      </div>
    </div>
  )

  /* ── Step 3: Preferences ── */
  if (step === 'prefs') return (
    <div className="bm-screen bm-screen--prefs">
      <div className="bm-header">
        <button className="bm-back-btn" onClick={() => setStep('distance')} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span className="bm-step-dot">3 / 3</span>
      </div>
      <div className="bm-body">
        <h1 className="bm-title">What are you looking for?</h1>
        <p className="bm-sub">Optional — leave empty to see everything nearby</p>

        <p className="bm-filter-label">MEAL</p>
        <div className="bm-pill-row">
          {MEAL_OPTIONS.map(m => (
            <button
              key={m.key}
              className={`bm-pill${selMeals.has(m.key) ? ' bm-pill--active' : ''}`}
              onClick={() => toggleMeal(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <p className="bm-filter-label" style={{ marginTop: 22 }}>VIBE</p>
        <div className="bm-pill-row">
          {VIBE_OPTIONS.map(v => (
            <button
              key={v.id}
              className={`bm-pill${selVibes.has(v.id) ? ' bm-pill--active' : ''}`}
              onClick={() => toggleVibe(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Open Now toggle */}
        <div className="bm-open-now-row">
          <div className="bm-open-now-label">
            <span className="bm-open-now-title">Open now</span>
            <span className="bm-open-now-sub">Only show places currently open</span>
          </div>
          <button
            role="switch"
            aria-checked={openNowFilter}
            className={`bm-toggle${openNowFilter ? ' bm-toggle--on' : ''}`}
            onClick={() => setOpenNowFilter(v => !v)}
          >
            <span className="bm-toggle-thumb" />
          </button>
        </div>

        {loadErr && <p className="bm-error">Error: {loadErr}</p>}
      </div>
      <div className="bm-footer">
        <button className="bm-prefs-skip" onClick={startSwipe}>Skip →</button>
        <button className="bm-btn-primary" onClick={startSwipe}>
          Find Matches →
        </button>
      </div>
    </div>
  )

  /* ── Loading ── */
  if (step === 'loading') return (
    <div className="bm-screen bm-screen--center">
      <div className="bm-loading-pulse">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#C63B2F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <p className="bm-loading-text">Finding your matches…</p>
    </div>
  )

  /* ── Swipe ── */
  if (step === 'swipe') {
    const cur  = cards[idx]
    const next = cards[idx + 1]

    if (!cur) { setStep('results'); return null }

    return (
      <div className="bm-swipe-screen">
        <div className="bm-swipe-header">
          <button className="bm-swipe-done" onClick={() => setStep('results')}>Done</button>
          <span className="bm-swipe-counter">{idx + 1} / {cards.length}</span>
          <button className="bm-undo-btn" onClick={handleUndo} disabled={history.length === 0}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
            </svg>
            Undo
          </button>
        </div>

        <div className="bm-card-stack">
          {next && (
            <SwipeCard
              key={next.id + '_next'}
              place={next}
              isTop={false}
              isNext={true}
              dragDx={topDx}
              onSwipe={() => {}}
              userLoc={location}
            />
          )}
          <SwipeCard
            key={cur.id}
            place={cur}
            isTop={true}
            isNext={false}
            dragDx={topDx}
            onSwipe={handleSwipe}
            userLoc={location}
          />
        </div>

        <div className="bm-swipe-actions">
          <button
            className="bm-action-btn bm-action-btn--skip"
            onClick={() => handleSwipe('left')}
            aria-label="Skip"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
          <button
            className="bm-action-btn bm-action-btn--save"
            onClick={() => handleSwipe('right')}
            aria-label="Save"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  /* ── Results ── */
  if (step === 'results') {
    const sortedMaybe = [...maybe].sort((a, b) => (b.computed_score ?? 0) - (a.computed_score ?? 0))

    return (
      <div className="bm-screen bm-screen--results">
        <div className="bm-header">
          <button className="bm-close-btn" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
          <button className="bm-restart-btn" onClick={() => { setStep('location'); setLocQuery(''); setLocation(null); setLocSugg([]) }}>
            Start Over
          </button>
        </div>

        {maybe.length === 0 ? (
          <div className="bm-empty-state">
            <span className="bm-empty-emoji">🤔</span>
            <h2 className="bm-empty-title">Nothing saved</h2>
            <p className="bm-empty-sub">{quip}</p>
            <button className="bm-btn-primary" style={{ marginTop: 28 }} onClick={() => { setStep('swipe'); setIdx(0); setMaybe([]); setHistory([]) }}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="bm-results-header">
              <h2 className="bm-results-title">Your Picks</h2>
              <p className="bm-results-sub">{maybe.length} place{maybe.length !== 1 ? 's' : ''} saved</p>
            </div>
            <div className="bm-results-list">
              {sortedMaybe.map(place => (
                <button
                  key={place.id}
                  className="bm-result-row"
                  onClick={() => onOpenPlace?.(place)}
                >
                  <div className="bm-result-info">
                    <span className="bm-result-name">{place.name}</span>
                    <span className="bm-result-meta">{formatAddress(place.address)}</span>
                  </div>
                  <div className="bm-result-score-wrap">
                    <span className="bm-result-score-val">{place.computed_score}</span>
                    <span className="bm-result-score-max">/25</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return null
}
