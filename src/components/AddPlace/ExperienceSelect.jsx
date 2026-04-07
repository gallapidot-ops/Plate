import { EXPERIENCE_TYPES } from '../../data/scoring'

export default function ExperienceSelect({ value, onChange }) {
  return (
    <div className="field-group">
      <label className="field-label">סוג חוויה</label>
      <div className="experience-grid">
        {EXPERIENCE_TYPES.map(exp => (
          <button
            key={exp.id}
            type="button"
            className={`experience-card ${value === exp.id ? 'experience-card--active' : ''}`}
            onClick={() => onChange(exp.id)}
          >
            <span className="experience-label">{exp.label}</span>
            <span className="experience-desc">{exp.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
