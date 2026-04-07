export default function DateVisit({ value, visitedOften, onChange, onToggleOften }) {
  return (
    <div className="field-group">
      <label className="field-label">תאריך ביקור</label>
      <input
        className="field-input"
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={visitedOften}
        dir="rtl"
      />
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={visitedOften}
          onChange={e => onToggleOften(e.target.checked)}
        />
        <span>ביקרתי כאן הרבה פעמים</span>
      </label>
    </div>
  )
}
