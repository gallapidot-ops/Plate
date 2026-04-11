import { useState, useEffect, useRef } from 'react'
import { Zap, MessageCircle, UtensilsCrossed, Sparkles } from 'lucide-react'
import { enrichPlace, RESERVATION_LABELS, PRICE_LABELS } from '../../data/mockPlaceDetails'

/* ── Trim address to "Street, City" — drop postal code and country ── */
function formatAddress(addr) {
  if (!addr) return ''
  return addr.split(',').map(p => p.trim()).slice(0, 2).join(', ')
}
import { computeBreakdown, getPlaceScores } from '../../data/scoring'
import { getPlacePhotos } from '../../lib/places'
import { getFollowing, sharePlace } from '../../lib/db'
import './PlacePage.css'

const EXPERIENCE_ICONS = {
  quick_light:     Zap,
  catchup:         MessageCircle,
  shared_table:    UtensilsCrossed,
  full_experience: Sparkles,
}

const MEAL_TYPE_LABELS = {
  cafe: 'Café', brunch: 'Brunch', lunch: 'Lunch', dinner: 'Dinner',
  bakery_deli: 'Bakery & Deli', drinks: 'Drinks',
  /* legacy */ bakery: 'Bakery', deli: 'Deli', happy_hour: 'Happy Hour',
}

const EXPERIENCE_LABELS = {
  quick_light:     'Quick & Light',
  catchup:         'Catch-up / Hangout',
  shared_table:    'Shared Table',
  full_experience: 'Full Experience',
}

/* ── Score breakdown bar ── */
function ScoreBar({ label, optionLabel, value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="pp-score-row">
      <div className="pp-score-label">
        <span className="pp-score-cat">{label}</span>
        {optionLabel && <span className="pp-score-option">{optionLabel}</span>}
      </div>
      <div className="pp-score-track">
        <div className="pp-score-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="pp-score-num">{value}<span className="pp-score-num-max">/{max}</span></span>
    </div>
  )
}

/* ── Practical row ── */
function PracticalRow({ icon, label, value, href, rowClass }) {
  if (!value && value !== false) return null
  const inner = (
    <div className={`pp-practical-row${rowClass ? ' ' + rowClass : ''}`}>
      <span className="pp-practical-icon">{icon}</span>
      <span className="pp-practical-label">{label}</span>
      <span className={`pp-practical-value${href ? ' pp-practical-value--link' : ''}`}>{value}</span>
    </div>
  )
  return href
    ? <a href={href} target="_blank" rel="noopener noreferrer" className="pp-practical-link">{inner}</a>
    : inner
}

