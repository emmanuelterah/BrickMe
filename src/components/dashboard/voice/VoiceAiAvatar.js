import React from 'react';

const AiAvatar = ({ speaking, thinking, large }) => {
  // Large size if 'large' prop is true
  const size = large ? 220 : 64;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ filter: 'drop-shadow(0 4px 24px #ffe06688)' }}>
      {/* Face */}
      <circle cx="32" cy="32" r="30" fill="#ffe066" stroke="#e0b800" strokeWidth="3" />
      {/* LEGO Studs on top */}
      <ellipse cx="16" cy="7" rx="6" ry="3" fill="#fffbe7" stroke="#e0b800" strokeWidth="1.2" />
      <ellipse cx="32" cy="5" rx="7" ry="3.2" fill="#fffbe7" stroke="#e0b800" strokeWidth="1.2" />
      <ellipse cx="48" cy="7" rx="6" ry="3" fill="#fffbe7" stroke="#e0b800" strokeWidth="1.2" />
      {/* Eyes (animated blink) */}
      <ellipse cx="22" cy="28" rx="5" ry={thinking ? 2 : 7} fill="#333" >
        {thinking && <animate attributeName="ry" values="7;2;7" dur="1.2s" repeatCount="indefinite" />}
      </ellipse>
      <ellipse cx="42" cy="28" rx="5" ry={thinking ? 2 : 7} fill="#333" >
        {thinking && <animate attributeName="ry" values="7;2;7" dur="1.2s" repeatCount="indefinite" />}
      </ellipse>
      {/* Eyebrows (change for thinking) */}
      {thinking ? (
        <>
          <rect x="16" y="18" width="12" height="2" rx="1" fill="#333" transform="rotate(-10 22 19)" />
          <rect x="36" y="18" width="12" height="2" rx="1" fill="#333" transform="rotate(10 42 19)" />
        </>
      ) : (
        <>
          <rect x="16" y="18" width="12" height="2" rx="1" fill="#333" />
          <rect x="36" y="18" width="12" height="2" rx="1" fill="#333" />
        </>
      )}
      {/* Mouth (animate for speaking) */}
      {speaking ? (
        <ellipse cx="32" cy="44" rx="14" ry="8" fill="#e53d00">
          <animate attributeName="ry" values="8;14;8" dur="0.4s" repeatCount="indefinite" />
        </ellipse>
      ) : (
        <ellipse cx="32" cy="44" rx="14" ry="5" fill="#e53d00" />
      )}
      {/* LEGO dimples */}
      <circle cx="12" cy="52" r="2.2" fill="#e0b800" />
      <circle cx="54" cy="52" r="2.2" fill="#e0b800" />
    </svg>
  );
};

export default AiAvatar; 