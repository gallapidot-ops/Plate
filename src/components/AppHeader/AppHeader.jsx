import './AppHeader.css'

function PlateLogo({ onClick }) {
  const inner = (
    <>
      <div className="ah-logo-mark">
        <svg className="ah-bars-svg" width="93" height="105" viewBox="0 0 93 105" fill="none">
          <rect x="0"  y="55" width="18" height="50"  rx="6" fill="#F5EFE2" fillOpacity="0.35" />
          <rect x="25" y="25" width="18" height="80"  rx="6" fill="#F5EFE2" fillOpacity="0.60" />
          <rect x="50" y="0"  width="18" height="105" rx="6" fill="#F5EFE2" fillOpacity="1.00" />
          <rect x="75" y="35" width="18" height="70"  rx="6" fill="#F5EFE2" fillOpacity="0.60" />
        </svg>
        <div className="ah-baseline" />
      </div>
      <div className="ah-logo-text">
        <div className="ah-wordmark">PLATE</div>
        <div className="ah-tagline">discover · rate · share</div>
      </div>
    </>
  )
  if (onClick) {
    return (
      <button className="ah-logo-btn" onClick={onClick} aria-label="Go to Search" type="button">
        {inner}
      </button>
    )
  }
  return <div className="ah-logo">{inner}</div>
}

export default function AppHeader({ onOpenInbox, notifCount = 0, onGoHome }) {
  return (
    <header className="app-header">
      <PlateLogo onClick={onGoHome} />
      {onOpenInbox && (
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
      )}
    </header>
  )
}
