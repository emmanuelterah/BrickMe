import React from 'react';

function MosaicSection({ mosaicData, createMosaic }) {
  return (
    <div className="lego-mosaic-section">
      <h3>Mosaic Builder</h3>
      <button className="lego-mosaic-btn" onClick={createMosaic}>Create Mosaic</button>
      {mosaicData.mosaicUrl && (
        <div className="lego-mosaic-preview">
          <img src={mosaicData.mosaicUrl} alt="Mosaic Preview" />
        </div>
      )}
    </div>
  );
}

export default MosaicSection; 