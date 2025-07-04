import React from 'react';

function LegoFyResult({ legoImage, createMosaic }) {
  if (!legoImage) return null;
  return (
    <div className="lego-fy-result">
      <h4>Your LEGO-fied Image:</h4>
      <img src={legoImage} alt="lego-fied" className="lego-fy-result-img" />
      <button className="lego-mosaic-btn" onClick={createMosaic}>Create Mosaic</button>
    </div>
  );
}

export default LegoFyResult; 