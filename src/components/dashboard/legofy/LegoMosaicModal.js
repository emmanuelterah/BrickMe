import React from 'react';

function LegoMosaicModal({ showMosaic, mosaicData, handleDownloadPNG, handleDownloadPDF, setShowMosaic }) {
  if (!showMosaic) return null;
  return (
    <div className="lego-mosaic-modal">
      <div className="lego-mosaic-modal-content">
        <h3>Your LEGO Mosaic</h3>
        <img src={mosaicData.mosaicUrl} alt="LEGO Mosaic Preview" className="lego-mosaic-img" />
        <div className="lego-mosaic-actions">
          <button className="lego-btn" onClick={handleDownloadPNG}>
            Download PNG
          </button>
          <button className="lego-btn blue" onClick={handleDownloadPDF}>
            Download PDF
          </button>
        </div>
        <h5>Parts List (Color Count)</h5>
        <ul className="lego-mosaic-partslist">
          {mosaicData.partsList.map((part, i) => (
            <li key={i}><span style={{ background: `rgb(${part.rgb[0]},${part.rgb[1]},${part.rgb[2]})`, display: 'inline-block', width: 18, height: 18, borderRadius: 4, marginRight: 8, border: '1px solid #ccc' }}></span>{part.name} — {part.count}</li>
          ))}
        </ul>
        <button className="lego-mosaic-close" onClick={() => setShowMosaic(false)}>Close</button>
      </div>
    </div>
  );
}

export default LegoMosaicModal; 