import { useState, useRef } from 'react'
import { Zap, MessageCircle, UtensilsCrossed, Sparkles } from 'lucide-react'
import { addPlaceToWishlist } from '../../lib/db'
import './Home.css'

const EXPERIENCE_CARDS = [
  { id: 'quick_light',     label: 'מהיר וקליל', Icon: Zap             },
  { id: 'catchup',         label: 'להיפגש',     Icon: MessageCircle   },
  { id: 'shared_table',    label: 'שולחן משותף', Icon: UtensilsCrossed },
  { id: 'full_experience', label: 'חוויה מלאה',  Icon: Sparkles        },
]

const MEAL_TYPES = [
  { id: 'cafe',       label: 'קפה',          en: 'Café',        img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80' },
  { id: 'bakery',     label: 'מאפייה',       en: 'Bakery',      img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80' },
  { id: 'deli',       label: 'דלי',          en: 'Deli',        img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80' },
  { id: 'brunch',     label: 'ברנץ׳',        en: 'Brunch',      img: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80' },
  { id: 'lunch',      label: 'צהריים',       en: 'Lunch',       img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80' },
  { id: 'happy_hour', label: 'האפי אור',    en: 'Happy Hour',  img: 'https://images.unsplash.com/photo-1575023782549-62ca0d244b39?w=800&q=80' },
  { id: 'dinner',     label: 'ארוחת ערב',   en: 'Dinner',      img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80' },
  { id: 'drinks',     label: 'שתייה',       en: 'Drinks',      img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
]

const EXPERIENCES = [
  { id: 'quick_light',    label: 'מהיר וקליל' },
  { id: 'catchup',        label: 'לפגוש / לשוחח' },
  { id: 'shared_table',   label: 'שולחן משותף' },
  { id: 'full_experience',label: 'חוויה מלאה' },
]

const TAGS = [
  { id: 'kosher',         label: 'כשר' },
  { id: 'pet_friendly',   label: 'ידידותי לכלבים' },
  { id: 'celebration',    label: 'חגיגה' },
  { id: 'date',           label: 'דייט' },
  { id: 'business',       label: 'פגישת עסקים' },
  { id: 'healthy',        label: 'בריא' },
  { id: 'brunch_buffet',  label: 'בופה ברנץ׳' },
  { id: 'large_group',    label: 'מתאים ל-6+' },
  { id: 'nice_view',      label: 'נוף יפה' },
  { id: 'outdoor',        label: 'ישיבת חוץ בלבד' },
  { id: 'vegan',          label: 'ידידותי לטבעונים' },
  { id: 'work_friendly',  label: 'מתאים לעבודה' },
  { id: 'romantic',       label: 'רומנטי' },
  { id: 'group_friendly', label: 'מתאים לקבוצות' },
]

const PRICES = [
  { id: 'overpriced',        label: 'יקר מדי' },
  { id: 'fair',              label: 'הגיוני' },
  { id: 'great_value',       label: 'תמורה מצוינת' },
  { id: 'worth_every_penny', label: 'שווה כל שקל' },
]

const RESERVATIONS = [
  { id: 'grab_go',   label: 'ללא ישיבה' },
  { id: 'walk_in',   label: 'כניסה חופשית' },
  { id: 'weekends',  label: 'הזמנה בסופ"ש' },
  { id: 'required',  label: 'הזמנה חובה' },
]

function MealCard({ item, active, onClick }) {
  return (
    <div
      className={`meal-card ${active ? 'meal-card--active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <img src={item.img} alt={item.label} className="meal-card-img" />
      <div className="meal-card-overlay" />
      <div className="meal-card-content">
        <span className="meal-card-en">{item.en}</span>
        <span className="meal-card-he">{item.label}</span>
      </div>
      {active && <div className="meal-card-check">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
      </div>}
    </div>
  )
}

function Drawer({ open, onClose, filters, setFilters }) {
  if (!open) return null

  function toggleTag(id) {
    setFilters(f => ({
      ...f,
      tags: f.tags.includes(id) ? f.tags.filter(t => t !== id) : [...f.tags, id],
    }))
  }

  function setSingle(key, id) {
    setFilters(f => ({ ...f, [key]: f[key] === id ? null : id }))
  }

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer" dir="rtl">
        <div className="drawer-handle" />

        <div className="drawer-scroll">
          {/* Experience */}
          <div className="drawer-section">
            <h3 className="drawer-section-title">סוג חוויה</h3>
            <div className="drawer-chips">
              {EXPERIENCES.map(exp => (
                <button
                  key={exp.id}
                  type="button"
                  className={`chip ${filters.experience === exp.id ? 'chip--active' : ''}`}
                  onClick={() => setSingle('experience', exp.id)}
                >
                  {exp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="drawer-section">
            <h3 className="drawer-section-title">תגיות</h3>
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
            <h3 className="drawer-section-title">מחיר</h3>
            <div className="drawer-chips">
              {PRICES.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`chip ${filters.price === p.id ? 'chip--active' : ''}`}
                  onClick={() => setSingle('price', p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reservation */}
          <div className="drawer-section">
            <h3 className="drawer-section-title">הזמנה מראש</h3>
            <div className="drawer-chips">
              {RESERVATIONS.map(r => (
                <button
                  key={r.id}
                  type="button"
                  className={`chip ${filters.reservation === r.id ? 'chip--active' : ''}`}
                  onClick={() => setSingle('reservation', r.id)}
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
            onClick={() => setFilters(f => ({ ...f, experience: null, tags: [], price: null, reservation: null }))}
          >
            נקה הכל
          </button>
          <button type="button" className="btn-primary" onClick={onClose}>
            סגור
          </button>
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────
   Mock users for People tab
───────────────────────────────────────── */
const MOCK_USERS = [
  { id: 'u1', username: '@noa.cohen',  name: 'נועה כהן',    avatar: 'https://i.pravatar.cc/150?img=5',  places: 12, following: false },
  { id: 'u2', username: '@tamar.levi', name: 'תמר לוי',     avatar: 'https://i.pravatar.cc/150?img=9',  places: 8,  following: true  },
  { id: 'u3', username: '@dana.m',     name: 'דנה מזרחי',   avatar: 'https://i.pravatar.cc/150?img=20', places: 21, following: false },
  { id: 'u4', username: '@yael.bar',   name: 'יעל בר-לב',   avatar: 'https://i.pravatar.cc/150?img=33', places: 5,  following: true  },
  { id: 'u5', username: '@rina.s',     name: 'רינה שמר',    avatar: 'https://i.pravatar.cc/150?img=44', places: 17, following: false },
]

function PeopleTab() {
  const [query,   setQuery]   = useState('')
  const [follows, setFollows] = useState(
    Object.fromEntries(MOCK_USERS.map(u => [u.id, u.following]))
  )

  const results = query.trim()
    ? MOCK_USERS.filter(u =>
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        u.name.includes(query)
      )
    : MOCK_USERS

  function toggleFollow(id) {
    setFollows(f => ({ ...f, [id]: !f[id] }))
  }

  return (
    <div className="home-people">
      <div className="home-people-search-wrap">
        <svg className="home-people-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          className="home-people-input"
          placeholder="חפשי לפי @username"
          value={query}
          onChange={e => setQuery(e.target.value)}
          dir="rtl"
        />
        {query && (
          <button className="home-people-clear" onClick={() => setQuery('')} aria-label="נקה">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      <div className="home-people-list">
        {results.length === 0 ? (
          <p className="home-people-empty">לא נמצאו משתמשים</p>
        ) : results.map(user => (
          <div key={user.id} className="home-people-card">
            <img src={user.avatar} alt={user.name} className="home-people-avatar" />
            <div className="home-people-info">
              <span className="home-people-name">{user.name}</span>
              <span className="home-people-meta" dir="ltr">{user.username}</span>
              <span className="home-people-places">{user.places} מקומות</span>
            </div>
            <button
              className={`home-people-follow-btn ${follows[user.id] ? 'home-people-follow-btn--following' : ''}`}
              onClick={() => toggleFollow(user.id)}
            >
              {follows[user.id] ? 'עוקבת' : 'עקבי'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Mock search results ── */
const MOCK_RESULTS = {
  mine: [
    { id: 'r1', name: 'לחמים', address: 'המלאכה 3, תל אביב', photo_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', computed_score: 21, experience_type: 'quick_light' },
    { id: 'r2', name: 'קפה נמרוד', address: 'שינקין 45, תל אביב', photo_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80', computed_score: 18, experience_type: 'catchup' },
  ],
  social: [
    { id: 'r1', name: 'לחמים', address: 'המלאכה 3, תל אביב', photo_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', computed_score: 21, experience_type: 'quick_light' },
    { id: 'r3', name: 'ארקפה', address: 'דיזנגוף 99, תל אביב', photo_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80', computed_score: 20, experience_type: 'catchup' },
    { id: 'r4', name: 'בוקה', address: 'רוטשילד 22, תל אביב', photo_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', computed_score: 23, experience_type: 'full_experience' },
  ],
  explore: [
    { id: 'r1', name: 'לחמים', address: 'המלאכה 3, תל אביב', photo_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', computed_score: 21, experience_type: 'quick_light' },
    { id: 'r3', name: 'ארקפה', address: 'דיזנגוף 99, תל אביב', photo_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80', computed_score: 20, experience_type: 'catchup' },
    { id: 'r4', name: 'בוקה', address: 'רוטשילד 22, תל אביב', photo_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', computed_score: 23, experience_type: 'full_experience' },
    { id: 'r5', name: 'הבית של שולמית', address: 'דיזנגוף 160, תל אביב', photo_url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400&q=80', computed_score: 19, experience_type: 'catchup' },
    { id: 'r6', name: 'טרטין', address: 'מונטיפיורי 5, תל אביב', photo_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', computed_score: 22, experience_type: 'quick_light' },
  ],
}

const RESULTS_TABS = [
  { id: 'mine',    label: 'המקומות שלי' },
  { id: 'social',  label: 'אני + עוקבים' },
  { id: 'explore', label: 'Explore' },
]

const EXP_LABELS = {
  quick_light:     'מהיר וקליל',
  catchup:         'להיפגש',
  shared_table:    'שולחן משותף',
  full_experience: 'חוויה מלאה',
}

function ResultsPanel({ mealType, onBack }) {
  const [activeTab,       setActiveTab]       = useState('mine')
  const [savedToWishlist, setSavedToWishlist] = useState(new Set()) // place names
  const [savingWishlist,  setSavingWishlist]  = useState(new Set()) // in-flight saves
  const results    = MOCK_RESULTS[activeTab] || []
  const mealLabel  = MEAL_TYPES.find(m => m.id === mealType)?.label || ''

  async function handleBookmark(place) {
    if (savedToWishlist.has(place.name) || savingWishlist.has(place.name)) return
    setSavingWishlist(prev => new Set(prev).add(place.name))
    try {
      await addPlaceToWishlist({ name: place.name, address: place.address, photo_url: place.photo_url })
      setSavedToWishlist(prev => new Set(prev).add(place.name))
    } catch (e) {
      console.error('[Home] addPlaceToWishlist:', e)
    } finally {
      setSavingWishlist(prev => { const s = new Set(prev); s.delete(place.name); return s })
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
          <span className="home-results-count">{results.length} מקומות</span>
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
        {results.length === 0 ? (
          <p className="home-results-empty">אין תוצאות בקטגוריה הזו</p>
        ) : results.map(place => {
          const isSaved   = savedToWishlist.has(place.name)
          const isSaving  = savingWishlist.has(place.name)
          return (
            <div key={place.id} className="home-result-card">
              <img src={place.photo_url} alt={place.name} className="home-result-img" />
              <div className="home-result-body">
                <span className="home-result-name">{place.name}</span>
                <span className="home-result-addr">{place.address}</span>
                {place.experience_type && (
                  <span className="home-result-exp">{EXP_LABELS[place.experience_type]}</span>
                )}
              </div>
              {place.computed_score && (
                <div className="home-result-score">
                  <span className="home-result-score-val">{place.computed_score}</span>
                  <span className="home-result-score-max">/25</span>
                </div>
              )}
              <button
                className={`home-result-bookmark${isSaved ? ' home-result-bookmark--saved' : ''}`}
                onClick={() => handleBookmark(place)}
                disabled={isSaving || isSaved}
                aria-label={isSaved ? 'נשמר ב-Wishlist' : 'הוסיפי ל-Wishlist'}
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
  const [tab,        setTab]        = useState('places')
  const [mealType,   setMealType]   = useState(null)
  const [location,   setLocation]   = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [filters, setFilters] = useState({
    experience: null,
    tags: [],
    price: null,
    reservation: null,
  })
  const scrollRef = useRef(null)

  const activeCount = [
    filters.experience,
    filters.price,
    filters.reservation,
    ...filters.tags,
  ].filter(Boolean).length

  function handleSearch() {
    if (!mealType) return
    setShowResults(true)
    onSearch?.({ mealType, location, ...filters })
  }

  if (showResults) {
    return <ResultsPanel mealType={mealType} onBack={() => setShowResults(false)} />
  }

  return (
    <div className="home" dir="rtl">
      {/* Header */}
      <div className="home-header">
        <h1 className="home-title">
          <span className="home-title-plate">Plate</span>
        </h1>
        <p className="home-subtitle">איפה הולכים היום?</p>
      </div>

      {/* Sub-tabs */}
      <div className="home-subtabs">
        <button
          className={`home-subtab ${tab === 'places' ? 'home-subtab--active' : ''}`}
          onClick={() => setTab('places')}
        >מקומות</button>
        <button
          className={`home-subtab ${tab === 'people' ? 'home-subtab--active' : ''}`}
          onClick={() => setTab('people')}
        >אנשים</button>
      </div>

      {/* People tab */}
      {tab === 'people' && <PeopleTab />}

      {/* Places tab content */}
      {tab === 'places' && <>

      {/* Meal type label */}
      <div className="meal-section-label">
        <span className="field-label">סוג ארוחה</span>
        {mealType && (
          <span className="meal-selected-badge">
            {MEAL_TYPES.find(m => m.id === mealType)?.label}
          </span>
        )}
      </div>

      {/* Meal type swipe strip */}
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
        {/* Fade indicators */}
        <div className="meal-strip-fade meal-strip-fade--right" />
        <div className="meal-strip-fade meal-strip-fade--left" />
      </div>

      {/* Core Experience – quick inline picker */}
      <div className="home-section">
        <label className="field-label">סוג חוויה</label>
        <div className="home-exp-row">
          {EXPERIENCE_CARDS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={`home-exp-card${filters.experience === id ? ' home-exp-card--active' : ''}`}
              onClick={() => setFilters(f => ({ ...f, experience: f.experience === id ? null : id }))}
            >
              <Icon size={17} strokeWidth={1.5} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="home-section">
        <label className="field-label">מיקום</label>
        <div className="location-wrap">
          <svg className="location-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <input
            className="field-input location-input"
            type="text"
            placeholder="עיר, שכונה, רחוב..."
            value={location}
            onChange={e => setLocation(e.target.value)}
            dir="rtl"
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
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="6" y2="6"/><line x1="8" x2="20" y1="12" y2="12"/><line x1="12" x2="20" y1="18" y2="18"/>
          </svg>
          פילטרים נוספים
          {activeCount > 0 && <span className="more-btn-badge">{activeCount}</span>}
        </button>

        {activeCount > 0 && (
          <div className="active-filters-preview">
            {filters.experience && (
              <span className="active-filter-chip">
                {EXPERIENCES.find(e => e.id === filters.experience)?.label}
              </span>
            )}
            {filters.tags.slice(0, 2).map(t => (
              <span key={t} className="active-filter-chip">
                {TAGS.find(tag => tag.id === t)?.label}
              </span>
            ))}
            {filters.tags.length > 2 && (
              <span className="active-filter-chip">+{filters.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>

      {/* Search CTA */}
      <div className="home-cta">
        <button
          type="button"
          className="search-btn"
          disabled={!mealType}
          onClick={handleSearch}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          חפשי
        </button>
        {!mealType && (
          <p className="search-hint">בחרי סוג ארוחה להמשך</p>
        )}
      </div>

      {/* Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />

      </> /* end Places tab */}
    </div>
  )
}