/* ── Share sheet ── */
function ShareSheet({ place, onClose }) {
  const [friends,  setFriends]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [sending,  setSending]  = useState(null)        // userId currently in-flight
  const [sentIds,  setSentIds]  = useState(new Set())   // userIds successfully sent
  const [error,    setError]    = useState(null)
  const [copied,   setCopied]   = useState(false)

  useEffect(() => {
    getFollowing().then(list => { setFriends(list); setLoading(false) })
  }, [])

  async function handleSend(friend) {
    if (sending || sentIds.has(friend.id)) return
    setSending(friend.id)
    setError(null)
    try {
      await sharePlace(friend.id, place.id ?? null)
      setSentIds(prev => new Set(prev).add(friend.id))
    } catch (e) {
      console.error('[ShareSheet] sharePlace error:', e)
      setError('Failed to send. Please try again.')
    } finally {
      setSending(null)
    }
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/place/${place.id || encodeURIComponent(place.name)}`
    navigator.clipboard?.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="pp-sheet-backdrop" onClick={onClose} />
      <div className="pp-sheet">
        <div className="pp-sheet-handle" />

        <div className="pp-sheet-header">
          <span className="pp-sheet-title">Share Place</span>
          <button className="pp-sheet-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Place preview inside sheet */}
        <div className="pp-sheet-place-preview">
          <div className="pp-sheet-place-name">{place.name}</div>
          <div className="pp-sheet-place-sub">{formatAddress(place.address)}</div>
        </div>

        {error && <p className="pp-sheet-error">{error}</p>}

        <div className="pp-sheet-conv-list">
          {loading ? (
            <p className="pp-sheet-empty">Loading…</p>
          ) : friends.length === 0 ? (
            <p className="pp-sheet-empty">You're not following anyone yet.</p>
          ) : (
            friends.map(friend => {
              const isSending = sending === friend.id
              const isSent    = sentIds.has(friend.id)
              return (
                <button
                  key={friend.id}
                  className={`pp-sheet-conv-row${isSent ? ' pp-sheet-conv-row--sent' : ''}`}
                  onClick={() => handleSend(friend)}
                  disabled={isSending || isSent}
                >
                  {friend.avatar_url ? (
                    <img src={friend.avatar_url} alt={friend.name} className="pp-sheet-conv-avatar" />
                  ) : (
                    <div className="pp-sheet-conv-avatar pp-sheet-conv-avatar--placeholder">
                      {(friend.username || friend.name || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="pp-sheet-conv-info">
                    <span className="pp-sheet-conv-name">{friend.name || friend.username}</span>
                    <span className="pp-sheet-conv-last">@{friend.username}</span>
                  </div>
                  <div className={`pp-sheet-conv-send${isSent ? ' pp-sheet-conv-send--sent' : ''}`}>
                    {isSending ? (
                      <span className="pp-sheet-sending-dot">…</span>
                    ) : isSent ? (
                      /* Checkmark — sent state */
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                    ) : (
                      /* Send icon — default */
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m22 2-7 20-4-9-9-4 20-7z"/>
                        <path d="M22 2 11 13"/>
                      </svg>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>

        <div className="pp-sheet-footer">
          <button className="pp-sheet-copy-btn" onClick={handleCopyLink}>
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                Link copied!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Copy link
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}

/* ── Photo Gallery ── */
function PhotoGallery({ googlePlaceId, coverUrl, onClose }) {
  const [photos,  setPhotos]  = useState(coverUrl ? [coverUrl] : [])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(false)
  const startXRef = useRef(null)

  // Fetch full photo list once on open
  useEffect(() => {
    if (!googlePlaceId) return
    setLoading(true)
    getPlacePhotos(googlePlaceId, 10).then(urls => {
      if (urls.length > 0) setPhotos(urls)
      setLoading(false)
    })
  }, [googlePlaceId]) // eslint-disable-line

  const handleTouchStart = (e) => { startXRef.current = e.touches[0].clientX }
  const handleTouchEnd   = (e) => {
    if (startXRef.current === null) return
    const dx = e.changedTouches[0].clientX - startXRef.current
    startXRef.current = null
    if (Math.abs(dx) < 40) return
    if (dx < 0) setCurrent(c => Math.min(c + 1, photos.length - 1))
    else         setCurrent(c => Math.max(c - 1, 0))
  }

  const prev = () => setCurrent(c => Math.max(c - 1, 0))
  const next = () => setCurrent(c => Math.min(c + 1, photos.length - 1))

  return (
    <>
      <div className="pp-photos-backdrop" onClick={onClose} />
      <div className="pp-photos-gallery">

        {/* Top bar */}
        <div className="pp-photos-topbar">
          <button className="pp-photos-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
          {photos.length > 0 && (
            <span className="pp-photos-counter">{current + 1} / {photos.length}</span>
          )}
        </div>

        {/* Main image */}
        <div
          className="pp-photos-main"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {loading ? (
            <div className="pp-photos-loading">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'pp-spin 0.8s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            </div>
          ) : photos.length === 0 ? (
            <div className="pp-photos-empty">No photos available</div>
          ) : (
            <img
              key={current}
              src={photos[current]}
              alt=""
              className="pp-photos-img"
            />
          )}
        </div>

        {/* Prev / Next arrows */}
        {photos.length > 1 && !loading && (
          <>
            {current > 0 && (
              <button className="pp-photos-arrow pp-photos-arrow--prev" onClick={prev} aria-label="Previous">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
            )}
            {current < photos.length - 1 && (
              <button className="pp-photos-arrow pp-photos-arrow--next" onClick={next} aria-label="Next">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            )}
          </>
        )}

        {/* Dot indicators */}
        {photos.length > 1 && !loading && (
          <div className="pp-photos-dots">
            {photos.map((_, i) => (
              <button
                key={i}
                className={`pp-photos-dot${i === current ? ' pp-photos-dot--active' : ''}`}
                onClick={() => setCurrent(i)}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

/* ── Main ── */
export default function PlacePage({ place: rawPlace, onBack, onEdit, onDelete }) {
  const place = enrichPlace(rawPlace)
  const [favorite,    setFavorite]    = useState(place.is_favorite ?? false)
  const [showShare,   setShowShare]   = useState(false)
  const [showPhotos,  setShowPhotos]  = useState(false)
  const [scoreOpen,   setScoreOpen]   = useState(true)

  // Per-meal-type scores from ratings
  const mealTypeScores = getPlaceScores(place)
  const scoredTypes    = Object.keys(mealTypeScores)
  const [activeTab, setActiveTab] = useState(scoredTypes[0] ?? null)

  const mealTypes = (place.meal_types || (place.meal_type ? [place.meal_type] : []))
    .map(m => MEAL_TYPE_LABELS[m]).filter(Boolean)

  // Breakdown for active tab
  const activeBreakdown = (activeTab && place.ratings?.[activeTab])
    ? computeBreakdown(place.ratings[activeTab], activeTab)
    : []

  const lastVisited = place.last_visited
    ? new Date(place.last_visited).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : place.saved_at
      ? `Saved ${new Date(place.saved_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}`
      : null

  const websiteDisplay = place.website?.replace(/^https?:\/\//, '')

  return (
    <div className="pp-screen">

      {/* ── Hero (dark navy, no photo) ── */}
      <div className="pp-hero pp-hero--no-photo">

        {/* Top bar */}
        <div className="pp-hero-topbar">
          <button className="pp-hero-btn" onClick={onBack} aria-label="Back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <div className="pp-hero-actions">
            {onEdit && (
              <button className="pp-hero-btn" onClick={() => onEdit(rawPlace)} aria-label="Edit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            )}
            {onDelete && (
              <button className="pp-hero-btn pp-hero-btn--delete" onClick={() => onDelete(rawPlace.id)} aria-label="Delete">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            )}
            <button className="pp-hero-btn" onClick={() => setShowShare(true)} aria-label="Share">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom hero content */}
        <div className="pp-hero-info">
          <div className="pp-hero-bottom-row">
            <div className="pp-hero-chips">
              {mealTypes.map(m => <span key={m} className="pp-hero-chip">{m}</span>)}
            </div>
            {(place.photo_url || place.google_place_id) && (
              <button className="pp-hero-photos-btn" onClick={() => setShowPhotos(true)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                Photos
              </button>
            )}
          </div>
          <h1 className="pp-hero-name">{place.name}</h1>
          <p className="pp-hero-address">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {formatAddress(place.address)}
          </p>
        </div>
      </div>

      <div className="pp-body">

        {/* ── Tags ── */}
        {place.tags && place.tags.length > 0 && (
          <div className="pp-tags-row">
            {place.tags.map(t => (
              <span key={t} className="pp-tag-chip">{t}</span>
            ))}
          </div>
        )}

        {/* ── Score card (collapsible) ── */}
        {scoredTypes.length > 0 && (
          <section className="pp-section pp-section--score">
            <div className="pp-score-card-header" onClick={() => setScoreOpen(v => !v)}>
              <div className="pp-score-badge-wrap">
                <span className="pp-score-badge-type">{MEAL_TYPE_LABELS[activeTab] || activeTab}</span>
                <span className="pp-score-badge-num">
                  {mealTypeScores[activeTab]}<span className="pp-score-badge-max">/25</span>
                </span>
              </div>
              <button className="pp-score-toggle-btn" type="button">
                {scoreOpen ? 'Hide ↑' : 'Show ↓'}
              </button>
            </div>

            {scoreOpen && activeBreakdown.length > 0 && (
              <div className="pp-score-breakdown">
                <div className="pp-score-bars">
                  {activeBreakdown.map(cat => (
                    <ScoreBar
                      key={cat.key}
                      label={cat.label}
                      optionLabel={cat.optionLabel}
                      value={cat.score}
                      max={cat.max}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Practical Stuff ── */}
        <section className="pp-section">
          <p className="pp-section-label">Practical Stuff</p>
          <div className="pp-practical">
            <PracticalRow
              rowClass="pp-practical-row--website"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>}
              label="Website"
              value={websiteDisplay}
              href={place.website ? (place.website.startsWith('http') ? place.website : `https://${place.website}`) : null}
            />
            <PracticalRow
              rowClass="pp-practical-row--hours"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
              label="Hours"
              value={place.hours}
            />
          </div>
        </section>

      </div>

      {/* ── Share sheet ── */}
      {showShare && (
        <ShareSheet place={place} onClose={() => setShowShare(false)} />
      )}

      {/* ── Photo gallery ── */}
      {showPhotos && (
        <PhotoGallery
          googlePlaceId={place.google_place_id}
          coverUrl={place.photo_url}
          onClose={() => setShowPhotos(false)}
        />
      )}
    </div>
  )
}
