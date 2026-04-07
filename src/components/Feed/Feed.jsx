import { useState } from 'react'
import { MOCK_FEED, MOCK_FRIENDS, MEAL_TYPE_LABELS } from '../../data/mockSocial'
import PlaceCard from '../PlaceCard/PlaceCard'
import './Feed.css'

function UserMeta({ item }) {
  const user = MOCK_FRIENDS.find(f => f.id === item.user)
  return (
    <div className="feed-meta">
      <img src={user.avatar} alt={user.name} className="feed-meta-avatar" />
      <span className="feed-meta-name">{user.name}</span>
      <span className="feed-meta-ago">{item.ago}</span>
    </div>
  )
}

export default function Feed({ onOpenPlace }) {
  return (
    <div className="feed" dir="rtl">
      <div className="feed-header">
        <h1 className="feed-title">מה חברים גילו</h1>
        <p className="feed-subtitle">מקומות שחברים הוסיפו לאחרונה</p>
      </div>

      <div className="feed-list">
        {MOCK_FEED.map(item => (
          <div key={item.id} className="feed-item-wrap">
            <PlaceCard
              place={{
                ...item.place,
                photo_url: item.photo,
                meal_types: [item.meal_type],
                computed_score: item.score,
                tags: item.tags,
                personal_note: item.note,
              }}
              meta={<UserMeta item={item} />}
              onClick={() => onOpenPlace?.({
                ...item.place,
                photo_url: item.photo,
                meal_types: [item.meal_type],
                computed_score: item.score,
                tags: item.tags,
                personal_note: item.note,
              })}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
