import React, { useState, useRef, useEffect } from 'react';
import AiAvatar from './VoiceAiAvatar';

const VOICE_OPTIONS = [
  { label: 'The Rock (Male)', gender: 'male', keyword: 'rock', fallback: 'en-US' },
  { label: 'Taylor Swift (Female)', gender: 'female', keyword: 'taylor', fallback: 'en-US' },
];

function findVoice(voices, option) {
  // Try to find a voice matching the keyword or gender
  let match = voices.find(v => v.name.toLowerCase().includes(option.keyword));
  if (!match) {
    match = voices.find(v => v.gender === option.gender);
  }
  if (!match) {
    match = voices.find(v => v.lang === option.fallback);
  }
  return match || voices[0];
}

const getBestVoice = (voices) => {
  // Prefer Google/Microsoft natural voices
  const preferred = [
    'Google US English',
    'Google UK English Female',
    'Microsoft Aria Online (Natural)',
    'Microsoft Jenny Online (Natural)',
    'Microsoft Guy Online (Natural)',
  ];
  for (let name of preferred) {
    const v = voices.find(voice => voice.name === name);
    if (v) return v;
  }
  // Fallback: best en-US/en-GB
  const enVoice = voices.find(v => v.lang && v.lang.startsWith('en'));
  return enVoice || voices[0];
};

