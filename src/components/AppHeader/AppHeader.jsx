import './AppHeader.css'

function PlateLogo() {
  return (
    <div className="ah-logo">
      <div className="ah-logo-mark">
        <svg className="ah-bars-svg" width="93" height="105" viewBox="0 0 93 105" fill="none">
          <rect x="0"  y="55" width="18" height="50"  rx="9" fill="#3D4F7C" fillOpacity="0.40" />
          <rect x="25" y="25" width="18" height="80"  rx="9" fill="#3D4F7C" fillOpacity="0.65" />
          <rect x="50" y="0"  width="18" height="105" rx="9" fill="#3D4F7C" fillOpacity="1.00" />
          <rect x="75" y="35" width="18" height="70"  rx="9" fill="#3D4F7C" fillOpacity="0.65" />
        </svg>
        <div className="ah-baseline" />
      </div>
      <div className="ah-logo-text">
        <div className="ah-wordmark">PLATE</div>
        <div className="ah-tagline">discover · rate · share</div>
      </div>
    </div>
  )
}

export default function AppHeader({ onOpenInbox, notifCount = 0 }) {
  return (
    <header className="app-header">
      <PlateLogo />
      <button
        className="app-header-dm-btn"
        onClick={onOpenInbox}
        aria-label="Messages & notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        {notifCount > 0 && (
          <span className="app-header-badge">{notifCount > 9 ? '9+' : notifCount}</span>
        )}
      </button>
    </header>
  )
}
