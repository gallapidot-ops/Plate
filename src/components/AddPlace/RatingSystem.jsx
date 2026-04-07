import {
  TASTE_OPTIONS,
  SPREAD_OPTIONS,
  AESTHETIC_OPTIONS,
  SERVICE_OPTIONS,
  NEED_RESERVATION_OPTIONS,
  PRICE_OPTIONS,
  computeScore,
} from '../../data/scoring'

const CATEGORIES = [
  {
    key: 'taste',
    label: 'טעם',
    subtitle: 'איך היה האוכל?',
    options: TASTE_OPTIONS,
  },
  {
    key: 'spread',
    label: 'מגוון',
    subtitle: 'כמה אפשרויות יש?',
    options: SPREAD_OPTIONS,
  },
  {
    key: 'aesthetic',
    label: 'אווירה',
    subtitle: 'תחושת המקום',
    options: AESTHETIC_OPTIONS,
  },
  {
    key: 'service',
    label: 'שירות',
    subtitle: 'איך השירות?',
    options: SERVICE_OPTIONS,
  },
]

function RatingRow({ category, rating, mealType, onChange }) {
  const selected = rating[category.key]

  return (
    <div className="rating-category">
      <div className="rating-category-header">
        <span className="rating-category-label">{category.label}</span>
        <span className="rating-category-subtitle">{category.subtitle}</span>
        {mealType && selected && (
          <span className="rating-score">
            +{category.options.find(o => o.id === selected)?.scores[mealType] ?? 0}
          </span>
        )}
      </div>
      <div className="rating-options">
        {category.options.map(opt => (
          <button
            key={opt.id}
            type="button"
            className={`rating-option ${selected === opt.id ? 'rating-option--active' : ''}`}
            onClick={() => onChange(category.key, opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function RatingSystem({ rating, mealType, onChange }) {
  const score = computeScore(rating, mealType)
  const isComplete = rating.taste && rating.spread && rating.aesthetic && rating.service

  return (
    <div className="field-group">
      <div className="rating-header">
        <label className="field-label">דירוג</label>
        {isComplete && mealType && (
          <div className="score-badge">
            <span className="score-value">{score}</span>
            <span className="score-max">/25</span>
          </div>
        )}
      </div>

      {!mealType && (
        <p className="field-hint rating-hint">בחרי סוג ארוחה תחילה כדי לראות את הניקוד</p>
      )}

      <div className="rating-categories">
        {CATEGORIES.map(cat => (
          <RatingRow
            key={cat.key}
            category={cat}
            rating={rating}
            mealType={mealType}
            onChange={onChange}
          />
        ))}
      </div>

      <div className="rating-filters">
        <div className="rating-filter-group">
          <label className="field-label-sm">הזמנה מראש</label>
          <div className="chip-grid chip-grid--sm">
            {NEED_RESERVATION_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                className={`chip chip--sm ${rating.need_reservation === opt.id ? 'chip--active' : ''}`}
                onClick={() => onChange('need_reservation', opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rating-filter-group">
          <label className="field-label-sm">מחיר</label>
          <div className="chip-grid chip-grid--sm">
            {PRICE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                className={`chip chip--sm ${rating.price === opt.id ? 'chip--active' : ''}`}
                onClick={() => onChange('price', opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
