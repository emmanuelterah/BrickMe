import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import FloatingChat from './FloatingChat';
import MosaicCanvas from './MosaicCanvas';
import { FaCrown, FaUser, FaUserFriends, FaCopy, FaDownload, FaShare, FaUsers, FaComments, FaCircle, FaInfoCircle } from 'react-icons/fa';
import API_BASE from '../../../api';

// Create socket with authentication
const createSocket = () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  // Connect to backend server (default port 5000)
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  
  return io(backendUrl, { 
    transports: ['websocket'],
    auth: {
      token,
      userId
    }
  });
};

const ROLE_LABELS = { host: 'Host', builder: 'Builder', observer: 'Observer' };
const ROLE_ICONS = { 
  host: <FaCrown color="#e0b800" />, 
  builder: <FaUser color="#1e90ff" />, 
  observer: <FaUserFriends color="#888" /> 
};

function ColorPalette({ colors = [], selectedColor, onColorSelect }) {
  return (
    <div style={{ padding: 16, borderBottom: '1px solid #ffe066' }}>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Color Palette</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {colors.map((color, index) => (
          <div
            key={index}
            onClick={() => onColorSelect(color)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: color,
              border: selectedColor === color ? '3px solid #1e90ff' : '2px solid #ffe066',
              cursor: 'pointer',
              boxShadow: selectedColor === color ? '0 0 8px #1e90ff' : 'none',
              transition: 'all 0.2s ease',
            }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}

function SessionInfo({ session, participants, onCopyLink, copied, tiles = [] }) {
  const myParticipant = participants.find(p => p.userId === session?.hostUserId);
  const [recentActivity, setRecentActivity] = useState(false);
  
  // Calculate dynamic progress based on current tiles
  const completedTiles = tiles.length;
  const totalTiles = session ? session.gridWidth * session.gridHeight : 0;
  const progressPercentage = totalTiles > 0 ? Math.round((completedTiles / totalTiles) * 100) : 0;
  
  // Calculate accuracy based on the session data
  // The backend now calculates accuracy by comparing placed tiles to the reference image
  const accuracy = session?.accuracy || progressPercentage;
  
  // Show activity indicator when tiles change
  useEffect(() => {
    setRecentActivity(true);
    const timer = setTimeout(() => setRecentActivity(false), 1000);
    return () => clearTimeout(timer);
  }, [tiles.length]);
  
  return (
    <div style={{ padding: 16, borderBottom: '1px solid #ffe066', background: '#fffbe7' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Mosaic Session</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCopyLink}
            style={{
              background: copied ? '#4CAF50' : '#ffe066',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FaCopy size={14} />
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>
      
      {session && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
            Reference: {session.referenceImageName || 'Uploaded Image'}
          </div>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
            Grid: {session.gridWidth}×{session.gridHeight} | Progress: {completedTiles}/{totalTiles} tiles
          </div>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Accuracy: {accuracy}%</span>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <FaInfoCircle 
                size={12} 
                color="#666" 
                style={{ cursor: 'help' }}
                title="Accuracy is calculated by comparing your placed tiles to the reference image. It shows how many tiles are in the correct color and position."
              />
            </div>
            <span style={{ marginLeft: 'auto' }}>Status: {session.status}</span>
          </div>
          
          {/* Progress Bar */}
          <div style={{ 
            width: '100%', 
            height: 8, 
            backgroundColor: '#e0e0e0', 
            borderRadius: 4, 
            overflow: 'hidden',
            marginBottom: 8,
            position: 'relative'
          }}>
            <div style={{
              width: `${progressPercentage}%`,
              height: '100%',
              backgroundColor: '#4CAF50',
              transition: 'width 0.3s ease-in-out',
              borderRadius: 4,
              position: 'relative'
            }} />
            {/* Progress bar glow effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${progressPercentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'progressGlow 2s ease-in-out infinite',
              transition: 'width 0.3s ease-in-out'
            }} />
          </div>
          <style>{`
            @keyframes progressGlow {
              0%, 100% { opacity: 0; }
              50% { opacity: 1; }
            }
          `}</style>
          
          {/* Progress Text */}
          <div style={{ fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 8 }}>
            {progressPercentage}% Complete
          </div>
          
          {/* Tile Counter */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: 12, 
            color: '#666',
            padding: '8px 12px',
            backgroundColor: '#f5f5f5',
            borderRadius: 4,
            marginBottom: 8
          }}>
            <span>Tiles Placed: {completedTiles}</span>
            <span>Remaining: {totalTiles - completedTiles}</span>
          </div>
          
          {/* Accuracy Breakdown */}
          {completedTiles > 0 && (
            <div style={{ 
              fontSize: 11, 
              color: '#666',
              padding: '6px 8px',
              backgroundColor: '#e8f5e8',
              borderRadius: 4,
              border: '1px solid #4CAF50'
            }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Accuracy Breakdown:</div>
              <div>• {accuracy}% of placed tiles match the reference image</div>
              <div>• Color tolerance allows for slight variations</div>
              <div>• Higher accuracy = better mosaic quality</div>
            </div>
          )}
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
        <FaUsers color="#666" />
        <span style={{ color: '#666' }}>{participants.length} participants</span>
        {recentActivity && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            <FaCircle 
              size={8} 
              color="#4CAF50" 
              style={{ animation: 'pulse 1s ease-in-out infinite' }}
            />
            <span style={{ fontSize: 12, color: '#4CAF50' }}>Active</span>
          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

function ParticipantsList({ participants, currentUserId }) {
  return (
    <div style={{ padding: 16, borderBottom: '1px solid #ffe066' }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Participants</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {participants.map((participant, index) => {
          const isMe = participant.userId === currentUserId;
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: isMe ? '#ffe066' : '#fff',
                borderRadius: 6,
                border: '1px solid #ffe066',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {ROLE_ICONS[participant.role]}
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  {participant.username || participant.userId}
                </span>
                {isMe && <span style={{ fontSize: 12, color: '#666' }}>(You)</span>}
              </div>
              <div style={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                background: participant.isOnline ? '#4CAF50' : '#ccc',
                marginLeft: 'auto'
              }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [message, onClose]);
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: 40,
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#e53d00',
      color: 'white',
      padding: '14px 28px',
      borderRadius: 10,
      zIndex: 3000,
      fontSize: 16,
      fontWeight: 600,
      boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }}>
      <span>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: 22, cursor: 'pointer', marginLeft: 8 }}>&times;</button>
    </div>
  );
}

function MosaicSessionLobby({ sessionId, userId, onLeave }) {
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [chat, setChat] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#ffd700');
  const [tiles, setTiles] = useState([]);
  const [toast, setToast] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  // Robust session fetcher
  const fetchSession = async (isMounted = true) => {
    try {
      const response = await fetch(`${API_BASE}/api/mosaic/${sessionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (isMounted) {
          setSession(data);
          setParticipants(data.participants || []);
          setChat(data.chatMessages || []);
          setTiles(data.tiles || []); // Always set tiles from backend
          setSelectedColor(data.colorPalette?.[0] || '#ffd700');
        }
      } else {
        if (isMounted) {
          setSession(null);
          setTiles([]);
        }
        onLeave();
      }
    } catch (error) {
      if (isMounted) {
        setSession(null);
        setTiles([]);
      }
      onLeave();
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  // Fetch session on mount and sessionId change
  useEffect(() => {
    if (!sessionId) return;
    let isMounted = true;
    fetchSession(isMounted);
    return () => { isMounted = false; };
  }, [sessionId, onLeave]);

  // Refetch session data when tab regains focus
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchSession(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [sessionId]);

  // Socket connection and event handling
  useEffect(() => {
    if (!sessionId || !userId) return;

    // Join mosaic session
    const socket = createSocket();
    socket.emit('mosaic:join', { sessionId, userId });

    // Listen for user join/leave events
    socket.on('mosaic:user-joined', ({ userId: joinedId }) => {
      if (joinedId !== userId) {
        setToast(`User ${joinedId} joined the session!`);
        fetchSessionData();
      }
    });

    socket.on('mosaic:user-left', ({ userId: leftId }) => {
      if (leftId !== userId) {
        setToast(`User ${leftId} left the session.`);
        fetchSessionData();
      }
    });

    // Listen for tile placement/removal
    socket.on('mosaic:tile-placed', (data) => {
      console.log('Tile placed event received in lobby:', data);
      if (data.tile) {
        setTiles(prev => {
          const existingIndex = prev.findIndex(t => t.x === data.tile.x && t.y === data.tile.y);
          if (existingIndex >= 0) {
            const newTiles = [...prev];
            newTiles[existingIndex] = data.tile;
            return newTiles;
          } else {
            return [...prev, data.tile];
          }
        });
      }
      
      // Update session stats
      if (data.completedTiles !== undefined) {
        setSession(prev => prev ? { ...prev, completedTiles: data.completedTiles, accuracy: data.accuracy } : null);
      }
    });

    socket.on('mosaic:tile-removed', (data) => {
      console.log('Tile removed event received in lobby:', data);
      if (data.x !== undefined && data.y !== undefined) {
        setTiles(prev => prev.filter(t => !(t.x === data.x && t.y === data.y)));
      }
      
      // Update session stats
      if (data.completedTiles !== undefined) {
        setSession(prev => prev ? { ...prev, completedTiles: data.completedTiles, accuracy: data.accuracy } : null);
      }
    });

    // Listen for chat messages
    socket.on('mosaic:chat-message', (msg) => {
      setChat(prev => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId, userId]);

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/mosaic/${sessionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setParticipants(data.participants || []);
        setTiles(data.tiles || []);
        setSession(prev => ({
          ...prev,
          completedTiles: data.completedTiles,
          accuracy: data.accuracy
        }));
      }
    } catch (error) {
      console.error('Error fetching session data:', error);
    }
  };

  // Copy session link
  const handleCopyLink = () => {
    const link = `${window.location.origin}/dashboard?mosaic=${sessionId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Chat send handler
  const handleSendChat = (msg) => {
    const socket = createSocket();
    socket.emit('mosaic:join', { sessionId, userId });
    socket.emit('mosaic:chat', { sessionId, message: msg });
  };

  // Tile placement handlers
  const handleTilePlaced = async (x, y, color) => {
    // Optimistic update
    setTiles(prev => {
      const existingIndex = prev.findIndex(t => t.x === x && t.y === y);
      if (existingIndex >= 0) {
        const newTiles = [...prev];
        newTiles[existingIndex] = { x, y, color, placedBy: userId, placedAt: new Date() };
        return newTiles;
      } else {
        return [...prev, { x, y, color, placedBy: userId, placedAt: new Date() }];
      }
    });

    // Persist to backend and update with backend data
    try {
      const response = await fetch(`${API_BASE}/api/mosaic/${sessionId}/tiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ x, y, color }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the tile with backend data (ensures consistency)
        setTiles(prev => {
          const otherTiles = prev.filter(t => !(t.x === x && t.y === y));
          return [...otherTiles, data.tile];
        });
        // Optionally update session stats if returned
        if (data.completedTiles !== undefined && data.accuracy !== undefined) {
          setSession(prev => prev ? { ...prev, completedTiles: data.completedTiles, accuracy: data.accuracy } : prev);
        }
      } else {
        setToast('Failed to save tile to server.');
        fetchSessionData();
      }
    } catch (err) {
      setToast('Network error: tile not saved.');
      fetchSessionData();
    }
  };

  const handleTileRemoved = (x, y) => {
    // Optimistic update - the socket event will confirm
    setTiles(prev => prev.filter(t => !(t.x === x && t.y === y)));
  };

  // Check if current user is observer
  const myParticipant = participants.find(p => p.userId === userId);
  const isObserver = myParticipant?.role === 'observer';

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        fontSize: 18,
        color: '#666'
      }}>
        Loading mosaic session...
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        fontSize: 18,
        color: '#666'
      }}>
        Session not found
      </div>
    );
  }

  // Debug: Log tiles state before rendering MosaicCanvas
  console.log('Tiles state in Lobby:', tiles);

  return (
    <div style={{ display: 'flex', height: '100vh', minHeight: 0, overflow: 'hidden' }}>
      <Toast message={toast} onClose={() => setToast('')} />
      {/* Mosaic Canvas */}
      <div style={{ flex: 2, background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', minHeight: 0 }}>
        <MosaicCanvas
          sessionId={sessionId}
          userId={userId}
          gridWidth={session.gridWidth}
          gridHeight={session.gridHeight}
          tileSize={session.tileSize}
          tiles={tiles}
          colorPalette={session.colorPalette}
          referenceImage={session.referenceImage}
          selectedColor={selectedColor}
          onTilePlaced={handleTilePlaced}
          onTileRemoved={handleTileRemoved}
          isObserver={isObserver}
          setBanner={setToast}
        />
        {console.log('MosaicCanvas props:', {
          sessionId,
          userId,
          gridWidth: session.gridWidth,
          gridHeight: session.gridHeight,
          tileSize: session.tileSize,
          tilesCount: tiles.length,
          selectedColor,
          isObserver
        })}
      </div>

      {/* Right Panel: Session Info + Color Palette + Participants (no chat) */}
      <div style={{ flex: 1, background: '#fffbe7', display: 'flex', flexDirection: 'column', borderLeft: '2px solid #ffe066', minWidth: 340, height: '100vh', overflowY: 'auto' }}>
        <SessionInfo 
          session={session} 
          participants={participants} 
          onCopyLink={handleCopyLink} 
          copied={copied}
          tiles={tiles}
        />
        
        <ParticipantsList participants={participants} currentUserId={userId} />
        
        <ColorPalette 
          colors={session.colorPalette} 
          selectedColor={selectedColor} 
          onColorSelect={setSelectedColor} 
        />
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setChatOpen(true)}
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 2000,
          background: '#ffe066',
          border: 'none',
          borderRadius: '50%',
          width: 60,
          height: 60,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          cursor: 'pointer',
        }}
        title="Open Chat"
      >
        <FaComments color="#e0b800" />
      </button>

      {/* Chat Modal */}
      {chatOpen && (
        <div style={{
          position: 'fixed',
          bottom: 100,
          right: 32,
          width: 360,
          maxHeight: '60vh',
          background: '#fffbe7',
          border: '2px solid #ffe066',
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          zIndex: 2100,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #ffe066', fontWeight: 700, fontSize: 18 }}>
            Session Chat
            <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#e53d00' }}>&times;</button>
          </div>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <FloatingChat 
              chat={chat} 
              onSend={handleSendChat} 
              userId={userId} 
              participants={participants} 
              typingUser={null} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default MosaicSessionLobby; 