export default function PhotoPicker({ place, customPhoto, onChange }) {
  const src = customPhoto || place?.photo_url

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onChange(url)
  }

  return (
    <div className="field-group">
      <label className="field-label">תמונה</label>
      <div className="photo-wrap">
        {src ? (
          <div className="photo-preview-wrap">
            <img src={src} alt="תמונת המקום" className="photo-preview" />
            <label className="photo-replace">
              החליפי תמונה
              <input type="file" accept="image/*" onChange={handleFile} hidden />
            </label>
          </div>
        ) : (
          <label className="photo-upload">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
            <span>העלי תמונה</span>
            <input type="file" accept="image/*" onChange={handleFile} hidden />
          </label>
        )}
      </div>
    </div>
  )
}
