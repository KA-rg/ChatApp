// 🔄 UPDATED FILE - Remove online users tracking
import React, { useState, useEffect, useRef } from "react";
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
  const deleteTimersRef = useRef({});

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(deleteTimersRef.current).forEach((t) => clearTimeout(t));
      deleteTimersRef.current = {};
    };
  }, []);
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

    // Listen for message deletions from server
    socket.on("messageDeleted", (data) => {
      console.log("⬅️ messageDeleted received:", data);
      const deletedId = String(data.id);
      setMessages((prev) => prev.filter((m) => String(m.id) !== deletedId));

      // If we had a pending delete timer for this id, clear it
      if (deleteTimersRef.current[deletedId]) {
        clearTimeout(deleteTimersRef.current[deletedId]);
        delete deleteTimersRef.current[deletedId];
      }
    });

    // Listen for delete failures
    socket.on("messageDeleteFailed", (data) => {
      console.warn("❌ messageDeleteFailed:", data);
      // Restore pending flag for the message so the user can retry
      const failedId = String(data.id);
      setMessages((prev) => prev.map((m) => (String(m.id) === failedId ? { ...m, pendingDelete: false } : m)));
      // Optional: show alert or UI notification
      // alert(`Could not delete message ${data.id}: ${data.message}`);
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
      socket.off("messageDeleted");
      socket.off("messageDeleteFailed");
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

  // Request delete with confirmation and 5s undo
  const requestDeleteMessage = (id) => {
    // Confirmation
    const ok = window.confirm("Are you sure you want to delete this message?");
    if (!ok) return;

    // Prevent duplicate scheduling
    if (deleteTimersRef.current[id]) return;

    // Mark message as pendingDelete so UI shows undo
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, pendingDelete: true } : m)));

    // Schedule actual delete after 5s
    const timeoutId = setTimeout(async () => {
      console.log("🔁 Performing delete fallback for id:", id);

      // Determine API base (use explicit env if set, otherwise fallback to socket URL)
      const apiBase = (process.env.REACT_APP_API_URL || process.env.REACT_APP_SOCKET_URL || "").replace(/\/$/, "");

      try {
        // First try HTTP DELETE (reliable fallback)
        const url = apiBase ? `${apiBase}/api/messages/${id}` : `/api/messages/${id}`;
        const res = await fetch(url, { method: "DELETE" });
        if (res.ok) {
          console.log("✅ Deleted via HTTP for id:", id);
          // Server will emit 'messageDeleted' which will remove the message from all clients
        } else {
          console.warn("⚠️ HTTP delete failed, falling back to socket for id:", id, res.status);
          console.log("➡️ Emitting deleteMessage for id:", id);
          socket.emit("deleteMessage", { id });
        }
      } catch (err) {
        console.warn("⚠️ HTTP delete error, falling back to socket for id:", id, err.message);
        socket.emit("deleteMessage", { id });
      }

      // Optimistically remove locally (server will also emit messageDeleted)
      setMessages((prev) => prev.filter((m) => String(m.id) !== String(id)));

      delete deleteTimersRef.current[id];
    }, 5000);

    deleteTimersRef.current[id] = timeoutId;
  };

  const undoDelete = (id) => {
    const t = deleteTimersRef.current[id];
    if (t) {
      clearTimeout(t);
      delete deleteTimersRef.current[id];
    }
    // Remove pending flag
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, pendingDelete: false } : m)));
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

      <MessageList
        messages={messages}
        currentUser={currentUser}
        onRequestDelete={requestDeleteMessage}
        onUndoDelete={undoDelete}
      />

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