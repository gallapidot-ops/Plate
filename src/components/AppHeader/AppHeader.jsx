import { PlateCircleLogo } from '../Logo/Logo'
import './AppHeader.css'

export default function AppHeader({ onOpenInbox, notifCount = 0, onGoHome }) {
  return (
    <header className="app-header">
      {onGoHome ? (
        <button className="ah-logo-btn" onClick={onGoHome} aria-label="Go to Search" type="button">
          <PlateCircleLogo size={40} circleFill="#E8527A" />
        </button>
      ) : (
        <PlateCircleLogo size={40} circleFill="#E8527A" />
      )}

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
