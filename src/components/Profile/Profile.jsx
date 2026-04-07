import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts'
import { Zap, MessageCircle, UtensilsCrossed, Sparkles } from 'lucide-react'
import { HOME_CITY } from '../../data/mockSavedPlaces'
import { getMyPlaces, getWishlist, removeFromWishlist } from '../../lib/db'
import PlaceCard from '../PlaceCard/PlaceCard'
import './Profile.css'

/* ── Experience config ── */
const EXP_LIST = [
  { id: 'quick_light',     label: 'מהיר וקליל', Icon: Zap             },
  { id: 'catchup',         label: 'להיפגש',     Icon: MessageCircle   },
  { id: 'shared_table',    label: 'שולחן משותף', Icon: UtensilsCrossed },
  { id: 'full_experience', label: 'חוויה מלאה',  Icon: Sparkles        },
]

/* ── Chart palette ── */
const C = ['#8B3A62','#A85580','#C98AAD','#D4A5BF','#5C2740','#E4C3D4','#7B2D54','#F0D6E5']

const ME = {
  name: 'גל לפידות',
  username: '@gal',
  avatar: 'https://i.pravatar.cc/150?img=47',
  joined: 'אפריל 2026',
  places: 12,
  followers: 34,
  following: 8,
}

const MOCK_FOLLOWERS = [
  { id: 'f1', username: '@noa.cohen',  name: 'נועה כהן',   avatar: 'https://i.pravatar.cc/150?img=5'  },
  { id: 'f2', username: '@tamar.levi', name: 'תמר לוי',    avatar: 'https://i.pravatar.cc/150?img=9'  },
  { id: 'f3', username: '@dana.m',     name: 'דנה מזרחי',  avatar: 'https://i.pravatar.cc/150?img=20' },
  { id: 'f4', username: '@yael.bar',   name: 'יעל בר-לב',  avatar: 'https://i.pravatar.cc/150?img=33' },
]

const MOCK_FOLLOWING = [
  { id: 'g1', username: '@rina.s',     name: 'רינה שמר',   avatar: 'https://i.pravatar.cc/150?img=44' },
  { id: 'g2', username: '@dana.m',     name: 'דנה מזרחי',  avatar: 'https://i.pravatar.cc/150?img=20' },
  { id: 'g3', username: '@noa.cohen',  name: 'נועה כהן',   avatar: 'https://i.pravatar.cc/150?img=5'  },
]

/* ── Category order (fixed, with bakery+deli merged) ── */
const CAT_ORDER = [
  { key: 'brunch',     keys: ['brunch'],          label: 'ברנץ׳'          },
  { key: 'lunch',      keys: ['lunch'],            label: 'צהריים'         },
  { key: 'dinner',     keys: ['dinner'],           label: 'ארוחת ערב'     },
  { key: 'cafe',       keys: ['cafe'],             label: 'קפה'            },
  { key: 'bakery_deli',keys: ['bakery', 'deli'],   label: 'מאפייה ומעדניה' },
  { key: 'happy_hour', keys: ['happy_hour'],       label: 'האפי אור'      },
]

function buildCatData(places) {
  return CAT_ORDER.map((cat, i) => {
    const filtered = places.filter(p => cat.keys.some(k => p.meal_types.includes(k)))
    if (filtered.length === 0) return null
    const sorted = [...filtered].sort((a, b) => new Date(b.last_visited) - new Date(a.last_visited))
    const avg = Math.round(filtered.reduce((s, p) => s + (p.computed_score ?? 0), 0) / filtered.length)
    return {
      key: cat.key,
      name: cat.label,
      count: filtered.length,
      avg,
      color: C[i % C.length],
      places: sorted,
      lastPhoto: sorted[0]?.photo_url,
    }
  }).filter(Boolean)
}

/* ── City data helper ── */
function buildCityData(places) {
  const cityMap = {}
  places.forEach(p => {
    const city = p.city || HOME_CITY
    if (!cityMap[city]) cityMap[city] = []
    cityMap[city].push(p)
  })
  return Object.entries(cityMap).map(([city, ps]) => ({
    city,
    count: ps.length,
    isHome: city === HOME_CITY,
    places: [...ps].sort((a, b) => new Date(b.last_visited) - new Date(a.last_visited)),
  })).sort((a, b) => (b.isHome ? 1 : 0) - (a.isHome ? 1 : 0) || b.count - a.count)
}

