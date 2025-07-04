import React from 'react';
import AiChatForm from './ai/AiChatForm';
import AiChatResponse from './ai/AiChatResponse';

function AiSection({ aiPrompt, setAiPrompt, aiLoading, aiError, aiResponse, handleAiChat }) {
  return (
    <div className="ai-section">
      <AiChatForm
        aiPrompt={aiPrompt}
        setAiPrompt={setAiPrompt}
        aiLoading={aiLoading}
        handleAiChat={handleAiChat}
      />
      <AiChatResponse aiResponse={aiResponse} aiError={aiError} />
    </div>
  );
}

export default AiSection; 