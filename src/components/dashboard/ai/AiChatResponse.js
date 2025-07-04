import React from 'react';

function AiChatResponse({ aiResponse, aiError }) {
  return (
    <>
      {aiError && <div style={{ color: '#e53d00' }}>{aiError}</div>}
      {aiResponse && (
        <div className="ai-chat-response">
          <strong>AI:</strong> {aiResponse}
        </div>
      )}
    </>
  );
}

export default AiChatResponse; 