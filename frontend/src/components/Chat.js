// 🔄 UPDATED FILE - Remove online users tracking
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import "./Chat.css";

const socket = io(process.env.REACT_APP_SOCKET_URL);

function Chat() {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  // 🗑️ REMOVED - const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    socket.on("message", (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...data, type: "system" },
      ]);
    });

    socket.on("receiveMessage", (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...data, type: "message" },
      ]);
    });

    socket.on("userTyping", (data) => {
      setTypingUser(data.user);
      setTimeout(() => setTypingUser(""), 2000);
    });

    // 🗑️ REMOVED - Online users listener
    // socket.on('onlineUsers', (count) => {
    //   setOnlineUsers(count);
    // });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
      socket.off("receiveMessage");
      socket.off("userTyping");
      // 🗑️ REMOVED - socket.off('onlineUsers');
    };
  }, []);

  const sendMessage = (text, user) => {
    if (text.trim()) {
      if (!currentUser) {
        setCurrentUser(user);
      }
      socket.emit("sendMessage", { text, user });
    }
  };

  const handleTyping = (user) => {
    if (!currentUser && user) {
      setCurrentUser(user);
    }
    socket.emit("typing", { user });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-left">
          <div className="header-icon">💬</div>
          <div className="header-info">
            <h1>Real-Time Chat</h1>
            {/* 🗑️ REMOVED - Online count display */}
          </div>
        </div>
        <div className="status">
          <div
            className={`status-dot ${
              isConnected ? "connected" : "disconnected"
            }`}
          ></div>
          <span>{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>

      <MessageList messages={messages} currentUser={currentUser} />

      {typingUser && typingUser !== currentUser && (
        <div className="typing-indicator">
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span>{typingUser} is typing...</span>
        </div>
      )}

      <ChatInput onSendMessage={sendMessage} onTyping={handleTyping} />
    </div>
  );
}

export default Chat;