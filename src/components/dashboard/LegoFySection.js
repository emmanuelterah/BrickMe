import React from 'react';
import LegoFyUpload from './legofy/LegoFyUpload';
import LegoFyVoice from './legofy/LegoFyVoice';
import LegoFyResult from './legofy/LegoFyResult';
import LegoMosaicModal from './legofy/LegoMosaicModal';

function LegoFySection({
  uploadedImage,
  uploadedFileName,
  handleImageChange,
  legoSize,
  setLegoSize,
  SUPPORTED_SIZES,
  recording,
  handleStartRecording,
  liveTranscript,
  voiceText,
  voiceError,
  legoLoading,
  handleLegoFy,
  legoImage,
  createMosaic,
  showMosaic,
  mosaicData,
  handleDownloadPNG,
  handleDownloadPDF,
  setShowMosaic
}) {
  return (
    <div className="lego-fy-section">
      <h3>Lego-fy Yourself!</h3>
      <LegoFyUpload
        uploadedImage={uploadedImage}
        uploadedFileName={uploadedFileName}
        handleImageChange={handleImageChange}
      />
      <select
        className="lego-fy-size-select"
        value={legoSize}
        onChange={e => setLegoSize(e.target.value)}
      >
        {SUPPORTED_SIZES.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <LegoFyVoice
        recording={recording}
        handleStartRecording={handleStartRecording}
        liveTranscript={liveTranscript}
        voiceText={voiceText}
        voiceError={voiceError}
      />
      <button
        className="lego-fy-btn"
        onClick={handleLegoFy}
        disabled={!uploadedImage || legoLoading}
        type="button"
      >
        {legoLoading ? 'Lego-fying...' : 'Lego-fy!'}
      </button>
      <LegoFyResult legoImage={legoImage} createMosaic={createMosaic} />
      <LegoMosaicModal
        showMosaic={showMosaic}
        mosaicData={mosaicData}
        handleDownloadPNG={handleDownloadPNG}
        handleDownloadPDF={handleDownloadPDF}
        setShowMosaic={setShowMosaic}
      />
    </div>
  );
}

export default LegoFySection; 