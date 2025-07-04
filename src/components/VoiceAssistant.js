import React, { useState } from "react";
import "./VoiceAssistant.css";

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);

  return (
    <div className={`voice-assistant ${listening ? "listening" : ""}`}>
      <button
        className="mic-btn"
        onClick={() => setListening((l) => !l)}
        aria-label="Talk to the AI"
      >
        <span role="img" aria-label="microphone">🎤</span>
      </button>
      <div className="ai-avatar">
        <span role="img" aria-label="lego face">😀</span>
      </div>
      {listening && <div className="ai-bubble">I'm listening! Tell me how to LEGO-fy your art!</div>}
    </div>
  );
} 