import { useState, useEffect } from 'react'
import { getPendingFollowRequests, acceptFollowRequest, declineFollowRequest } from '../../lib/db'
import './Notifications.css'

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Notifications({ onNotifCountChange }) {
  const [requests, setRequests] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [acting,   setActing]   = useState(new Set()) // request IDs being processed

  useEffect(() => {
    getPendingFollowRequests().then(data => {
      setRequests(data)
      setLoading(false)
    })
  }, [])

  // Keep parent badge in sync
  useEffect(() => {
    onNotifCountChange?.(requests.length)
  }, [requests.length, onNotifCountChange])

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

  return (
    <div className="notifications">
      <div className="notifications-header">
        <h1 className="notifications-title">Notifications</h1>
      </div>

      {loading ? (
        <p className="notifications-empty">Loading…</p>
      ) : requests.length === 0 ? (
        <div className="notifications-empty-wrap">
          <p className="notifications-empty">No pending notifications</p>
        </div>
      ) : (
        <div className="notifications-list">
          {requests.map(req => {
            const user  = req.from_user
            const busy  = acting.has(req.id)
            return (
              <div key={req.id} className="notif-card">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="notif-avatar"
                  />
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
        </div>
      )}
    </div>
  )
}