/* ── Donut label ── */
function DonutLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.09) return null
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
      {`${Math.round(percent * 100)}%`}
    </text>
  )
}

/* ── Generic drawer ── */
function ListDrawer({ title, sub, places, onClose, onOpenPlace }) {
  return (
    <>
      <div className="pf-drawer-backdrop" onClick={onClose} />
      <div className="pf-drawer" dir="rtl">
        <div className="pf-drawer-handle" />
        <div className="pf-drawer-header">
          <div className="pf-drawer-header-info">
            <span className="pf-drawer-title">{title}</span>
            {sub && <span className="pf-drawer-sub">{sub}</span>}
          </div>
          <button className="pf-drawer-close" onClick={onClose} aria-label="סגרי">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="pf-drawer-list">
          {places.map(p => (
            <PlaceCard
              key={p.id}
              place={p}
              onClick={() => { onOpenPlace?.(p); onClose() }}
            />
          ))}
        </div>
      </div>
    </>
  )
}

/* ── Settings sheet ── */
const PRIVACY_OPTIONS = [
  { id: 'public',     label: 'ציבורי',     sub: 'כולם רואים את המקומות שלך' },
  { id: 'followers',  label: 'עוקבים בלבד', sub: 'רק אנשים שאישרת' },
  { id: 'private',    label: 'פרטי',       sub: 'רק את' },
]

function SettingsSheet({ onClose }) {
  const [privacy, setPrivacy] = useState('public')

  return (
    <>
      <div className="pf-drawer-backdrop" onClick={onClose} />
      <div className="pf-drawer pf-settings" dir="rtl">
        <div className="pf-drawer-handle" />
        <div className="pf-drawer-header">
          <span className="pf-drawer-title">הגדרות</span>
          <button className="pf-drawer-close" onClick={onClose} aria-label="סגרי">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="pf-settings-list">
          <button className="pf-settings-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <div className="pf-settings-row-info">
              <span className="pf-settings-row-label">עריכת פרופיל</span>
              <span className="pf-settings-row-sub">שם, שם משתמש, תמונה</span>
            </div>
            <svg className="pf-settings-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <div className="pf-settings-group">
            <span className="pf-settings-group-label">פרטיות</span>
            {PRIVACY_OPTIONS.map(opt => (
              <button
                key={opt.id}
                className={`pf-settings-privacy-row ${privacy === opt.id ? 'pf-settings-privacy-row--active' : ''}`}
                onClick={() => setPrivacy(opt.id)}
              >
                <div className="pf-settings-row-info">
                  <span className="pf-settings-row-label">{opt.label}</span>
                  <span className="pf-settings-row-sub">{opt.sub}</span>
                </div>
                {privacy === opt.id && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                )}
              </button>
            ))}
          </div>

          <button className="pf-settings-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <div className="pf-settings-row-info">
              <span className="pf-settings-row-label">עיר בית</span>
              <span className="pf-settings-row-sub">{HOME_CITY}</span>
            </div>
            <svg className="pf-settings-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <button className="pf-settings-row pf-settings-row--danger">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <div className="pf-settings-row-info">
              <span className="pf-settings-row-label">יציאה</span>
            </div>
          </button>
        </div>
      </div>
    </>
  )
}