const VoiceAiChat = ({ legoAvatar, user }) => {
  const [messages, setMessages] = useState([]); // {role: 'user'|'ai', text: ''}
  const [recording, setRecording] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [voice, setVoice] = useState(null);
  const [voices, setVoices] = useState([]);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const lastAIMessage = messages.filter(m => m.role === 'ai').slice(-1)[0]?.text || '';
  const isFirstRender = useRef(true);
  const [legoMode, setLegoMode] = useState(true);
  const [listening, setListening] = useState(false);
  const [conversationActive, setConversationActive] = useState(false);

  // Load available voices
  useEffect(() => {
    function loadVoices() {
      const voices = window.speechSynthesis.getVoices();
      setVoices(voices);
      setVoice(getBestVoice(voices));
    }
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Start speech recognition (for free-flowing conversation)
  const startRecognition = () => {
    if (aiSpeaking || aiLoading) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => {
        setRecording(true);
        setListening(true);
        console.log('Recognition started');
      };
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setMessages(msgs => [...msgs, { role: 'user', text }]);
        setListening(false);
        handleSendToAI(text);
      };
      recognition.onerror = (event) => {
        setRecording(false);
        setListening(false);
        console.log('Recognition error:', event.error);
      };
      recognition.onend = () => {
        setRecording(false);
        setListening(false);
        console.log('Recognition ended');
      };
      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setListening(false);
      console.log('Recognition start failed:', err);
    }
  };

  // Mic button click: start conversation
  const handleMicClick = () => {
    // If AI is speaking, interrupt it
    if (aiSpeaking) {
      window.speechSynthesis.cancel();
      setAiSpeaking(false);
    }
    setConversationActive(true);
    startRecognition();
  };

  // Stop button click: end conversation
  const handleStopClick = () => {
    setConversationActive(false);
    setListening(false);
    setRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
  };

  // After AI finishes speaking, if conversationActive, restart recognition
  useEffect(() => {
    if (conversationActive && !aiSpeaking && !aiLoading && !listening) {
      // Wait a moment before listening again
      const timeout = setTimeout(() => startRecognition(), 900);
      return () => clearTimeout(timeout);
    }
  }, [aiSpeaking, aiLoading, listening, conversationActive]);

  // Send user message to AI
  const handleSendToAI = async (prompt) => {
    setAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt, legoMode, history: messages }),
      });
      const data = await res.json();
      if (res.ok && data.response) {
        setMessages(msgs => [...msgs, { role: 'ai', text: data.response }]);
        speakAIResponse(data.response);
      } else {
        setMessages(msgs => [...msgs, { role: 'ai', text: data.message || 'AI request failed.' }]);
      }
    } catch (err) {
      setMessages(msgs => [...msgs, { role: 'ai', text: 'AI request failed.' }]);
    }
    setAiLoading(false);
  };

  // Speak AI response (with expressiveness)
  const speakAIResponse = (text) => {
    if (!voice) return;
    setAiSpeaking(true);
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.voice = voice;
    utter.pitch = 1.1; // slightly higher for friendliness
    utter.rate = 1.02; // slightly faster for energy
    utter.onend = () => setAiSpeaking(false);
    synthRef.current.speak(utter);
  };

  // Replay last AI response
  const handleReplay = () => {
    if (lastAIMessage) speakAIResponse(lastAIMessage);
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '80vh',
      background: 'linear-gradient(90deg, #ffe066 0%, #fffbe7 100%)',
      borderRadius: 32,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      margin: '32px auto',
      maxWidth: 1100,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Left: Large Avatar */}
      <div style={{
        flex: '0 0 340px',
        background: 'rgba(255, 224, 102, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {legoAvatar ? (
          <img
            src={legoAvatar}
            alt="LEGO-fied Avatar"
            style={{ width: 220, height: 220, borderRadius: '50%', border: '6px solid #ffe066', boxShadow: '0 4px 32px #ffe06688', objectFit: 'cover', background: '#fffbe7' }}
          />
        ) : (
          <AiAvatar large speaking={aiSpeaking} thinking={aiLoading} />
        )}
        <div style={{ marginTop: 18, fontWeight: 700, fontSize: 22, color: '#e53d00', textAlign: 'center' }}>
          {user?.profile?.name || user?.email || 'You'}
        </div>
      </div>
      {/* Right: Chat Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '48px 32px',
        background: 'rgba(255,255,255,0.85)',
        minHeight: '80vh',
        position: 'relative',
      }}>
        <h3 style={{ fontSize: 32, fontWeight: 800, color: '#222', marginBottom: 16, letterSpacing: 1 }}>Voice AI Chat <span style={{ color: '#e53d00' }}>(Lego Talk!)</span></h3>
        {/* LEGO Mode Toggle */}
        <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', background: '#ffe066', borderRadius: 16, padding: '8px 18px', boxShadow: '0 2px 8px #ffe06655' }}>
          <label style={{ fontWeight: 600, marginRight: 8, color: '#e53d00' }}>LEGO Mode:</label>
          <input
            type="checkbox"
            checked={legoMode}
            onChange={e => setLegoMode(e.target.checked)}
            style={{ width: 22, height: 22 }}
          />
          <span style={{ marginLeft: 8, fontWeight: 600, color: legoMode ? '#e53d00' : '#888' }}>{legoMode ? 'On' : 'Off'}</span>
        </div>
        <div className="voice-ai-chat-bubbles" style={{
          minHeight: 320,
          marginBottom: 24,
          width: '100%',
          maxWidth: 520,
          background: '#fff',
          borderRadius: 24,
          boxShadow: '0 4px 24px #ffe06633',
          padding: '24px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          overflowY: 'auto',
        }}>
          {/* Only show the last two messages: talker and responder */}
          {messages.slice(-2).map((msg, i) => (
            <div
              key={i}
              className={`voice-ai-chat-bubble ${msg.role}`}
              style={{
                background: msg.role === 'user' ? '#e0f7fa' : '#fffbe7',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                borderRadius: 16,
                padding: '12px 20px',
                margin: '4px 0',
                maxWidth: '80%',
                fontWeight: msg.role === 'ai' ? 600 : 400,
                fontSize: 18,
                color: msg.role === 'ai' ? '#e53d00' : '#222',
                boxShadow: msg.role === 'ai' ? '0 2px 8px #ffe06655' : '0 1px 4px #e0f7fa55',
                transition: 'all 0.3s',
              }}
            >
              {msg.text}
            </div>
          ))}
          {aiLoading && <div className="voice-ai-chat-bubble ai" style={{ background: '#fffbe7', alignSelf: 'flex-start', borderRadius: 16, padding: '12px 20px', margin: '4px 0', maxWidth: '80%', fontWeight: 600, fontSize: 18, color: '#e53d00', boxShadow: '0 2px 8px #ffe06655' }}>AI is thinking...</div>}
        </div>
        {/* Microphone Button */}
        <button
          onClick={handleMicClick}
          disabled={aiSpeaking || aiLoading || listening || conversationActive}
          style={{
            fontSize: 36,
            padding: 0,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: listening ? '#ffcf00' : '#e53d00',
            color: '#fff',
            border: 'none',
            cursor: aiSpeaking || aiLoading || listening || conversationActive ? 'not-allowed' : 'pointer',
            boxShadow: listening ? '0 0 0 8px #ffe06655' : '0 2px 8px #e53d00aa',
            marginTop: 12,
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          aria-label="Click to speak"
        >
          <span role="img" aria-label="microphone">🎤</span>
        </button>
        {/* Stop Button */}
        {conversationActive && (
          <button
            onClick={handleStopClick}
            style={{
              fontSize: 18,
              padding: '8px 24px',
              borderRadius: 20,
              background: '#888',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              marginTop: 8,
              marginBottom: 8,
            }}
          >
            ⏹ Stop Conversation
          </button>
        )}
        <div style={{ marginTop: 8, color: '#888', fontStyle: 'italic', minHeight: 24, fontSize: 18 }}>
          {listening
            ? 'Listening...'
            : aiSpeaking
              ? 'AI is speaking...'
              : aiLoading
                ? 'AI is thinking...'
                : conversationActive
                  ? 'Waiting for your turn...'
                  : 'Click the mic to talk'}
        </div>
        <button
          onClick={handleReplay}
          disabled={!lastAIMessage || aiSpeaking}
          style={{ fontSize: 20, padding: '12px 32px', borderRadius: 24, background: '#e53d00', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800, boxShadow: '0 2px 8px #e53d00aa', marginTop: 8 }}
        >
          🔊 Replay AI Response
        </button>
      </div>
    </div>
  );
};

export default VoiceAiChat; 