import { useState, useEffect } from 'react'
import {
  getPendingFollowRequests,
  acceptFollowRequest,
  declineFollowRequest,
  getPlaceShareNotifications,
  markNotificationRead,
} from '../../lib/db'
import './Notifications.css'

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Notifications({ onNotifCountChange, onOpenPlace }) {
  const [requests, setRequests] = useState([])
  const [shares,   setShares]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [acting,   setActing]   = useState(new Set()) // request IDs being processed

  useEffect(() => {
    Promise.all([
      getPendingFollowRequests(),
      getPlaceShareNotifications(),
    ]).then(([reqs, shrs]) => {
      setRequests(reqs)
      setShares(shrs)
      setLoading(false)
    })
  }, [])

  // Keep parent badge in sync: pending follow requests + unread shares
  useEffect(() => {
    const unreadShares = shares.filter(s => !s.read).length
    onNotifCountChange?.(requests.length + unreadShares)
  }, [requests.length, shares, onNotifCountChange])

  async function handleAccept(req) {
    if (acting.has(req.id)) return
    setActing(s => new Set(s).add(req.id))
    try {
      await acceptFollowRequest(req.id, req.from_user.id)
      setRequests(r => r.filter(x => x.id !== req.id))
    } catch (e) {
      console.error('[Notifications] accept:', e)
    } finally {
      setActing(s => { const n = new Set(s); n.delete(req.id); return n })
    }
  }

  async function handleDecline(req) {
    if (acting.has(req.id)) return
    setActing(s => new Set(s).add(req.id))
    try {
      await declineFollowRequest(req.id)
      setRequests(r => r.filter(x => x.id !== req.id))
    } catch (e) {
      console.error('[Notifications] decline:', e)
    } finally {
      setActing(s => { const n = new Set(s); n.delete(req.id); return n })
    }
  }

  async function handleShareRead(share) {
    if (!share.read) {
      try {
        await markNotificationRead(share.id)
        setShares(s => s.map(x => x.id === share.id ? { ...x, read: true } : x))
      } catch (e) {
        console.error('[Notifications] markRead:', e)
      }
    }
    if (onOpenPlace && share.place?.id) {
      onOpenPlace(share.place)
    }
  }

  const totalCount = requests.length + shares.length

  return (
    <div className="notifications">
      <div className="notifications-header">
        <h1 className="notifications-title">Notifications</h1>
      </div>

      {loading ? (
        <p className="notifications-empty">Loading…</p>
      ) : totalCount === 0 ? (
        <div className="notifications-empty-wrap">
          <p className="notifications-empty">No pending notifications</p>
        </div>
      ) : (
        <div className="notifications-list">

          {/* ── Follow requests ── */}
          {requests.map(req => {
            const user = req.from_user
            const busy = acting.has(req.id)
            return (
              <div key={req.id} className="notif-card">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="notif-avatar" />
                ) : (
                  <div className="notif-avatar notif-avatar--placeholder">
                    {(user?.username || '?')[0].toUpperCase()}
                  </div>
                )}

                <div className="notif-body">
                  <p className="notif-text">
                    <strong>{user?.name || user?.username}</strong> wants to follow you
                  </p>
                  <p className="notif-meta">
                    @{user?.username} · {timeAgo(req.created_at)}
                  </p>
                </div>

                <div className="notif-actions">
                  <button
                    className="notif-accept-btn"
                    onClick={() => handleAccept(req)}
                    disabled={busy}
                  >
                    {busy ? '…' : 'Accept'}
                  </button>
                  <button
                    className="notif-decline-btn"
                    onClick={() => handleDecline(req)}
                    disabled={busy}
                  >
                    Decline
                  </button>
                </div>
              </div>
            )
          })}

          {/* ── Place shares ── */}
          {shares.map(share => {
            const user  = share.from_user
            const place = share.place
            return (
              <div
                key={share.id}
                className={`notif-card notif-card--share${share.read ? '' : ' notif-card--unread'}`}
                onClick={() => handleShareRead(share)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleShareRead(share)}
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="notif-avatar" />
                ) : (
                  <div className="notif-avatar notif-avatar--placeholder">
                    {(user?.username || '?')[0].toUpperCase()}
                  </div>
                )}

                <div className="notif-body">
                  <p className="notif-text">
                    <strong>{user?.name || user?.username}</strong>{' '}
                    {share.message ?? 'שיתפה איתך מקום'}
                  </p>
                  {place && (
                    <p className="notif-place-name">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }}>
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {place.name}
                    </p>
                  )}
                  <p className="notif-meta">
                    @{user?.username} · {timeAgo(share.created_at)}
                  </p>
                </div>

                {!share.read && <div className="notif-unread-dot" />}
              </div>
            )
          })}

        </div>
      )}
    </div>
  )
}
