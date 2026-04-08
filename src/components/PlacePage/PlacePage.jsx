import { useState } from 'react'
import { Zap, MessageCircle, UtensilsCrossed, Sparkles } from 'lucide-react'
import { MOCK_FRIENDS, MOCK_CONVERSATIONS } from '../../data/mockSocial'
import { enrichPlace, RESERVATION_LABELS, PRICE_LABELS } from '../../data/mockPlaceDetails'
import { computeBreakdown, getPlaceScores } from '../../data/scoring'
import './PlacePage.css'

const EXPERIENCE_ICONS = {
  quick_light:     Zap,
  catchup:         MessageCircle,
  shared_table:    UtensilsCrossed,
  full_experience: Sparkles,
}

const MEAL_TYPE_LABELS = {
  cafe: 'Café', bakery: 'Bakery', deli: 'Deli', brunch: 'Brunch',
  lunch: 'Lunch', happy_hour: 'Happy Hour', dinner: 'Dinner', drinks: 'Drinks',
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
function PracticalRow({ icon, label, value, href }) {
  if (!value && value !== false) return null
  const inner = (
    <div className="pp-practical-row">
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
  const [sent, setSent] = useState(null)

  function handleSend(conv) {
    const friend = MOCK_FRIENDS.find(f => f.id === conv.with)
    setSent(friend?.name ?? 'החברה')
    setTimeout(onClose, 1600)
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
          <div className="pp-sheet-place-sub">{place.address}</div>
        </div>

        {sent ? (
          <div className="pp-sheet-sent">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            Sent to {sent}!
          </div>
        ) : (
          <>
            <div className="pp-sheet-conv-list">
              {MOCK_CONVERSATIONS.map(conv => {
                const friend = MOCK_FRIENDS.find(f => f.id === conv.with)
                if (!friend) return null
                return (
                  <button
                    key={conv.id}
                    className="pp-sheet-conv-row"
                    onClick={() => handleSend(conv)}
                  >
                    <img src={friend.avatar} alt={friend.name} className="pp-sheet-conv-avatar" />
                    <div className="pp-sheet-conv-info">
                      <span className="pp-sheet-conv-name">{friend.name}</span>
                      <span className="pp-sheet-conv-last">{conv.last_message}</span>
                    </div>
                    <div className="pp-sheet-conv-send">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m22 2-7 20-4-9-9-4 20-7z"/>
                        <path d="M22 2 11 13"/>
                      </svg>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="pp-sheet-footer">
              <button className="pp-sheet-new-chat">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  <path d="M12 8v4M10 10h4"/>
                </svg>
                New conversation
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

/* ── Main ── */
export default function PlacePage({ place: rawPlace, onBack }) {
  const place = enrichPlace(rawPlace)
  const [favorite, setFavorite] = useState(place.is_favorite ?? false)
  const [showShare, setShowShare] = useState(false)

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

      {/* ── Hero ── */}
      <div className="pp-hero">
        <img src={place.photo_url || place.photo} alt={place.name} className="pp-hero-img" />
        <div className="pp-hero-overlay" />

        {/* Top bar */}
        <div className="pp-hero-topbar">
          {/* Back – right side (RTL) */}
          <button className="pp-hero-btn" onClick={onBack} aria-label="חזרה">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>

          {/* Left actions */}
          <div className="pp-hero-actions">
            {/* Share */}
            <button className="pp-hero-btn" onClick={() => setShowShare(true)} aria-label="שתפי">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </button>

            {/* Favorite */}
            <button
              className={`pp-hero-btn pp-hero-btn--fav ${favorite ? 'pp-hero-btn--fav-active' : ''}`}
              onClick={() => setFavorite(v => !v)}
              aria-label="מועדפים"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Hero title */}
        <div className="pp-hero-info">
          <div className="pp-hero-chips">
            {mealTypes.map(m => <span key={m} className="pp-hero-chip">{m}</span>)}
          </div>
          <h1 className="pp-hero-name">{place.name}</h1>

          {/* Experience badge */}
          {place.experience_type && (() => {
            const ExpIcon = EXPERIENCE_ICONS[place.experience_type]
            return (
              <div className="pp-exp-badge">
                {ExpIcon && <ExpIcon size={11} strokeWidth={2} />}
                <span>{EXPERIENCE_LABELS[place.experience_type]}</span>
              </div>
            )
          })()}

          <p className="pp-hero-address">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }}>
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {place.address}
          </p>
        </div>
      </div>

      <div className="pp-body">

        {/* ── The Take ── */}
        {(place.personal_note || place.added_note) && (
          <section className="pp-section">
            <p className="pp-section-label">The Take</p>
            <p className="pp-take">"{place.personal_note || place.added_note}"</p>
          </section>
        )}

        {/* ── Score – per meal type bubbles ── */}
        {scoredTypes.length > 0 && (
          <section className="pp-section pp-section--score">
            <p className="pp-section-label">Score</p>

            {/* Bubble row */}
            <div className="pp-score-bubbles">
              {scoredTypes.map(mt => {
                const s = mealTypeScores[mt]
                const isActive = activeTab === mt
                return (
                  <button
                    key={mt}
                    className={`pp-score-bubble ${isActive ? 'pp-score-bubble--active' : ''}`}
                    onClick={() => setActiveTab(isActive ? null : mt)}
                  >
                    <span className="pp-score-bubble-name">{MEAL_TYPE_LABELS[mt] || mt}</span>
                    <span className="pp-score-bubble-score">
                      <span className="pp-score-bubble-val">{s}</span>
                      <span className="pp-score-bubble-max">/25</span>
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Breakdown for active tab */}
            {activeBreakdown.length > 0 && (
              <div className="pp-score-breakdown">
                <div className="pp-score-bars">
                  {activeBreakdown.map(cat => (
                    <ScoreBar
                      key={cat.key}
                      label={cat.label}
                      optionLabel={cat.optionLabel}
                      value={cat.value}
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
          <p className="pp-section-label">The Practical Stuff</p>
          <div className="pp-practical">
            <PracticalRow
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
              label="Hours" value={place.hours}
            />
            <PracticalRow
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
              label="Price" value={place.price ? PRICE_LABELS[place.price] : null}
            />
            <PracticalRow
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}
              label="Reservation" value={place.need_reservation ? RESERVATION_LABELS[place.need_reservation] : null}
            />
            <PracticalRow
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>}
              label="Parking" value={place.parking === true ? 'Parking available' : place.parking === false ? 'No parking' : null}
            />
            <PracticalRow
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3"/></svg>}
              label="Happy Hour" value={place.happy_hour === true ? 'Yes' : place.happy_hour === false ? 'No' : null}
            />
            <PracticalRow
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>}
              label="Website"
              value={websiteDisplay}
              href={place.website ? (place.website.startsWith('http') ? place.website : `https://${place.website}`) : null}
            />
            <PracticalRow
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
              label="Experience" value={place.experience_type ? EXPERIENCE_LABELS[place.experience_type] : null}
            />
            {lastVisited && (
              <PracticalRow
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                label="Last visit" value={lastVisited}
              />
            )}
          </div>
        </section>

        {/* ── Highlights ── */}
        {place.tags && place.tags.length > 0 && (
          <section className="pp-section">
            <p className="pp-section-label">Highlights</p>
            <div className="pp-highlights">
              {place.tags.map(t => (
                <span key={t} className="pp-highlight-tag">{t}</span>
              ))}
            </div>
          </section>
        )}

        {/* ── Gallery ── */}
        {place.gallery && place.gallery.length > 0 && (
          <section className="pp-section pp-section--last">
            <p className="pp-section-label">תמונות</p>
            <div className="pp-gallery">
              {place.gallery.map((src, i) => (
                <div key={i} className={`pp-gallery-item ${i === 0 ? 'pp-gallery-item--wide' : ''}`}>
                  <img src={src} alt="" className="pp-gallery-img" loading="lazy" />
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ── Share sheet ── */}
      {showShare && (
        <ShareSheet place={place} onClose={() => setShowShare(false)} />
      )}
    </div>
  )
}
