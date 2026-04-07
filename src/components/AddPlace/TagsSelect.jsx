import { TAGS } from '../../data/scoring'

export default function TagsSelect({ value, onChange }) {
  function toggle(id) {
    if (value.includes(id)) {
      onChange(value.filter(v => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  return (
    <div className="field-group">
      <label className="field-label">תגיות</label>
      <div className="chip-grid">
        {TAGS.map(tag => (
          <button
            key={tag.id}
            type="button"
            className={`chip ${value.includes(tag.id) ? 'chip--active' : ''}`}
            onClick={() => toggle(tag.id)}
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  )
}
