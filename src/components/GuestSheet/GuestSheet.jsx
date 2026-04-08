import './GuestSheet.css'

export default function GuestSheet({ onSignUp, onDismiss }) {
  return (
    <>
      <div className="gs-backdrop" onClick={onDismiss} />
      <div className="gs-sheet" role="dialog" aria-modal="true">
        <div className="gs-handle" />

        <div className="gs-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </div>

        <h3 className="gs-title">Join Plate</h3>
        <p className="gs-sub">
          Save places, rate your visits, and discover what friends love
        </p>

        <button className="gs-cta" onClick={onSignUp}>
          Sign Up — it's free
        </button>

        <button className="gs-later" onClick={onDismiss}>
          Maybe Later
        </button>
      </div>
    </>
  )
}
