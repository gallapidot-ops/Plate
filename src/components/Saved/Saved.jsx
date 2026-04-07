import { useState } from 'react'
import { MOCK_SAVED_PLACES, MOCK_WISHLIST, MEAL_TYPE_LABELS } from '../../data/mockSavedPlaces'
import PlaceCard from '../PlaceCard/PlaceCard'
import './Saved.css'

/* ─────────────────────────────────────────
   Visited tab
───────────────────────────────────────── */
function VisitedTab({ onOpenPlace }) {
  const [filter, setFilter] = useState('all')
  const allTypes = ['all', ...new Set(MOCK_SAVED_PLACES.flatMap(p => p.meal_types))]
  const filtered = filter === 'all' ? MOCK_SAVED_PLACES : MOCK_SAVED_PLACES.filter(p => p.meal_types.includes(filter))
  const sorted = [...filtered].sort((a, b) => b.computed_score - a.computed_score)

  return (
    <div className="visited-tab">
      <div className="saved-filter-bar">
        {allTypes.map(type => (
          <button key={type} className={`chip chip--sm ${filter === type ? 'chip--active' : ''}`} onClick={() => setFilter(type)}>
            {type === 'all' ? 'הכל' : MEAL_TYPE_LABELS[type]}
          </button>
        ))}
      </div>
      <div className="saved-card-list">
        {sorted.map(place => (
          <PlaceCard
            key={place.id}
            place={place}
            onClick={() => onOpenPlace(place)}
            right={place.is_favorite
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-accent)' }}>
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
   Priority pill
───────────────────────────────────────── */
const PRIORITY_MAP = {
  high:   { label: 'חייבת', color: 'var(--color-accent)' },
  medium: { label: 'רוצה',  color: 'var(--color-accent-light)' },
  low:    { label: 'אולי',   color: 'var(--color-text-muted)' },
}

/* ─────────────────────────────────────────
   Wishlist tab
───────────────────────────────────────── */
function WishlistTab({ onOpenPlace }) {
  const [items, setItems] = useState(MOCK_WISHLIST)
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState(null)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2000) }
  function handleRemove(id) { setItems(p => p.filter(x => x.id !== id)); showToast('הוסר מהרשימה') }
  function handleMarkVisited(id) { setItems(p => p.filter(x => x.id !== id)); showToast('מעולה! עברה למקומות שלי') }

  const filtered = filter === 'all' ? items : items.filter(p => p.priority === filter)

  if (items.length === 0) {
    return (
      <div className="wishlist-empty">
        <div className="wishlist-empty-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        </div>
        <p className="wishlist-empty-title">אין מקומות ברשימה</p>
        <p className="wishlist-empty-sub">גלול במסך הגילוי ושמרי מקומות שמעניינים אותך</p>
      </div>
    )
  }

  return (
    <div className="wishlist-tab">
      {toast && <div className="saved-toast">{toast}</div>}
      <div className="saved-filter-bar">
        {[
          { id: 'all', label: 'הכל' },
          { id: 'high', label: 'חייבת ללכת' },
          { id: 'medium', label: 'רוצה ללכת' },
          { id: 'low', label: 'אולי' },
        ].map(f => (
          <button key={f.id} className={`chip chip--sm ${filter === f.id ? 'chip--active' : ''}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="saved-card-list">
        {filtered.map(place => {
          const pri = PRIORITY_MAP[place.priority]
          return (
            <div key={place.id} className="wish-item-wrap">
              <PlaceCard
                place={{ ...place, computed_score: undefined }}
                onClick={() => onOpenPlace(place)}
                right={
                  <span className="wish-priority-dot" style={{ background: pri.color }} title={pri.label} />
                }
              />
              <div className="wish-actions">
                <button className="wish-action-btn wish-action-btn--visited" onClick={() => handleMarkVisited(place.id)}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  ביקרתי
                </button>
                <button className="wish-action-btn wish-action-btn--remove" onClick={() => handleRemove(place.id)}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  הסירי
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Main
───────────────────────────────────────── */
export default function Saved({ onOpenPlace }) {
  const [tab, setTab] = useState('wishlist')

  return (
    <div className="saved-screen" dir="rtl">
      <div className="saved-header">
        <h1 className="saved-title">שמורים</h1>
        <div className="saved-counts">
          <span className="saved-count-pill">{MOCK_SAVED_PLACES.length} ביקרתי</span>
          <span className="saved-count-pill saved-count-pill--wish">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            {MOCK_WISHLIST.length} ברשימה
          </span>
        </div>
      </div>

      <div className="saved-tabs">
        <button className={`saved-tab-btn ${tab === 'visited' ? 'saved-tab-btn--active' : ''}`} onClick={() => setTab('visited')}>
          ביקרתי
        </button>
        <button className={`saved-tab-btn ${tab === 'wishlist' ? 'saved-tab-btn--active' : ''}`} onClick={() => setTab('wishlist')}>
          רוצה לבקר <span className="saved-tab-badge">5</span>
        </button>
      </div>

      <div className="saved-content">
        {tab === 'visited'  && <VisitedTab  onOpenPlace={onOpenPlace} />}
        {tab === 'wishlist' && <WishlistTab onOpenPlace={onOpenPlace} />}
      </div>
    </div>
  )
}
