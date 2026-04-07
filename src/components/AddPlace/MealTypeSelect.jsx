import { MEAL_TYPES } from '../../data/scoring'

export default function MealTypeSelect({ value, onChange }) {
  function toggle(id) {
    if (value.includes(id)) {
      onChange(value.filter(v => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  return (
    <div className="field-group">
      <label className="field-label">סוג ארוחה</label>
      <p className="field-hint">ניתן לבחור יותר מאחד</p>
      <div className="chip-grid">
        {MEAL_TYPES.map(mt => (
          <button
            key={mt.id}
            type="button"
            className={`chip ${value.includes(mt.id) ? 'chip--active' : ''}`}
            onClick={() => toggle(mt.id)}
          >
            {mt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
