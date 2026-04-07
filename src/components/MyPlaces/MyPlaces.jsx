import { useState } from 'react'
import { MOCK_SAVED_PLACES, MOCK_WISHLIST, MEAL_TYPE_LABELS } from '../../data/mockSavedPlaces'
import PlaceCard from '../PlaceCard/PlaceCard'
import './MyPlaces.css'

/* ─────────────────────────────────────────
   הוספתי tab
───────────────────────────────────────── */
function AddedTab({ onOpenPlace }) {
  const [filter, setFilter] = useState('all')
  const allTypes = ['all', ...new Set(MOCK_SAVED_PLACES.flatMap(p => p.meal_types))]
  const filtered = filter === 'all'
    ? MOCK_SAVED_PLACES
    : MOCK_SAVED_PLACES.filter(p => p.meal_types.includes(filter))
  const sorted = [...filtered].sort((a, b) => b.computed_score - a.computed_score)

  return (
    <div className="mp-tab-content">
      <div className="mp-filter-bar">
        {allTypes.map(type => (
          <button
            key={type}
            className={`chip chip--sm ${filter === type ? 'chip--active' : ''}`}
            onClick={() => setFilter(type)}
          >
            {type === 'all' ? 'הכל' : MEAL_TYPE_LABELS[type]}
          </button>
        ))}
      </div>
      <div className="mp-card-list">
        {sorted.map(place => (
          <PlaceCard
            key={place.id}
            place={place}
            onClick={() => onOpenPlace(place)}
            mealTypeFilter={filter !== 'all' ? filter : undefined}
            right={place.is_favorite
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-accent)', flexShrink: 0 }}>
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              : null}
          />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Priority map
───────────────────────────────────────── */
const PRIORITY = {
  high:   { label: 'חייבת', color: 'var(--color-accent)' },
  medium: { label: 'רוצה',  color: 'var(--color-accent-light)' },
  low:    { label: 'אולי',   color: 'var(--color-text-muted)' },
}

/* ─────────────────────────────────────────
   Wishlist tab
───────────────────────────────────────── */
function WishlistTab({ onOpenPlace, onDiscover }) {
  const [items, setItems] = useState(MOCK_WISHLIST)
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState(null)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2200) }
  function handleRemove(id) { setItems(p => p.filter(x => x.id !== id)); showToast('הוסר מהרשימה') }
  function handleMarkVisited(id) { setItems(p => p.filter(x => x.id !== id)); showToast('מעולה! עברה למקומות שלי') }

  const filtered = filter === 'all' ? items : items.filter(p => p.priority === filter)

  return (
    <div className="mp-tab-content">
      {toast && <div className="mp-toast">{toast}</div>}

      {/* Discover CTA */}
      <div className="mp-discover-banner">
        <div className="mp-discover-text">
          <span className="mp-discover-title">גלי מקומות חדשים</span>
          <span className="mp-discover-sub">Swipe ימינה כדי להוסיף ל-Wishlist</span>
        </div>
        <button className="mp-discover-btn" onClick={onDiscover}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
          Discover
        </button>
      </div>

      {items.length === 0 ? (
        <div className="mp-empty">
          <div className="mp-empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </div>
          <p className="mp-empty-title">Wishlist ריקה</p>
          <p className="mp-empty-sub">לחצי Discover כדי לגלות מקומות שמעניינים אותך</p>
        </div>
      ) : (
        <>
          <div className="mp-filter-bar">
            {[
              { id: 'all',    label: 'הכל' },
              { id: 'high',   label: 'חייבת ללכת' },
              { id: 'medium', label: 'רוצה ללכת' },
              { id: 'low',    label: 'אולי' },
            ].map(f => (
              <button
                key={f.id}
                className={`chip chip--sm ${filter === f.id ? 'chip--active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mp-card-list">
            {filtered.map(place => {
              const pri = PRIORITY[place.priority]
              return (
                <div key={place.id} className="mp-wish-item">
                  <PlaceCard
                    place={{ ...place, computed_score: undefined }}
                    onClick={() => onOpenPlace(place)}
                    right={
                      <span
                        className="mp-priority-dot"
                        style={{ background: pri.color }}
                        title={pri.label}
                      />
                    }
                  />
                  <div className="mp-wish-actions">
                    <button
                      className="mp-action-btn mp-action-btn--visited"
                      onClick={() => handleMarkVisited(place.id)}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                      ביקרתי
                    </button>
                    <button
                      className="mp-action-btn mp-action-btn--remove"
                      onClick={() => handleRemove(place.id)}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18M6 6l12 12"/>
                      </svg>
                      הסירי
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   Main
───────────────────────────────────────── */
export default function MyPlaces({ onOpenPlace, onDiscover }) {
  const [tab, setTab] = useState('added')

  return (
    <div className="mp-screen" dir="rtl">
      {/* Header */}
      <div className="mp-header">
        <h1 className="mp-title">המקומות שלי</h1>
        <div className="mp-counts">
          <span className="mp-count-pill">{MOCK_SAVED_PLACES.length} הוספתי</span>
          <span className="mp-count-pill mp-count-pill--wish">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
            {MOCK_WISHLIST.length} Wishlist
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mp-tabs">
        <button
          className={`mp-tab-btn ${tab === 'added' ? 'mp-tab-btn--active' : ''}`}
          onClick={() => setTab('added')}
        >
          הוספתי
        </button>
        <button
          className={`mp-tab-btn ${tab === 'wishlist' ? 'mp-tab-btn--active' : ''}`}
          onClick={() => setTab('wishlist')}
        >
          Wishlist
          <span className="mp-tab-badge">{MOCK_WISHLIST.length}</span>
        </button>
      </div>

      {/* Content */}
      {tab === 'added'    && <AddedTab   onOpenPlace={onOpenPlace} />}
      {tab === 'wishlist' && <WishlistTab onOpenPlace={onOpenPlace} onDiscover={onDiscover} />}
    </div>
  )
}
