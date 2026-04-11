import { useState, useEffect, useRef, useCallback } from 'react'
import { Zap, MessageCircle, UtensilsCrossed, Sparkles } from 'lucide-react'

/* ── Trim address to "Street, City" — drop postal code and country ── */
function formatAddress(addr) {
  if (!addr) return ''
  return addr.split(',').map(p => p.trim()).slice(0, 2).join(', ')
}
import {
  TASTE_OPTIONS, SPREAD_OPTIONS, AESTHETIC_OPTIONS, SERVICE_OPTIONS,
  TAGS, computeScore,
} from '../../data/scoring'
import { savePlace, updatePlace, addPlaceToWishlist } from '../../lib/db'
import { autocomplete, getPlaceDetails } from '../../lib/places'
import './AddPlace.css'

/* ── Experience types ─────────────────────────────────────────────── */
const EXPERIENCE_LIST = [
  { id: 'quick_light',     label: 'Quick & Light',      desc: 'Grab something fast', Icon: Zap             },
  { id: 'catchup',         label: 'Catch-up / Hangout', desc: 'Sit and chat',        Icon: MessageCircle   },
  { id: 'shared_table',    label: 'Shared Table',       desc: 'Dishes to share',     Icon: UtensilsCrossed },
  { id: 'full_experience', label: 'Full Experience',    desc: 'Full meal',           Icon: Sparkles        },
]

/* ── Meal types in display order ─────────────────────────────────── */
const MEAL_TYPES_ORDERED = [
  { id: 'cafe',        label: 'Café'          },
  { id: 'brunch',      label: 'Brunch'        },
  { id: 'lunch',       label: 'Lunch'         },
  { id: 'dinner',      label: 'Dinner'        },
  { id: 'bakery_deli', label: 'Bakery & Deli' },
  { id: 'drinks',      label: 'Drinks'        },
]

/* ── Rating categories ────────────────────────────────────────────── */
const CATS = [
  { key: 'taste',     label: 'Taste',     opts: TASTE_OPTIONS     },
  { key: 'spread',    label: 'Spread',    opts: SPREAD_OPTIONS    },
  { key: 'aesthetic', label: 'Aesthetic', opts: AESTHETIC_OPTIONS },
  { key: 'service',   label: 'Service',   opts: SERVICE_OPTIONS   },
]

/* ── Community averages ───────────────────────────────────────────── */
const MOCK_AVG = {
  taste:     { cafe: 10, bakery: 11, deli: 10, bakery_deli: 11, brunch: 8,  lunch: 7, happy_hour: 7,  dinner: 10, drinks: 7 },
  spread:    { cafe: 2,  bakery: 3,  deli: 3,  bakery_deli: 3,  brunch: 4,  lunch: 3, happy_hour: 3,  dinner: 3,  drinks: 3 },
  aesthetic: { cafe: 3,  bakery: 1,  deli: 1,  bakery_deli: 1,  brunch: 3,  lunch: 2, happy_hour: 5,  dinner: 4,  drinks: 5 },
  service:   { cafe: 1,  bakery: 1,  deli: 0,  bakery_deli: 1,  brunch: 1,  lunch: 2, happy_hour: 1,  dinner: 3,  drinks: 2 },
}

const PRICE_OPTS = [
  { id: '1', label: '₪' },
  { id: '2', label: '₪₪' },
  { id: '3', label: '₪₪₪' },
  { id: '4', label: '₪₪₪₪' },
]

function computePlateAvg(mealType) {
  if (!mealType) return 0
  return (MOCK_AVG.taste[mealType] ?? 0) + (MOCK_AVG.spread[mealType] ?? 0) +
         (MOCK_AVG.aesthetic[mealType] ?? 0) + (MOCK_AVG.service[mealType] ?? 0)
}

