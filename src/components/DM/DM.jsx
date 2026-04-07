import { useState } from 'react'
import { MOCK_CONVERSATIONS, MOCK_FRIENDS, MEAL_TYPE_LABELS } from '../../data/mockSocial'
import './DM.css'

function PlaceMessageCard({ place }) {
  return (
    <div className="dm-place-card">
      <div className="dm-place-card-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <div className="dm-place-card-info">
        <span className="dm-place-card-name">{place.name}</span>
        <div className="dm-place-card-meta">
          <span className="dm-place-card-meal">{MEAL_TYPE_LABELS[place.meal_type]}</span>
          <span className="dm-place-card-score">{place.score}/25</span>
        </div>
      </div>
    </div>
  )
}

function ChatScreen({ conv, friend, onBack }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(conv.messages)

  function send() {
    if (!input.trim()) return
    setMessages(m => [...m, { id: Date.now(), from: 'me', text: input.trim(), time: 'עכשיו' }])
    setInput('')
  }

  return (
    <div className="chat-screen" dir="rtl">
      <div className="chat-header">
        <button className="chat-back" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
        <img src={friend.avatar} alt={friend.name} className="chat-header-avatar" />
        <span className="chat-header-name">{friend.name}</span>
      </div>

      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-msg-wrap ${msg.from === 'me' ? 'chat-msg-wrap--me' : ''}`}>
            {msg.type === 'place' ? (
              <PlaceMessageCard place={msg.place} />
            ) : (
              <div className={`chat-bubble ${msg.from === 'me' ? 'chat-bubble--me' : 'chat-bubble--them'}`}>
                {msg.text}
              </div>
            )}
            <span className="chat-time">{msg.time}</span>
          </div>
        ))}
      </div>

      <div className="chat-input-bar">
        <input
          className="chat-input"
          type="text"
          placeholder="כתבי הודעה..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          dir="rtl"
        />
        <button
          className="chat-send"
          onClick={send}
          disabled={!input.trim()}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function DM() {
  const [activeConv, setActiveConv] = useState(null)

  if (activeConv) {
    const friend = MOCK_FRIENDS.find(f => f.id === activeConv.with)
    return <ChatScreen conv={activeConv} friend={friend} onBack={() => setActiveConv(null)} />
  }

  return (
    <div className="dm-screen" dir="rtl">
      <div className="dm-header">
        <h1 className="dm-title">הודעות</h1>
      </div>

      <div className="dm-list">
        {MOCK_CONVERSATIONS.map(conv => {
          const friend = MOCK_FRIENDS.find(f => f.id === conv.with)
          return (
            <button
              key={conv.id}
              className="dm-row"
              onClick={() => setActiveConv(conv)}
            >
              <div className="dm-avatar-wrap">
                <img src={friend.avatar} alt={friend.name} className="dm-avatar" />
                {conv.unread > 0 && <span className="dm-unread">{conv.unread}</span>}
              </div>
              <div className="dm-row-body">
                <div className="dm-row-top">
                  <span className="dm-row-name">{friend.name}</span>
                  <span className="dm-row-time">{conv.last_time}</span>
                </div>
                <span className="dm-row-preview">{conv.last_message}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
