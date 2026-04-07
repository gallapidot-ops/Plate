import { useState, useRef } from 'react'
import { MOCK_SWIPE_CARDS, MOCK_FRIENDS, MEAL_TYPE_LABELS } from '../../data/mockSocial'
import './Swipe.css'

function SwipeCard({ card, onSwipe, isTop }) {
  const startX = useRef(null)
  const currentX = useRef(0)
  const cardRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [offset, setOffset] = useState(0)

  const friend = MOCK_FRIENDS.find(f => f.id === card.recommended_by)

  function onPointerDown(e) {
    startX.current = e.clientX
    setDragging(true)
    cardRef.current?.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e) {
    if (!dragging || startX.current === null) return
    const dx = e.clientX - startX.current
    currentX.current = dx
    setOffset(dx)
  }

  function onPointerUp() {
    setDragging(false)
    const threshold = 90
    if (currentX.current > threshold) {
      onSwipe('right')
    } else if (currentX.current < -threshold) {
      onSwipe('left')
    } else {
      setOffset(0)
    }
    startX.current = null
    currentX.current = 0
  }

  const rotate = offset * 0.07
  const opacity = Math.max(0, 1 - Math.abs(offset) / 280)
  const rightOpacity = Math.min(1, Math.max(0, offset / 80))
  const leftOpacity  = Math.min(1, Math.max(0, -offset / 80))

  if (!isTop) {
    return (
      <div className="swipe-card swipe-card--behind">
        <img src={card.photo} alt={card.place.name} className="swipe-card-img" />
        <div className="swipe-card-overlay" />
      </div>
    )
  }

  return (
    <div
      ref={cardRef}
      className={`swipe-card swipe-card--top ${dragging ? 'swipe-card--dragging' : ''}`}
      style={{
        transform: `translateX(${offset}px) rotate(${rotate}deg)`,
        opacity,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <img src={card.photo} alt={card.place.name} className="swipe-card-img" />
      <div className="swipe-card-overlay" />

      {/* Action labels */}
      <div className="swipe-label swipe-label--save" style={{ opacity: rightOpacity }}>שמרי</div>
      <div className="swipe-label swipe-label--skip" style={{ opacity: leftOpacity }}>דלגי</div>

      {/* Recommender */}
      {friend && (
        <div className="swipe-recommender">
          <img src={friend.avatar} alt={friend.name} className="swipe-rec-avatar" />
          <span>הומלץ ע"י {friend.name}</span>
        </div>
      )}

      {/* Info */}
      <div className="swipe-info">
        <div className="swipe-info-top">
          <div>
            <h2 className="swipe-place-name">{card.place.name}</h2>
            <p className="swipe-place-address">{card.place.address}</p>
          </div>
          <div className="swipe-score">
            <span className="swipe-score-val">{card.score}</span>
            <span className="swipe-score-max">/25</span>
          </div>
        </div>

        <div className="swipe-meta-row">
          <span className="swipe-meal-chip">{MEAL_TYPE_LABELS[card.meal_type]}</span>
          {card.tags.slice(0, 2).map(t => (
            <span key={t} className="swipe-tag">{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Swipe({ onBack }) {
  const [cards, setCards] = useState(MOCK_SWIPE_CARDS)
  const [wishlist, setWishlist] = useState([])
  const [lastAction, setLastAction] = useState(null)

  function handleSwipe(direction) {
    const [top, ...rest] = cards
    if (direction === 'right') {
      setWishlist(w => [...w, top])
      setLastAction('saved')
    } else {
      setLastAction('skipped')
    }
    setCards(rest)
    setTimeout(() => setLastAction(null), 1400)
  }

  if (cards.length === 0) {
    return (
      <div className="swipe-screen swipe-empty" dir="rtl">
        {onBack && (
          <button className="swipe-back-btn" onClick={onBack} aria-label="חזרה">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
        )}
        <div className="swipe-empty-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <h2 className="swipe-empty-title">סיימת לגלול</h2>
        <p className="swipe-empty-sub">שמרת {wishlist.length} מקומות לרשימה</p>
        <button className="btn-primary" onClick={() => { setCards(MOCK_SWIPE_CARDS); setWishlist([]) }}>
          התחילי מחדש
        </button>
      </div>
    )
  }

  return (
    <div className="swipe-screen" dir="rtl">
      {/* Header */}
      <div className="swipe-header">
        {onBack && (
          <button className="swipe-back-btn" onClick={onBack} aria-label="חזרה">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
        )}
        <h1 className="swipe-title">Discover</h1>
        <div className="swipe-counter">
          {wishlist.length > 0 && (
            <span className="swipe-wishlist-count">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
              {wishlist.length}
            </span>
          )}
          <span className="swipe-remaining">{cards.length} נותרו</span>
        </div>
      </div>

      {/* Toast */}
      {lastAction && (
        <div className={`swipe-toast swipe-toast--${lastAction}`}>
          {lastAction === 'saved' ? 'נשמר לרשימה' : 'דולג'}
        </div>
      )}

      {/* Card stack */}
      <div className="swipe-stack">
        {cards.slice(0, 2).map((card, i) => (
          <SwipeCard
            key={card.id}
            card={card}
            isTop={i === 0}
            onSwipe={handleSwipe}
          />
        ))}
      </div>

      {/* Buttons */}
      <div className="swipe-buttons">
        <button
          className="swipe-btn swipe-btn--skip"
          onClick={() => handleSwipe('left')}
          aria-label="דלגי"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>

        <button
          className="swipe-btn swipe-btn--save"
          onClick={() => handleSwipe('right')}
          aria-label="שמרי"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        </button>
      </div>

      <p className="swipe-hint">החליקי ימינה לשמירה · שמאלה לדילוג</p>
    </div>
  )
}