/* ── Follow list drawer ── */
function FollowListDrawer({ title, users, onClose }) {
  return (
    <>
      <div className="pf-drawer-backdrop" onClick={onClose} />
      <div className="pf-drawer" dir="rtl">
        <div className="pf-drawer-handle" />
        <div className="pf-drawer-header">
          <span className="pf-drawer-title">{title}</span>
          <button className="pf-drawer-close" onClick={onClose} aria-label="סגרי">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="pf-follow-list">
          {users.map(u => (
            <div key={u.id} className="pf-follow-row">
              <img src={u.avatar} alt={u.name} className="pf-follow-avatar" />
              <div className="pf-follow-info">
                <span className="pf-follow-name">{u.name}</span>
                <span className="pf-follow-username" dir="ltr">{u.username}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

/* ── Wishlist card ── */
function WishlistCard({ item, onOpenPlace, onRemove }) {
  const addedByUser = item.added_from && item.added_from !== 'גילוי'
  return (
    <div className="pf-wish-card">
      <button className="pf-wish-card-main" onClick={() => onOpenPlace?.(item)}>
        <img src={item.photo_url} alt={item.name} className="pf-wish-img" />
        <div className="pf-wish-body">
          <div className="pf-wish-top">
            <span className="pf-wish-name">{item.name}</span>
            {item.priority === 'high' && (
              <span className="pf-wish-priority pf-wish-priority--high">⭐ חייבת</span>
            )}
          </div>
          {item.added_note && (
            <span className="pf-wish-note">"{item.added_note}"</span>
          )}
          <span className="pf-wish-meta">
            {addedByUser ? `מומלץ ע"י ${item.added_from}` : 'גילוי'}
          </span>
        </div>
      </button>
      <button className="pf-wish-remove" onClick={() => onRemove?.(item.id)} aria-label="הסר מ-Wishlist">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  )
}

/* ── Main ── */
export default function Profile({ onOpenPlace }) {
  const [profileTab,     setProfileTab]     = useState('main')
  const [expFilter,      setExpFilter]      = useState(null)
  const [activeCatKey,   setActiveCatKey]   = useState(null)
  const [activeCityKey,  setActiveCityKey]  = useState(null)
  const [showSettings,   setShowSettings]   = useState(false)
  const [showCharts,     setShowCharts]     = useState(false)
  const [followDrawer,   setFollowDrawer]   = useState(null)

  /* ── Live data from Supabase ── */
  const [places,      setPlaces]      = useState([])
  const [wishlist,    setWishlist]    = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [ps, wl] = await Promise.all([getMyPlaces(), getWishlist()])
        if (!cancelled) { setPlaces(ps); setWishlist(wl) }
      } catch (e) {
        console.warn('[Profile] load error:', e)
      } finally {
        if (!cancelled) setDataLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function handleRemoveWishlist(placeId) {
    try {
      await removeFromWishlist(placeId)
      setWishlist(prev => prev.filter(item => item.id !== placeId))
    } catch (e) {
      console.error('[Profile] removeFromWishlist:', e)
    }
  }

  /* ── Derived data ── */
  const expData = EXP_LIST.map(exp => ({
    ...exp,
    count:  places.filter(p => p.experience_type === exp.id).length,
    places: places.filter(p => p.experience_type === exp.id),
  })).filter(e => e.count > 0)

  const filteredPlaces = expFilter
    ? places.filter(p => p.experience_type === expFilter)
    : places

  const catData    = buildCatData(filteredPlaces)
  const cityData   = buildCityData(places)
  const activeCat  = catData.find(c => c.key === activeCatKey) ?? null
  const activeCity = cityData.find(c => c.city === activeCityKey) ?? null

  const filteredRecent = [...filteredPlaces]
    .sort((a, b) => new Date(b.last_visited) - new Date(a.last_visited))
    .slice(0, 5)

  function toggleExpFilter(id) {
    setExpFilter(prev => prev === id ? null : id)
    setActiveCatKey(null)
  }

  return (
    <div className="pf-screen" dir="rtl">

      {/* ════ Header ════ */}
      <div className="pf-header">
        <img src={ME.avatar} alt={ME.name} className="pf-avatar" />
        <div className="pf-header-info">
          <div className="pf-name-row">
            <h1 className="pf-name">{ME.name}</h1>
            <span className="pf-username" dir="ltr">{ME.username}</span>
          </div>
          <div className="pf-meta-row">
            <span className="pf-meta-item">{places.length} מקומות</span>
            <span className="pf-meta-dot">·</span>
            <button className="pf-meta-btn" onClick={() => setFollowDrawer('followers')}>
              {ME.followers} עוקבים
            </button>
            <span className="pf-meta-dot">·</span>
            <button className="pf-meta-btn" onClick={() => setFollowDrawer('following')}>
              {ME.following} עוקב אחרי
            </button>
            <span className="pf-meta-dot">·</span>
            <span className="pf-meta-item pf-meta-joined">חבר מ{ME.joined}</span>
          </div>
        </div>
        <button className="pf-gear-btn" onClick={() => setShowSettings(true)} aria-label="הגדרות">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>

      {/* ════ Main / Wishlist tabs ════ */}
      <div className="pf-tabs">
        <button
          className={`pf-tab ${profileTab === 'main' ? 'pf-tab--active' : ''}`}
          onClick={() => setProfileTab('main')}
        >
          המקומות שלי
        </button>
        <button
          className={`pf-tab ${profileTab === 'wishlist' ? 'pf-tab--active' : ''}`}
          onClick={() => setProfileTab('wishlist')}
        >
          Wishlist
          <span className="pf-tab-badge">{wishlist.length}</span>
        </button>
      </div>

      {/* ════ WISHLIST TAB ════ */}
      {profileTab === 'wishlist' && (
        <div className="pf-wishlist">
          {dataLoading ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px 20px', fontFamily: 'var(--font-sans)', fontSize: 14 }}>
              טוענת...
            </p>
          ) : wishlist.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px 20px', fontFamily: 'var(--font-sans)', fontSize: 14 }}>
              אין מקומות ב-Wishlist עדיין
            </p>
          ) : wishlist.map(item => (
            <WishlistCard key={item.id} item={item} onOpenPlace={onOpenPlace} onRemove={handleRemoveWishlist} />
          ))}
        </div>
      )}

      {/* ════ MAIN TAB ════ */}
      {profileTab === 'main' && (
        <>
          {dataLoading && (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px 20px', fontFamily: 'var(--font-sans)', fontSize: 14 }}>
              טוענת מקומות...
            </p>
          )}

          {/* ── Experience filter chips ── */}
          {!dataLoading && expData.length > 0 && (
            <div className="pf-exp-filters">
              {expData.map(exp => {
                const { Icon } = exp
                return (
                  <button
                    key={exp.id}
                    className={`pf-exp-chip${expFilter === exp.id ? ' pf-exp-chip--active' : ''}`}
                    onClick={() => toggleExpFilter(exp.id)}
                  >
                    <Icon size={13} strokeWidth={1.6} />
                    <span>{exp.label}</span>
                    <span className="pf-exp-chip-count">{exp.count}</span>
                  </button>
                )
              })}
              {expFilter && (
                <button className="pf-exp-chip-clear" onClick={() => setExpFilter(null)}>
                  ✕ הכל
                </button>
              )}
            </div>
          )}

          {/* ── Category highlights ── */}
          {catData.length > 0 && (
            <section className="pf-section">
              <p className="pf-section-label">קטגוריות</p>
              <div className="pf-bubbles-scroll">
                {catData.map(cat => (
                  <button
                    key={cat.key}
                    className={`pf-bubble ${activeCatKey === cat.key ? 'pf-bubble--active' : ''}`}
                    onClick={() => setActiveCatKey(cat.key)}
                  >
                    <div className="pf-bubble-img-wrap" style={{ borderColor: cat.color }}>
                      <img src={cat.lastPhoto} alt={cat.name} className="pf-bubble-img" />
                    </div>
                    <span className="pf-bubble-name">{cat.name}</span>
                    <span className="pf-bubble-count" style={{ background: cat.color }}>{cat.count}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ── Cities ── */}
          <section className="pf-section">
            <p className="pf-section-label">ערים</p>
            <div className="pf-cities-scroll">
              {cityData.map(cd => (
                <button
                  key={cd.city}
                  className={`pf-city-bubble ${activeCityKey === cd.city ? 'pf-city-bubble--active' : ''} ${cd.isHome ? 'pf-city-bubble--home' : ''}`}
                  onClick={() => setActiveCityKey(cd.city)}
                >
                  {cd.isHome && (
                    <svg className="pf-city-home-icon" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                  )}
                  <span className="pf-city-name">{cd.city}</span>
                  <span className="pf-city-count">{cd.count}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Recent visits ── */}
          {filteredRecent.length > 0 && (
            <section className="pf-section">
              <p className="pf-section-label">ביקורים אחרונים</p>
              <div className="pf-recent-scroll">
                {filteredRecent.map(p => (
                  <button key={p.id} className="pf-visit-card" onClick={() => onOpenPlace?.(p)}>
                    <img src={p.photo_url} alt={p.name} className="pf-visit-img" />
                    <div className="pf-visit-info">
                      <span className="pf-visit-name">{p.name}</span>
                      <span className="pf-visit-score">
                        <span className="pf-visit-score-val">{p.computed_score}</span>
                        <span className="pf-visit-score-max">/25</span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ── Charts ── */}
          <section className="pf-section pf-section--chart pf-section--last">
            <button className="pf-charts-toggle" onClick={() => setShowCharts(v => !v)}>
              <span className="pf-section-label" style={{ margin: 0 }}>סטטיסטיקות</span>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: showCharts ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              >
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            {showCharts && catData.length > 0 && (
              <div className="pf-charts-content">
                <p className="pf-chart-sub-label">ציון ממוצע לפי קטגוריה</p>
                {(() => {
                  const sorted = [...catData].sort((a, b) => b.avg - a.avg)
                  return (
                    <div className="pf-bar-wrap">
                      <ResponsiveContainer width="100%" height={sorted.length * 44 + 16}>
                        <BarChart
                          data={sorted}
                          layout="vertical"
                          margin={{ top: 0, right: 0, left: 8, bottom: 0 }}
                          barSize={14}
                        >
                          <XAxis type="number" domain={[0, 25]} hide />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={80}
                            tick={{ fontSize: 12, fill: 'var(--color-text-soft)', fontFamily: 'Inter, sans-serif' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            cursor={{ fill: 'rgba(139,58,98,0.05)' }}
                            formatter={v => [`${v}/25`, 'ציון ממוצע']}
                            contentStyle={{ fontFamily: 'Inter, sans-serif', fontSize: 12, borderRadius: 8, border: '1px solid rgba(139,58,98,0.15)' }}
                            labelStyle={{ fontWeight: 600 }}
                          />
                          <Bar dataKey="avg" radius={[0, 6, 6, 0]}>
                            {sorted.map(entry => <Cell key={entry.key} fill={entry.color} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="pf-bar-labels">
                        {sorted.map((entry, i) => (
                          <div key={entry.key} className="pf-bar-label-row" style={{ top: i * 44 + 16 }}>
                            <span className="pf-bar-label-val" style={{ color: entry.color }}>{entry.avg}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                <p className="pf-chart-sub-label" style={{ marginTop: 24 }}>התפלגות ביקורים</p>
                <div className="pf-donut-wrap">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={catData}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        labelLine={false}
                        label={<DonutLabel />}
                      >
                        {catData.map(entry => <Cell key={entry.key} fill={entry.color} stroke="none" />)}
                      </Pie>
                      <Tooltip
                        formatter={(v, name) => [`${v} מקומות`, name]}
                        contentStyle={{ fontFamily: 'Inter, sans-serif', fontSize: 12, borderRadius: 8, border: '1px solid rgba(139,58,98,0.15)' }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={value => (
                          <span style={{ fontSize: 12, color: 'var(--color-text-soft)', fontFamily: 'Inter, sans-serif' }}>
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </section>

          {/* ── Category drawer ── */}
          {activeCat && (
            <ListDrawer
              title={activeCat.name}
              sub={`${activeCat.count} מקומות · ציון ממוצע ${activeCat.avg}/25`}
              places={activeCat.places}
              onClose={() => setActiveCatKey(null)}
              onOpenPlace={onOpenPlace}
            />
          )}

          {/* ── City drawer ── */}
          {activeCity && (
            <ListDrawer
              title={activeCity.city}
              sub={`${activeCity.count} ${activeCity.count === 1 ? 'מקום' : 'מקומות'}${activeCity.isHome ? ' · עיר בית' : ' · טיול'}`}
              places={activeCity.places}
              onClose={() => setActiveCityKey(null)}
              onOpenPlace={onOpenPlace}
            />
          )}
        </>
      )}

      {/* ════ Settings ════ */}
      {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}

      {/* ════ Follow list drawer ════ */}
      {followDrawer === 'followers' && (
        <FollowListDrawer
          title={`עוקבים (${ME.followers})`}
          users={MOCK_FOLLOWERS}
          onClose={() => setFollowDrawer(null)}
        />
      )}
      {followDrawer === 'following' && (
        <FollowListDrawer
          title={`עוקב אחרי (${ME.following})`}
          users={MOCK_FOLLOWING}
          onClose={() => setFollowDrawer(null)}
        />
      )}

    </div>
  )
}
