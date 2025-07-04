import React, { useState } from 'react';
import LegoMinifigCustomizer from './LegoMinifigCustomizer';

function LegoFyResult({ legoImage, createMosaic }) {
  if (!legoImage) return null;
  return (
    <div className="lego-fy-result">
      <h4>Your LEGO-fied Minifig Avatar:</h4>
      <LegoMinifigCustomizer faceImage={legoImage} />
      <button className="lego-mosaic-btn" onClick={createMosaic}>Create Mosaic</button>
    </div>
  );
}

export default LegoFyResult; 