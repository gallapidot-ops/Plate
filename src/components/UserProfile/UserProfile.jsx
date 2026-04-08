import { useState, useEffect } from 'react'
import { getProfile } from '../../lib/auth'
import {
  getFollowStatus, getFollowCounts, getPlaceCountByUser,
  followUser, unfollowUser, sendFollowRequest, cancelFollowRequest,
} from '../../lib/db'
import Profile from '../Profile/Profile'
import './UserProfile.css'

function formatJoinDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

export default function UserProfile({ userId, currentUserId, onBack, onOpenPlace, onGuestAction }) {
  const [user,         setUser]         = useState(null)
  const [followStatus, setFollowStatus] = useState('none') // 'none' | 'following' | 'requested'
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 })
  const [placeCount,   setPlaceCount]   = useState(0)
  const [loading,      setLoading]      = useState(true)
  const [acting,       setActing]       = useState(false)

  useEffect(() => {
    Promise.all([
      getProfile(userId),
      getFollowStatus(userId),
      getFollowCounts(userId),
      getPlaceCountByUser(userId),
    ]).then(([profile, status, counts, count]) => {
      setUser(profile)
      setFollowStatus(status)
      setFollowCounts(counts)
      setPlaceCount(count)
      setLoading(false)
    })
  }, [userId])

  const isOwn    = userId === currentUserId
  const canSee   = isOwn
    || user?.privacy_level === 'public'
    || (user?.privacy_level === 'followers' && followStatus === 'following')

  async function handleFollow() {
    if (onGuestAction) { onGuestAction(); return }
    if (acting) return
    setActing(true)
    try {
      if (followStatus === 'following') {
        await unfollowUser(userId)
        setFollowStatus('none')
        setFollowCounts(c => ({ ...c, followers: Math.max(0, c.followers - 1) }))
      } else if (followStatus === 'requested') {
        await cancelFollowRequest(userId)
        setFollowStatus('none')
      } else if (user?.privacy_level === 'public') {
        await followUser(userId)
        setFollowStatus('following')
        setFollowCounts(c => ({ ...c, followers: c.followers + 1 }))
      } else {
        await sendFollowRequest(userId)
        setFollowStatus('requested')
      }
    } catch (e) {
      console.error('[UserProfile] follow action:', e)
    } finally {
      setActing(false)
    }
  }

  function followLabel() {
    if (acting)                    return '…'
    if (followStatus === 'following') return 'Following'
    if (followStatus === 'requested') return 'Requested'
    if (user?.privacy_level === 'public') return 'Follow'
    return 'Send Follow Request'
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="user-profile">
        <div className="user-profile-header">
          <button className="user-profile-back" onClick={onBack}><BackIcon /></button>
        </div>
        <p className="user-profile-loading">Loading…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="user-profile">
        <div className="user-profile-header">
          <button className="user-profile-back" onClick={onBack}><BackIcon /></button>
        </div>
        <p className="user-profile-loading">User not found.</p>
      </div>
    )
  }

  /* ── Full profile — accessible (public or approved follower) ── */
  if (canSee) {
    return (
      <Profile
        viewedProfile={user}
        onBack={onBack}
        onOpenPlace={onOpenPlace}
        onGuestAction={onGuestAction}
      />
    )
  }

  /* ── Locked profile view ── */
  return (
    <div className="user-profile">
      {/* Back */}
      <div className="user-profile-header">
        <button className="user-profile-back" onClick={onBack}><BackIcon /></button>
      </div>

      {/* Hero */}
      <div className="user-profile-hero">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.username}
            className="user-profile-avatar"
          />
        ) : (
          <div className="user-profile-avatar user-profile-avatar--placeholder">
            {(user.username || user.name || '?')[0].toUpperCase()}
          </div>
        )}

        <h2 className="user-profile-name">{user.name || user.username}</h2>
        <p className="user-profile-handle">@{user.username}</p>

        <div className="user-profile-meta-row">
          {user.home_city && <span>{user.home_city}</span>}
          {user.home_city && user.created_at && <span className="user-profile-meta-dot">·</span>}
          {user.created_at && <span>Joined {formatJoinDate(user.created_at)}</span>}
        </div>
      </div>

      <div className="user-profile-locked">
        <div className="user-profile-lock-icon"><LockIcon /></div>

        <p className="user-profile-lock-title">
          {user.privacy_level === 'private'
            ? 'This profile is private'
            : 'Follow to see this profile'}
        </p>
        <p className="user-profile-lock-sub">
          {user.privacy_level === 'private'
            ? 'Only approved followers can see their activity and places.'
            : 'Their places and activity are visible to followers only.'}
        </p>

        {!isOwn && (
          <div className="user-profile-actions">
            <button
              className={`user-profile-follow-btn${followStatus === 'requested' ? ' user-profile-follow-btn--following' : ''}`}
              onClick={handleFollow}
              disabled={acting}
            >
              {followLabel()}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