/* ── EQ Column (vertical equalizer) ──────────────────────────────── */
function EQColumn({ catKey, label, options, mealType, selected, onChange }) {
  const sorted = [...options].sort((a, b) => (a.scores[mealType] ?? 0) - (b.scores[mealType] ?? 0))
  const n = sorted.length

  const selIdx        = selected ? sorted.findIndex(o => o.id === selected) : -1
  const fillPct       = selIdx >= 0 ? ((selIdx + 1) / n) * 100 : 0
  const selectedLabel = selIdx >= 0 ? sorted[selIdx].label : null

  // Avg — only computed/shown after user has rated this column
  const avgScore  = MOCK_AVG[catKey]?.[mealType] ?? 0
  const avgOptIdx = sorted.reduce((best, opt, idx) => {
    const tDiff = Math.abs((opt.scores[mealType] ?? 0) - avgScore)
    const bDiff = Math.abs((sorted[best].scores[mealType] ?? 0) - avgScore)
    return tDiff < bDiff ? idx : best
  }, 0)
  const avgLinePct = ((avgOptIdx + 0.5) / n) * 100

  return (
    <div className="eq-col">
      {/* Floating label above fill */}
      <div className="eq-col-label-wrap">
        {selectedLabel && (
          <span className="eq-col-sel-label">{selectedLabel}</span>
        )}
      </div>

      <div className="eq-col-track">
        {/* User fill – bottom to top */}
        <div className="eq-col-fill" style={{ height: `${fillPct}%` }} />

        {/* Avg horizontal line – only after rating */}
        {selected && (
          <div className="eq-col-avg-line" style={{ bottom: `${avgLinePct}%` }} />
        )}

        {/* Notch lines at segment boundaries */}
        {Array.from({ length: n - 1 }, (_, i) => (
          <div key={i} className="eq-notch" style={{ bottom: `${((i + 1) / n) * 100}%` }} />
        ))}

        {/* Tap zones – one per segment, bottom to top */}
        {sorted.map((opt, idx) => (
          <button
            key={opt.id}
            className={`eq-zone${selected === opt.id ? ' eq-zone--active' : ''}`}
            style={{ bottom: `${(idx / n) * 100}%`, height: `${100 / n}%` }}
            onClick={() => onChange(opt.id)}
          />
        ))}
      </div>

      <span className="eq-col-cat">{label}</span>
    </div>
  )
}

const PRIORITY_OPTS = [
  { id: 'high',   label: '⭐ Must-go'      },
  { id: 'medium', label: 'Nice to have'    },
]

