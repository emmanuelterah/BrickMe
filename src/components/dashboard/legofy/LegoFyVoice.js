import React from 'react';

function LegoFyVoice({ recording, handleStartRecording, liveTranscript, voiceText, voiceError }) {
  return (
    <div className="lego-fy-voice-row">
      <div className="lego-fy-avatar-container">
        <span className={`lego-fy-avatar ${recording ? 'speaking' : ''}`} role="img" aria-label="avatar">
          🦄
        </span>
      </div>
      <button
        className={`lego-fy-mic ${recording ? 'recording' : ''}`}
        onClick={handleStartRecording}
        disabled={recording}
        type="button"
      >
        <span className="lego-fy-mic-icon">🎤</span>
        {recording ? ' Recording...' : ' Speak Instructions'}
      </button>
      <div className="lego-fy-voice-texts">
        {recording && (
          <span className="lego-fy-live-transcript">{liveTranscript}</span>
        )}
        {voiceText && !recording && (
          <span className="lego-fy-voice-text">{voiceText}</span>
        )}
        {voiceError && <span className="lego-fy-voice-error">{voiceError}</span>}
      </div>
    </div>
  );
}

export default LegoFyVoice; 