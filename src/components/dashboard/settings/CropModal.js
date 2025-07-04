import React from 'react';
import Cropper from 'react-easy-crop';

function CropModal({ cropModalOpen, cropImage, crop, setCrop, zoom, setZoom, onCropComplete, croppedPreview, handleCropSave, handleCropCancel, avatarUploading, message }) {
  if (!cropModalOpen) return null;
  return (
    <div className="crop-modal" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: 0, borderRadius: 12, position: 'relative', width: 350, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 32px rgba(0,0,0,0.18)' }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 }}>
          <Cropper
            image={cropImage}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          {croppedPreview && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 14, marginBottom: 4 }}>Preview:</div>
              <img src={croppedPreview} alt="Cropped preview" style={{ width: 80, height: 80, borderRadius: '50%' }} />
            </div>
          )}
        </div>
        <div style={{ width: '100%', borderTop: '1px solid #eee', padding: 16, display: 'flex', justifyContent: 'center', background: '#fff', borderRadius: '0 0 12px 12px', position: 'sticky', bottom: 0, zIndex: 2 }}>
          <button onClick={handleCropSave} disabled={avatarUploading} style={{ minWidth: 80 }}>
            {avatarUploading ? 'Uploading...' : 'Save'}
          </button>
          <button onClick={handleCropCancel} disabled={avatarUploading} style={{ marginLeft: 8, minWidth: 80 }}>Cancel</button>
        </div>
        {message && <div style={{ color: message.includes('fail') ? '#e53d00' : 'green', marginTop: 8, textAlign: 'center' }}>{message}</div>}
      </div>
    </div>
  );
}

export default CropModal; 