/* ── Step 1: Place + Experience + Meal Type ───────────────────────── */
function StepPlace({ place, onPlaceChange, photo, onPhotoChange, onNext }) {
  const [query,     setQuery]     = useState(place?.name || '')
  const [results,   setResults]   = useState([])
  const [open,      setOpen]      = useState(false)
  const [searching, setSearching] = useState(false)
  const [loadingPlace, setLoadingPlace] = useState(false)
  const debounceRef = useRef(null)
  const fileRef     = useRef()

  // Debounced autocomplete — fires 350 ms after the user stops typing
  const handleInput = useCallback((e) => {
    const q = e.target.value
    setQuery(q)
    onPlaceChange(null)           // clear selected place while typing
    clearTimeout(debounceRef.current)

    if (q.length < 2) {
      setResults([]); setOpen(false); setSearching(false)
      return
    }

    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      const suggestions = await autocomplete(q)
      setResults(suggestions)
      setOpen(true)
      setSearching(false)
    }, 350)
  }, [onPlaceChange])

  // When user picks a suggestion — fetch full details (photo, coords, etc.)
  async function select(suggestion) {
    setOpen(false)
    setQuery(suggestion.name)
    setLoadingPlace(true)
    try {
      const details = await getPlaceDetails(suggestion.placeId)
      onPlaceChange(details ?? { ...suggestion, photo_url: null })
    } catch {
      onPlaceChange({ ...suggestion, photo_url: null })
    } finally {
      setLoadingPlace(false)
    }
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    onPhotoChange(URL.createObjectURL(file))
  }

  const bgImage = photo || place?.photo_url

  return (
    <div className={`ap-step${place ? ' ap-step--has-place' : (!loadingPlace ? ' ap-step--search' : '')}`}>
      {!place && !loadingPlace ? (
        /* ── Search state ── */
        <div className="ap-search-block">
          <div className="ap-search-icon-circle">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <p className="ap-search-prompt">Which place?</p>
          <p className="ap-search-subtitle">Search for the restaurant, café, or bar you visited.</p>
          <div className="ap-search-field">
            {searching ? (
              <svg className="ap-search-icon ap-search-icon--spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              <svg className="ap-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            )}
            <input
              className="ap-search-input"
              type="text"
              placeholder="Search restaurant, café, bar..."
              value={query}
              onChange={handleInput}
              onFocus={() => results.length > 0 && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              dir="rtl"
              autoFocus
            />
            {query && (
              <button className="ap-search-clear" onClick={() => { setQuery(''); setResults([]); setOpen(false) }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
          {open && results.length > 0 && (
            <ul className="ap-results">
              {results.map(p => (
                <li key={p.placeId} className="ap-result-item" onMouseDown={() => select(p)}>
                  <span className="ap-result-name">{p.mainText}</span>
                  <span className="ap-result-addr">{p.secondaryText}</span>
                </li>
              ))}
            </ul>
          )}
          {open && results.length === 0 && !searching && query.length >= 2 && (
            <div className="ap-results ap-results--empty">No results found</div>
          )}
        </div>
      ) : loadingPlace ? (
        /* ── Loading place details ── */
        <div className="ap-search-block">
          <p className="ap-search-prompt" style={{ color: 'var(--color-text-muted)', fontSize: 15 }}>
            Loading details...
          </p>
        </div>
      ) : (
        /* ── Place selected: hero + pickers ── */
        <>
          {/* Hero image – fixed height */}
          <div
            className="ap-hero ap-hero--dark"
            style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          >
            {bgImage && <div className="ap-hero-scrim" />}
            <div className="ap-hero-body">
              <h2 className="ap-hero-name">{place.name}</h2>
              <span className="ap-hero-addr">{formatAddress(place.address)}</span>
            </div>
            <div className="ap-hero-actions">
              <button className="ap-hero-btn" onClick={() => fileRef.current?.click()}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
                {photo ? 'Change photo' : 'Add photo'}
              </button>
              <button className="ap-hero-btn" onClick={() => { onPlaceChange(null); setQuery('') }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
                Change
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
          </div>

        </>
      )}

      <div className="ap-step-footer">
        <button className="ap-cta-btn" onClick={onNext} disabled={!place}>
          Continue →
        </button>
      </div>
    </div>
  )
}

/* ── Step 2: Visit details (combined details screen) ─────────────────── */
function StepVisit({ place, photo, onPhotoChange, onPlaceChange,
                     expType, onExpChange, mealType, onMealType, extraTypes, onExtraTypes,
                     isWishlist, onIsWishlist, wishNote, onWishNote, priority, onPriority,
                     date, onDate, isRegular, onIsRegular, with_, onWith, price, onPrice,
                     onBack, onNext, onWishlistSave }) {
  const fileRef = useRef()
  const dateRef = useRef()
  const bgImage = photo || place?.photo_url

  function formatDate(val) {
    if (!val) return ''
    // "YYYY-MM-DD" → "11 April 2026"  (T12:00 avoids UTC midnight tz shift)
    return new Date(val + 'T12:00').toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    onPhotoChange(URL.createObjectURL(file))
  }

  function toggleExtra(id) {
    if (id === mealType) return
    onExtraTypes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div className="ap-step ap-step--details">

      {/* ── Dark hero ── */}
      <div
        className="ap-hero ap-hero--dark"
        style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {bgImage && <div className="ap-hero-scrim" />}
        <div className="ap-hero-body">
          <h2 className="ap-hero-name">{place?.name}</h2>
          <span className="ap-hero-addr">{formatAddress(place?.address)}</span>
        </div>
        <div className="ap-hero-actions">
          <button className="ap-hero-btn" onClick={() => fileRef.current?.click()}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
            {photo ? 'Change photo' : 'Add photo'}
          </button>
          <button className="ap-hero-btn" onClick={() => { onPlaceChange(null); onBack() }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
            Change
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
      </div>

      {/* ── Scrollable details ── */}
      <div className="ap-details-body">

        {/* Wishlist toggle */}
        <button
          className={`ap-wishlist-toggle${isWishlist ? ' ap-wishlist-toggle--on' : ''}`}
          onClick={() => onIsWishlist(v => !v)}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <span>Add to Wishlist</span>
          <span className="ap-wishlist-switch">
            <span className={`ap-wishlist-thumb${isWishlist ? ' ap-wishlist-thumb--on' : ''}`} />
          </span>
        </button>

        {isWishlist ? (
          /* ── Wishlist mode ── */
          <>
            <div className="ap-field-group">
              <label className="ap-label">What type of meal?</label>
              <div className="ap-chips">
                {MEAL_TYPES_ORDERED.map(mt => (
                  <button key={mt.id} className={`ap-chip${mealType === mt.id ? ' ap-chip--on' : ''}`}
                    onClick={() => onMealType(prev => prev === mt.id ? null : mt.id)}>
                    {mt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="ap-field-group">
              <label className="ap-label ap-label--sm">Priority</label>
              <div className="ap-chips ap-chips--sm">
                {PRIORITY_OPTS.map(p => (
                  <button key={p.id} className={`ap-chip ap-chip--sm${priority === p.id ? ' ap-chip--on' : ''}`}
                    onClick={() => onPriority(prev => prev === p.id ? null : p.id)}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="ap-field-group">
              <label className="ap-label ap-label--sm">Note <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
              <textarea className="ap-textarea" placeholder="Why do you want to try it?"
                value={wishNote} onChange={e => onWishNote(e.target.value)} rows={2} />
            </div>
          </>
        ) : (
          /* ── Rate mode ── */
          <>
            {/* Core Experience */}
            <div className="ap-field-group">
              <label className="ap-label">Core Experience</label>
              <div className="ap-exp-cards">
                {EXPERIENCE_LIST.map(({ id, label, desc, Icon }) => (
                  <button key={id} className={`ap-exp-card${expType === id ? ' ap-exp-card--active' : ''}`}
                    onClick={() => onExpChange(id)}>
                    <Icon size={18} strokeWidth={1.5} />
                    <span className="ap-exp-card-label">{label}</span>
                    <span className="ap-exp-card-desc">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* What did you have */}
            <div className="ap-field-group">
              <label className="ap-label">What did you have?</label>
              <div className="ap-chips">
                {MEAL_TYPES_ORDERED.map(mt => (
                  <button key={mt.id} className={`ap-chip${mealType === mt.id ? ' ap-chip--on' : ''}`}
                    onClick={() => onMealType(prev => prev === mt.id ? null : mt.id)}>
                    {mt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* This place also serves */}
            {mealType && (
              <div className="ap-field-group">
                <label className="ap-label ap-label--sm">This place also serves:</label>
                <div className="ap-chips ap-chips--sm">
                  {MEAL_TYPES_ORDERED.filter(mt => mt.id !== mealType).map(mt => (
                    <button key={mt.id} className={`ap-chip ap-chip--sm${extraTypes.includes(mt.id) ? ' ap-chip--on' : ''}`}
                      onClick={() => toggleExtra(mt.id)}>
                      {mt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="ap-field-group">
              <label className="ap-label ap-label--sm">Price</label>
              <div className="ap-chips ap-chips--sm">
                {PRICE_OPTS.map(p => (
                  <button key={p.id} className={`ap-chip ap-chip--sm ap-chip--price${price === p.id ? ' ap-chip--on' : ''}`}
                    onClick={() => onPrice(price === p.id ? null : p.id)}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Who with + My Regular */}
            <div className="ap-field-group">
              <label className="ap-label ap-label--sm">Who were you with?</label>
              <div className="ap-who-row">
                <button
                  className={`ap-regular-btn${isRegular ? ' ap-regular-btn--on' : ''}`}
                  onClick={() => onIsRegular(v => !v)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    <circle cx="12" cy="9" r="2.5"/>
                  </svg>
                  My Regular
                </button>
                <input
                  type="text"
                  className="ap-who-input"
                  placeholder="@username..."
                  value={with_}
                  onChange={e => onWith(e.target.value)}
                />
              </div>
            </div>

            {/* When — hidden when My Regular */}
            {!isRegular && (
              <div className="ap-field-group">
                <label className="ap-label ap-label--sm">When?</label>
                <div
                  className="ap-date-card"
                  onClick={() => dateRef.current?.showPicker?.()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span className={`ap-date-card-text${date ? ' ap-date-card-text--set' : ''}`}>
                    {date ? formatDate(date) : 'Select date…'}
                  </span>
                  <input
                    ref={dateRef}
                    type="date"
                    className="ap-date-hidden-input"
                    value={date}
                    onChange={e => onDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="ap-step-footer">
        {isWishlist ? (
          <button className="ap-cta-btn" onClick={onWishlistSave}>
            Add to Wishlist →
          </button>
        ) : (
          <button className="ap-cta-btn" onClick={onNext} disabled={!expType || !mealType}>
            Continue →
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Step 3: EQ Rating ────────────────────────────────────────────── */
function StepRating({ mealType, rating, onChange, note, onNote, tags, onTags, onSave, onBack }) {
  const [phase, setPhase] = useState('idle')
  const allRated = CATS.every(c => rating[c.key])
  const score    = computeScore(rating, mealType)
  const plateAvg = computePlateAvg(mealType)
  const delta    = plateAvg > 0 ? score - plateAvg : 0

  useEffect(() => {
    if (allRated && phase === 'idle') {
      const t1 = setTimeout(() => setPhase('revealing'), 300)
      const t2 = setTimeout(() => setPhase('done'), 1600)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [allRated]) // eslint-disable-line

  useEffect(() => {
    if (!allRated && phase !== 'idle') setPhase('idle')
  }, [allRated]) // eslint-disable-line

  const [customTagInput, setCustomTagInput] = useState('')

  // Tags are stored as label strings (e.g. "Kosher", "Rooftop")
  function toggleTag(label) {
    onTags(prev => prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label])
  }

  function handleCustomTagKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = customTagInput.trim()
      if (val && !tags.includes(val)) onTags(prev => [...prev, val])
      setCustomTagInput('')
    }
  }

  const checkSVG = (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  )

  return (
    <div className="ap-step ap-step--rating">

      {/* ── Dark header: step indicators + score + avg ── */}
      <div className="ap-rating-header">

        {/* Step indicator circles */}
        <div className="ap-rating-steps">
          <div className="ap-rating-step ap-rating-step--done">{checkSVG}</div>
          <div className="ap-rating-step-line" />
          <div className="ap-rating-step ap-rating-step--done">{checkSVG}</div>
          <div className="ap-rating-step-line" />
          <div className="ap-rating-step ap-rating-step--active">3</div>
        </div>

        {/* Score number */}
        <div className="ap-rating-score-display">
          <span className="ap-rating-score-big">{score}</span>
          <span className="ap-rating-score-denom">/25</span>
        </div>

        {/* Plate avg + delta */}
        {plateAvg > 0 && (
          <div className="ap-rating-avg-row">
            Plate avg: {plateAvg}
            {delta !== 0 && (
              <span className={`ap-rating-delta${delta > 0 ? ' ap-rating-delta--up' : ' ap-rating-delta--dn'}`}>
                {delta > 0 ? ` +${delta}` : ` ${delta}`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Bars card (white) ── */}
      <div className="ap-rating-bars-card">
        <div className="ap-eq-cols">
          {CATS.map(cat => (
            <EQColumn
              key={cat.key}
              catKey={cat.key}
              label={cat.label}
              options={cat.opts}
              mealType={mealType}
              selected={rating[cat.key]}
              onChange={val => onChange(cat.key, val)}
            />
          ))}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="ap-rating-body">
        {phase === 'done' && (
          <div className="ap-post-rating">
            <div className="ap-field-group">
              <label className="ap-label">Personal note</label>
              <textarea
                className="ap-textarea"
                placeholder="What made it special?"
                value={note}
                onChange={e => onNote(e.target.value)}
                rows={3}
              />
            </div>
            <div className="ap-field-group">
              <label className="ap-label ap-label--sm">Tags</label>
              <div className="ap-chips ap-chips--sm">
                {TAGS.map(tag => (
                  <button
                    key={tag.id}
                    className={`ap-chip ap-chip--sm${tags.includes(tag.label) ? ' ap-chip--on' : ''}`}
                    onClick={() => toggleTag(tag.label)}
                  >
                    {tag.label}
                  </button>
                ))}
                {/* Custom tags added by user */}
                {tags.filter(t => !TAGS.some(st => st.label === t) && !['₪','₪₪','₪₪₪','₪₪₪₪'].includes(t)).map(t => (
                  <button
                    key={t}
                    className="ap-chip ap-chip--sm ap-chip--on"
                    onClick={() => onTags(prev => prev.filter(x => x !== t))}
                  >
                    {t} ×
                  </button>
                ))}
              </div>
              <input
                className="ap-custom-tag-input"
                placeholder="Add custom tag, press Enter"
                value={customTagInput}
                onChange={e => setCustomTagInput(e.target.value)}
                onKeyDown={handleCustomTagKey}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── CTA footer ── */}
      <div className="ap-step-footer">
        {phase === 'done' ? (
          <button className="ap-cta-btn" onClick={onSave}>Save to Plate →</button>
        ) : (
          <button className="btn-ghost" onClick={onBack}>← Back</button>
        )}
      </div>
    </div>
  )
}

/* ── Save animation (fly-up card) ────────────────────────────────── */
function SaveAnimation({ place, photo, score, onDone }) {
  const bgImage = photo || place?.photo_url
  useEffect(() => {
    const t = setTimeout(onDone, 820)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line

  return (
    <div className="ap-save-overlay">
      <div
        className="ap-save-card"
        style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {bgImage && <div className="ap-save-card-scrim" />}
        <div className="ap-save-card-info">
          <span className="ap-save-card-name">{place?.name}</span>
          <div className="ap-save-card-score">
            <span className="ap-score-big">{score}</span>
            <span className="ap-score-denom">/25</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Done screen ──────────────────────────────────────────────────── */
function DoneScreen({ place, score, isWishlist, isEdit, onHome }) {
  const [copied, setCopied] = useState(false)

  function handleShare() {
    const url = `${window.location.origin}/place/${encodeURIComponent(place?.name || '')}`
    if (navigator.share) {
      navigator.share({ title: place?.name, url }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(url).catch(() => {})
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="ap-done" dir="rtl">
      <div className="ap-done-inner">
        {/* Animated checkmark */}
        <div className="ap-done-check">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
        </div>

        {/* Score — hidden for wishlist */}
        {!isWishlist && (
          <div className="ap-done-score-wrap">
            <span className="ap-done-score-val">{score}</span>
            <span className="ap-done-score-denom">/25</span>
          </div>
        )}

        {/* Labels */}
        <p className="ap-done-status">{isWishlist ? 'Added to Wishlist!' : isEdit ? 'Updated!' : 'Saved!'}</p>
        <p className="ap-done-name">{place?.name}</p>

        {/* Share */}
        <button className="ap-done-share-btn" onClick={handleShare}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
          {copied ? 'Link copied!' : 'Share'}
        </button>

        {/* CTA */}
        <button className="ap-done-btn" onClick={onHome}>
          Back to Home
        </button>
      </div>
    </div>
  )
}

/* ── Main ─────────────────────────────────────────────────────────── */
export default function AddPlace({ onSaved, prefill = null }) {
  const isEditMode  = !!prefill?.editMode
  const editPlaceId = prefill?.placeId ?? null

  const [step,           setStep]           = useState(0)
  const [place,          setPlace]          = useState(prefill?.place          ?? null)
  const [photo,          setPhoto]          = useState(null)
  const [experienceType, setExperienceType] = useState(prefill?.experienceType ?? null)
  const [mealType,       setMealType]       = useState(prefill?.mealType       ?? null)
  const [extraTypes,     setExtraTypes]     = useState(prefill?.extraTypes     ?? [])
  const [date,           setDate]           = useState(prefill?.date           ?? '')
  const [isRegular,      setIsRegular]      = useState(prefill?.isRegular      ?? false)
  const [with_,          setWith]           = useState('')
  const [price,          setPrice]          = useState(prefill?.price          ?? null)
  const [rating,         setRating]         = useState(prefill?.rating         ?? { taste: null, spread: null, aesthetic: null, service: null })
  const [note,           setNote]           = useState(prefill?.note           ?? '')
  const [tags,           setTags]           = useState(prefill?.tags           ?? [])
  const [saving,         setSaving]         = useState(false)
  const [done,           setDone]           = useState(false)
  const [savedData,      setSavedData]      = useState(null)
  // Wishlist mode
  const [isWishlist,     setIsWishlist]     = useState(false)
  const [wishNote,       setWishNote]       = useState('')
  const [priority,       setPriority]       = useState('medium')
  const savePromiseRef = useRef(null)

  function updateRating(key, val) { setRating(prev => ({ ...prev, [key]: val })) }
  const score = computeScore(rating, mealType)

  // Keep price tag in sync: auto-add/replace ₪ tag when price changes
  const PRICE_TAGS = ['₪', '₪₪', '₪₪₪', '₪₪₪₪']
  const PRICE_TAG_MAP = { '1': '₪', '2': '₪₪', '3': '₪₪₪', '4': '₪₪₪₪' }
  function handlePriceChange(newPrice) {
    setPrice(newPrice)
    setTags(prev => {
      const withoutPrice = prev.filter(t => !PRICE_TAGS.includes(t))
      return newPrice ? [...withoutPrice, PRICE_TAG_MAP[newPrice]] : withoutPrice
    })
  }

  // Called when user taps "שמרי ב-Plate" – kick off save immediately,
  // then show the animation while the network request is in-flight.
  function handleStartSave() {
    const data = {
      ...place,
      photo_url:       photo || place?.photo_url,
      experience_type: experienceType,
      meal_types:      [mealType, ...extraTypes].filter(Boolean),
      ratings:         { [mealType]: rating },
      personal_note:   note,
      tags,
      computed_score:  score,
      last_visited:    isRegular ? null : (date || new Date().toISOString().split('T')[0]),
      is_regular:      isRegular,
      price_tier:      price,
    }
    setSavedData(data)
    savePromiseRef.current = isEditMode && editPlaceId
      ? updatePlace(editPlaceId, data)
      : savePlace(data)
    setSaving(true)
  }

  // Called when the fly-up animation finishes (~820 ms).
  // We await the in-flight save so the done screen only appears after persist.
  async function handleSaveAnimDone() {
    try {
      await savePromiseRef.current
      setSaving(false)
      setDone(true)
    } catch (e) {
      console.error('[AddPlace] save failed:', e)
      setSaving(false)
      alert(`Save failed: ${e.message}`)
    }
  }

  async function handleWishlistSave() {
    setSaving(true)
    try {
      await addPlaceToWishlist(
        { name: place.name, address: place.address, photo_url: photo || place?.photo_url },
        {
          added_from: 'Added by me',
          added_note: wishNote || null,
          priority:   priority ?? 'medium',
        }
      )
      setSavedData({ ...place, isWishlist: true })
      setDone(true)
    } catch (e) {
      console.error('[AddPlace] wishlist save failed:', e)
      alert('Could not save to Wishlist. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  /* Done screen */
  if (done) {
    return (
      <DoneScreen
        place={place}
        score={savedData?.isWishlist ? null : score}
        isWishlist={savedData?.isWishlist}
        isEdit={isEditMode}
        onHome={() => onSaved?.(savedData)}
      />
    )
  }

  return (
    <div className={[
      'ap-screen',
      step === 0 && !place && !saving ? 'ap-screen--search' : '',
      ((step === 0 && !!place) || step === 1) && !saving ? 'ap-screen--details' : '',
      step === 2 && !saving ? 'ap-screen--rating' : '',
    ].filter(Boolean).join(' ')}>

      {/* Progress — hidden in wishlist mode */}
      {!isWishlist && (
        <div className="ap-progress">
          {[0, 1, 2].map(i => (
            <button
              key={i}
              className={`ap-prog-step${i === step ? ' ap-prog-step--active' : ''}${i < step ? ' ap-prog-step--done' : ''}`}
              onClick={() => i < step && setStep(i)}
            >
              {i < step
                ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                : i + 1}
            </button>
          ))}
          <span className="ap-prog-frac">{step + 1} / 3</span>
        </div>
      )}

      <div className="ap-body">
        {step === 0 && (
          <StepPlace
            place={place}   onPlaceChange={setPlace}
            photo={photo}   onPhotoChange={setPhoto}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <StepVisit
            place={place}
            photo={photo}            onPhotoChange={setPhoto}
            expType={experienceType} onExpChange={setExperienceType}
            mealType={mealType}      onMealType={setMealType}
            extraTypes={extraTypes}  onExtraTypes={setExtraTypes}
            isWishlist={isWishlist}  onIsWishlist={setIsWishlist}
            wishNote={wishNote}      onWishNote={setWishNote}
            priority={priority}      onPriority={setPriority}
            date={date}              onDate={setDate}
            isRegular={isRegular}    onIsRegular={setIsRegular}
            with_={with_}            onWith={setWith}
            price={price}            onPrice={handlePriceChange}
            onPlaceChange={setPlace}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            onWishlistSave={handleWishlistSave}
          />
        )}
        {step === 2 && (
          <StepRating
            mealType={mealType}
            rating={rating}  onChange={updateRating}
            note={note}      onNote={setNote}
            tags={tags}      onTags={setTags}
            onSave={handleStartSave}
            onBack={() => setStep(1)}
          />
        )}
      </div>

      {saving && (
        <SaveAnimation place={place} photo={photo} score={score} onDone={handleSaveAnimDone} />
      )}
    </div>
  )
}
