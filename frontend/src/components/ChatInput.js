// ⭐ NEW FILE - Chat Input Component
import React, { useState } from "react";
import "./ChatInput.css";

function ChatInput({ onSendMessage, onTyping }) {
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");

  const handleSend = () => {
    if (message.trim() && username.trim()) {
      onSendMessage(message, username);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    if (username.trim()) {
      onTyping(username);
    }
  };

  return (
    <div className="chat-input-container">
      <input
        type="text"
        className="username-input"
        placeholder="Your name..."
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        className="message-input"
        placeholder="Type a message..."
        value={message}
        onChange={handleMessageChange}
        onKeyPress={handleKeyPress}
      />
      <button
        className="send-button"
        onClick={handleSend}
        disabled={!message.trim() || !username.trim()}
      >
        Send
      </button>
    </div>
  );
}

export default ChatInput;