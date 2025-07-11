import React, { useState, useRef } from 'react';
import { FaUpload, FaImage, FaCog, FaPlay } from 'react-icons/fa';
import useApi from '../../../hooks/useApi';

function MosaicSessionCreator({ onCreateSession, onCancel }) {
  const [referenceImage, setReferenceImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [gridWidth, setGridWidth] = useState(32);
  const [gridHeight, setGridHeight] = useState(32);
  const [tileSize, setTileSize] = useState(20);
  const [sessionName, setSessionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();
  const { post } = useApi();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }

    setReferenceImage(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateSession = async () => {
    if (!referenceImage) {
      setError('Please upload a reference image');
      return;
    }

    if (!sessionName.trim()) {
      setError('Please enter a session name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('referenceImage', referenceImage);
      formData.append('gridWidth', gridWidth);
      formData.append('gridHeight', gridHeight);
      formData.append('tileSize', tileSize);
      formData.append('sessionName', sessionName);
      const { ok, data } = await post('/api/mosaic', formData, { formData: true });
      if (ok) {
        onCreateSession(data._id);
      } else {
        setError(data?.message || 'Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const presetGrids = [
    { name: 'Small (16×16)', width: 16, height: 16, tileSize: 25 },
    { name: 'Medium (32×32)', width: 32, height: 32, tileSize: 20 },
    { name: 'Large (48×48)', width: 48, height: 48, tileSize: 15 },
    { name: 'Wide (48×32)', width: 48, height: 32, tileSize: 18 },
    { name: 'Tall (32×48)', width: 32, height: 48, tileSize: 18 },
  ];

  return (
    <div style={{
      background: '#fffbe7',
      borderRadius: 12,
      padding: 24,
      maxWidth: 600,
      margin: '0 auto',
      border: '2px solid #ffe066',
    }}>
      <h2 style={{ 
        marginBottom: 24, 
        color: '#222', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12 
      }}>
        <FaImage color="#e0b800" />
        Create Mosaic Session
      </h2>

      {/* Session Name */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#222' }}>
          Session Name
        </label>
        <input
          type="text"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          placeholder="Enter session name..."
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #ffe066',
            borderRadius: 8,
            fontSize: 16,
            background: '#fff',
          }}
        />
      </div>

      {/* Reference Image Upload */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#222' }}>
          Reference Image
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed #ffe066',
            borderRadius: 8,
            padding: 40,
            textAlign: 'center',
            cursor: 'pointer',
            background: '#fff',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.borderColor = '#e0b800'}
          onMouseLeave={(e) => e.target.style.borderColor = '#ffe066'}
        >
          {imagePreview ? (
            <div>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: 200, 
                  borderRadius: 8,
                  marginBottom: 12
                }} 
              />
              <div style={{ color: '#666' }}>Click to change image</div>
            </div>
          ) : (
            <div>
              <FaUpload size={48} color="#ffe066" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 18, color: '#666', marginBottom: 8 }}>
                Click to upload reference image
              </div>
              <div style={{ fontSize: 14, color: '#999' }}>
                Supports JPG, PNG, GIF (max 5MB)
              </div>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* Grid Settings */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#222' }}>
          <FaCog style={{ marginRight: 8 }} />
          Grid Settings
        </label>
        
        {/* Preset Grids */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Quick Presets:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {presetGrids.map((preset, index) => (
              <button
                key={index}
                onClick={() => {
                  setGridWidth(preset.width);
                  setGridHeight(preset.height);
                  setTileSize(preset.tileSize);
                }}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ffe066',
                  borderRadius: 6,
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: 12,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => e.target.style.background = '#ffe066'}
                onMouseLeave={(e) => e.target.style.background = '#fff'}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Grid Settings */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#666', marginBottom: 4 }}>
              Width
            </label>
            <input
              type="number"
              value={gridWidth}
              onChange={(e) => setGridWidth(parseInt(e.target.value) || 32)}
              min="8"
              max="64"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ffe066',
                borderRadius: 6,
                fontSize: 14,
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#666', marginBottom: 4 }}>
              Height
            </label>
            <input
              type="number"
              value={gridHeight}
              onChange={(e) => setGridHeight(parseInt(e.target.value) || 32)}
              min="8"
              max="64"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ffe066',
                borderRadius: 6,
                fontSize: 14,
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#666', marginBottom: 4 }}>
              Tile Size
            </label>
            <input
              type="number"
              value={tileSize}
              onChange={(e) => setTileSize(parseInt(e.target.value) || 20)}
              min="10"
              max="40"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ffe066',
                borderRadius: 6,
                fontSize: 14,
              }}
            />
          </div>
        </div>

        {/* Grid Preview */}
        <div style={{ marginTop: 12, fontSize: 14, color: '#666' }}>
          Grid: {gridWidth}×{gridHeight} | Total tiles: {gridWidth * gridHeight} | 
          Canvas size: {gridWidth * tileSize}×{gridHeight * tileSize}px
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 20,
          border: '1px solid #ffcdd2',
        }}>
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '12px 24px',
            border: '2px solid #ffe066',
            borderRadius: 8,
            background: 'transparent',
            color: '#222',
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 600,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.background = '#ffe066'}
          onMouseLeave={(e) => e.target.style.background = 'transparent'}
        >
          Cancel
        </button>
        <button
          onClick={handleCreateSession}
          disabled={loading || !referenceImage || !sessionName.trim()}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: 8,
            background: loading || !referenceImage || !sessionName.trim() ? '#ccc' : '#e0b800',
            color: '#222',
            cursor: loading || !referenceImage || !sessionName.trim() ? 'not-allowed' : 'pointer',
            fontSize: 16,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!loading && referenceImage && sessionName.trim()) {
              e.target.style.background = '#f9b800';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && referenceImage && sessionName.trim()) {
              e.target.style.background = '#e0b800';
            }
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: 16,
                height: 16,
                border: '2px solid #222',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              Creating...
            </>
          ) : (
            <>
              <FaPlay size={14} />
              Create Session
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default MosaicSessionCreator; 