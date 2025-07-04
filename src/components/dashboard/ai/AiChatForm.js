import React from 'react';

function AiChatForm({ aiPrompt, setAiPrompt, aiLoading, handleAiChat }) {
  return (
    <form className="ai-chat-form" onSubmit={handleAiChat}>
      <input
        className="ai-chat-input"
        type="text"
        value={aiPrompt}
        onChange={e => setAiPrompt(e.target.value)}
        placeholder="Ask the AI about Lego art..."
        required
      />
      <button className="ai-chat-send" type="submit" disabled={aiLoading}>
        {aiLoading ? '...' : 'Send'}
      </button>
    </form>
  );
}

export default AiChatForm; 