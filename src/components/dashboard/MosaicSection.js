import React, { useRef } from 'react';

function MosaicSection({
  uploadedImage,
  uploadedFileName,
  handleImageChange,
  createMosaic,
  mosaicData,
  showMosaic,
  handleDownloadPNG,
  handleDownloadPDF,
  setShowMosaic,
  mosaicLoading,
}) {
  const fileInputRef = useRef();

  return (
    <div className="lego-mosaic-section">
      <h3>Mosaic Builder</h3>
      <div style={{ marginBottom: 16 }}>
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <button
          className="lego-mosaic-btn"
          onClick={() => fileInputRef.current.click()}
          disabled={mosaicLoading}
        >
          {uploadedFileName ? 'Change Image' : 'Upload Image'}
        </button>
        {uploadedFileName && (
          <span style={{ marginLeft: 12 }}>{uploadedFileName}</span>
        )}
      </div>
      {uploadedImage && (
        <div style={{ marginBottom: 16 }}>
          <img
            src={typeof uploadedImage === 'string' ? uploadedImage : URL.createObjectURL(uploadedImage)}
            alt="Uploaded Preview"
            style={{ maxWidth: 180, maxHeight: 180, borderRadius: 8, border: '1px solid #eee' }}
          />
        </div>
      )}
      <button
        className="lego-mosaic-btn"
        onClick={createMosaic}
        disabled={!uploadedImage || mosaicLoading}
        style={{ marginBottom: 24 }}
      >
        {mosaicLoading ? 'Creating Mosaic...' : 'Create Mosaic'}
      </button>
      {mosaicLoading && (
        <div style={{ margin: '16px 0' }}>
          <div className="lego-mosaic-spinner" style={{ display: 'inline-block', width: 32, height: 32, border: '4px solid #eee', borderTop: '4px solid #f9b800', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
        </div>
      )}
      {showMosaic && mosaicData.mosaicUrl && (
        <div className="lego-mosaic-preview" style={{ marginTop: 24 }}>
          <img src={mosaicData.mosaicUrl} alt="Mosaic Preview" style={{ maxWidth: 320, border: '2px solid #eee', borderRadius: 8 }} />
          <div style={{ marginTop: 16 }}>
            <button className="lego-mosaic-btn" onClick={handleDownloadPNG} style={{ marginRight: 8 }}>Download PNG</button>
            <button className="lego-mosaic-btn" onClick={handleDownloadPDF}>Download PDF</button>
            <button className="lego-mosaic-btn" style={{ marginLeft: 8 }} onClick={() => setShowMosaic(false)}>Back</button>
          </div>
          <div style={{ marginTop: 24, textAlign: 'left' }}>
            <h4>LEGO Parts List</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {mosaicData.partsList.map((part, idx) => (
                <li key={idx} style={{ marginBottom: 6, display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    display: 'inline-block',
                    width: 18,
                    height: 18,
                    background: `rgb(${part.rgb[0]},${part.rgb[1]},${part.rgb[2]})`,
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    marginRight: 8
                  }} />
                  <span>{part.name} — {part.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default MosaicSection; 