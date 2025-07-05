import React, { useRef, useEffect, useState } from 'react';

function FloatingChat({ chat, onSend, userId, participants, typingUser }) {
  const [message, setMessage] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat]);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', background: '#fffbe7' }}>
        {chat.map((msg, i) => {
          const isMe = msg.userId === userId;
          const participant = participants.find(p => p.userId === msg.userId) || {};
          return (
            <div key={i} style={{
              display: 'flex',
              flexDirection: isMe ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              marginBottom: 14,
            }}>
              {/* Avatar */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: isMe ? '#e0b800' : '#ffe066',
                border: '2px solid #e0b800',
                textAlign: 'center',
                lineHeight: '36px',
                fontWeight: 700,
                marginLeft: isMe ? 12 : 0,
                marginRight: isMe ? 0 : 12,
                fontSize: 18,
                color: '#222',
              }}>{(participant.username || msg.userId || '').charAt(0).toUpperCase()}</div>
              {/* Message bubble */}
              <div style={{
                background: isMe ? '#e0b800' : '#fff',
                color: '#222',
                borderRadius: 14,
                padding: '9px 16px',
                maxWidth: 320,
                fontSize: 16,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                marginLeft: isMe ? 0 : 4,
                marginRight: isMe ? 4 : 0,
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                borderTopRightRadius: isMe ? 4 : 14,
                borderTopLeftRadius: isMe ? 14 : 4,
              }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3, color: isMe ? '#222' : '#1e90ff' }}>
                  {isMe ? 'You' : (participant.username || msg.userId)}
                </div>
                <div>{msg.message}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 4, textAlign: 'right' }}>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</div>
              </div>
            </div>
          );
        })}
        {typingUser && (
          <div style={{ fontSize: 14, color: '#888', margin: '8px 0 0 10px' }}>{typingUser} is typing...</div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div style={{ display: 'flex', borderTop: '1px solid #ffe066', padding: 12, background: '#fffbe7' }}>
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Type a message..."
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16 }}
        />
        <button onClick={handleSend} style={{ marginLeft: 10, background: '#ffe066', border: 'none', borderRadius: 8, padding: '7px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>Send</button>
      </div>
    </div>
  );
}

export default FloatingChat; 