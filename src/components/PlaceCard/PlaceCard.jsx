import { getDisplayScore } from '../../data/scoring'
import './PlaceCard.css'

const MEAL_TYPE_LABELS = {
  cafe: 'Café', brunch: 'Brunch', lunch: 'Lunch', dinner: 'Dinner',
  bakery_deli: 'Bakery & Deli', drinks: 'Drinks',
  /* legacy */ bakery: 'Bakery', deli: 'Deli', happy_hour: 'Happy Hour',
}

/**
 * Compact place card – max ~80px height.
 * Props:
 *   place          – place object (with optional .ratings for per-type scoring)
 *   onClick        – open PlacePage
 *   mealTypeFilter – if provided, display score for this meal type specifically
 *   right          – optional right-side slot (JSX)
 *   meta           – optional extra line below name (e.g. user row for Feed)
 */
export default function PlaceCard({ place, onClick, mealTypeFilter, right, meta }) {
  const photo = place.photo_url || place.photo
  const score = getDisplayScore(place, mealTypeFilter)
  const mealTypes = place.meal_types
    ? place.meal_types.map(m => MEAL_TYPE_LABELS[m]).filter(Boolean)
    : place.meal_type
      ? [MEAL_TYPE_LABELS[place.meal_type]].filter(Boolean)
      : []
  const tags = place.tags ?? []

  return (
    <button className="pc-row" onClick={onClick} type="button">
      {/* Thumbnail */}
      <div className="pc-thumb-wrap">
        {photo
          ? <img src={photo} alt={place.name} className="pc-thumb" />
          : <div className="pc-thumb pc-thumb--placeholder">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
        }
      </div>

      {/* Main content */}
      <div className="pc-body">
        {meta && <div className="pc-meta">{meta}</div>}
        <div className="pc-name-row">
          <span className="pc-name">{place.name}</span>
          {score !== null && (
            <span className="pc-score">
              <span className="pc-score-val">{score}</span>
              <span className="pc-score-max">/25</span>
            </span>
          )}
        </div>
        {mealTypes.length > 0 && (
          <div className="pc-sub">{mealTypes.join(' · ')}</div>
        )}
        {tags.length > 0 && (
          <div className="pc-tags">
            {tags.slice(0, 3).map(t => (
              <span key={t} className="pc-tag">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Right slot */}
      {right && <div className="pc-right">{right}</div>}

      {/* Chevron */}
      <svg className="pc-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6"/>
      </svg>
    </button>
  )
}
