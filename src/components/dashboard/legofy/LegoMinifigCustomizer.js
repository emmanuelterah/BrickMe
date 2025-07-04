import React, { useState } from 'react';

const HAIR_STYLES = [
  { label: 'Classic', value: 'classic' },
  { label: 'Short', value: 'short' },
  { label: 'Long', value: 'long' },
  { label: 'Bald', value: 'bald' },
];
const EXPRESSIONS = [
  { label: 'Smile', value: 'smile' },
  { label: 'Serious', value: 'serious' },
  { label: 'Surprised', value: 'surprised' },
  { label: 'Wink', value: 'wink' },
];
const SKIN_COLORS = [
  { label: 'Yellow', value: '#ffe066' },
  { label: 'Light', value: '#f9e4c8' },
  { label: 'Tan', value: '#e0b080' },
  { label: 'Brown', value: '#a86c3c' },
  { label: 'Dark', value: '#5a3b1b' },
];
const HAIR_COLORS = [
  { label: 'Black', value: '#222' },
  { label: 'Brown', value: '#7c4a03' },
  { label: 'Blonde', value: '#ffe066' },
  { label: 'Red', value: '#c1440e' },
  { label: 'Gray', value: '#aaa' },
];

function LegoMinifigCustomizer({ faceImage }) {
  const [hairStyle, setHairStyle] = useState('classic');
  const [expression, setExpression] = useState('smile');
  const [skinColor, setSkinColor] = useState('#ffe066');
  const [hairColor, setHairColor] = useState('#222');

  // TODO: Add cropping UI for faceImage

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 12 }}>
        <label>Hair Style: </label>
        <select value={hairStyle} onChange={e => setHairStyle(e.target.value)}>
          {HAIR_STYLES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <label style={{ marginLeft: 16 }}>Expression: </label>
        <select value={expression} onChange={e => setExpression(e.target.value)}>
          {EXPRESSIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Skin: </label>
        <select value={skinColor} onChange={e => setSkinColor(e.target.value)}>
          {SKIN_COLORS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <label style={{ marginLeft: 16 }}>Hair: </label>
        <select value={hairColor} onChange={e => setHairColor(e.target.value)}>
          {HAIR_COLORS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <svg width="180" height="260" viewBox="0 0 90 130">
        {/* Head */}
        <rect x="20" y="10" width="50" height="40" rx="12" fill={skinColor} stroke="#e0b800" strokeWidth="2" />
        {/* Face overlay (if provided) */}
        {faceImage && (
          <clipPath id="lego-head-clip">
            <rect x="20" y="10" width="50" height="40" rx="12" />
          </clipPath>
        )}
        {faceImage && (
          <image
            href={faceImage}
            x="20" y="10" width="50" height="40"
            clipPath="url(#lego-head-clip)"
            preserveAspectRatio="xMidYMid slice"
          />
        )}
        {/* Eyes and mouth (if no face image) */}
        {!faceImage && <>
          <ellipse cx="35" cy="30" rx="4" ry="5" fill="#333" />
          <ellipse cx="55" cy="30" rx="4" ry="5" fill="#333" />
          {expression === 'smile' && <rect x="40" y="40" width="10" height="3" rx="1.5" fill="#e53d00" />}
          {expression === 'serious' && <rect x="40" y="40" width="10" height="2" rx="1" fill="#333" />}
          {expression === 'surprised' && <ellipse cx="45" cy="42" rx="4" ry="3" fill="#e53d00" />}
          {expression === 'wink' && <>
            <rect x="40" y="40" width="10" height="3" rx="1.5" fill="#e53d00" />
            <rect x="32" y="28" width="8" height="2" rx="1" fill="#333" />
          </>}
        </>}
        {/* Hair (simple shapes for demo) */}
        {hairStyle !== 'bald' && (
          <ellipse cx="45" cy="15" rx="22" ry="10" fill={hairColor} />
        )}
        {hairStyle === 'long' && (
          <ellipse cx="45" cy="25" rx="22" ry="12" fill={hairColor} />
        )}
        {/* Body */}
        <rect x="25" y="50" width="40" height="50" rx="8" fill={skinColor} stroke="#e0b800" strokeWidth="2" />
        {/* Arms */}
        <rect x="10" y="55" width="15" height="35" rx="7" fill={skinColor} stroke="#e0b800" strokeWidth="2" />
        <rect x="65" y="55" width="15" height="35" rx="7" fill={skinColor} stroke="#e0b800" strokeWidth="2" />
        {/* Legs */}
        <rect x="28" y="100" width="12" height="25" rx="4" fill={skinColor} stroke="#e0b800" strokeWidth="2" />
        <rect x="50" y="100" width="12" height="25" rx="4" fill={skinColor} stroke="#e0b800" strokeWidth="2" />
      </svg>
      <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>
        (More hair styles, expressions, and cropping coming soon!)
      </div>
    </div>
  );
}

export default LegoMinifigCustomizer; 