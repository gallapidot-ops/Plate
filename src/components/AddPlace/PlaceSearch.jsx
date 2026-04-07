import { useState } from 'react'
import { MOCK_PLACES } from '../../data/scoring'

export default function PlaceSearch({ value, onChange }) {
  const [query, setQuery] = useState(value?.name || '')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)

  function handleInput(e) {
    const q = e.target.value
    setQuery(q)
    if (q.length > 1) {
      setResults(MOCK_PLACES.filter(p => p.name.includes(q) || p.address.includes(q)))
      setOpen(true)
    } else {
      setResults([])
      setOpen(false)
    }
  }

  function select(place) {
    setQuery(place.name)
    setOpen(false)
    onChange(place)
  }

  return (
    <div className="field-group">
      <label className="field-label">שם המקום</label>
      <div className="search-wrap">
        <input
          className="field-input"
          type="text"
          placeholder="חפשי מסעדה, קפה, בר..."
          value={query}
          onChange={handleInput}
          onFocus={() => query.length > 1 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          dir="rtl"
        />
        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      {open && results.length > 0 && (
        <ul className="search-dropdown">
          {results.map(p => (
            <li key={p.id} className="search-result" onMouseDown={() => select(p)}>
              <span className="result-name">{p.name}</span>
              <span className="result-address">{p.address}</span>
            </li>
          ))}
        </ul>
      )}
      {open && results.length === 0 && query.length > 1 && (
        <div className="search-empty">לא נמצאו תוצאות</div>
      )}
      {value && (
        <div className="selected-place">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {value.address}
        </div>
      )}
    </div>
  )
}
