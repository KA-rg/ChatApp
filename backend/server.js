// 🔄 UPDATED FILE
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http"); // ⭐ NEW - Import http
const { Server } = require("socket.io"); // ⭐ NEW - Import Socket.io
const { addMessage, deleteMessageById } = require("./controllers/messageControllers"); // ⭐ NEW

dotenv.config();

const app = express();
const server = http.createServer(app); // ⭐ NEW - Create HTTP server
const io = new Server(server, {
  // ⭐ NEW - Create Socket.io instance
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // ⭐ NEW - Serve static files from public folder

// Routes
app.use("/api/messages", require("./routes/messageRoutes"));

// Attach io to app so controllers can emit events on HTTP operations
app.set('io', io);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Chat API Server with Socket.io", // 🔄 UPDATED
    version: "2.0.0", // 🔄 UPDATED
    endpoints: {
      getMessages: "GET /api/messages",
      createMessage: "POST /api/messages",
      deleteMessages: "DELETE /api/messages",
      testClient: "GET /index.html", // ⭐ NEW
    },
  });
});

// ⭐ NEW - Socket.io connection handling
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Send welcome message to connected user
  socket.emit("message", {
    user: "System",
    text: "Welcome to the chat!",
    timestamp: new Date().toISOString(),
  });

  // Notify others that new user joined
  socket.broadcast.emit("message", {
    user: "System",
    text: "A new user has joined the chat",
    timestamp: new Date().toISOString(),
  });

  // Listen for sendMessage event
  socket.on("sendMessage", (data) => {
    console.log("📩 Message received:", data);

    // Add message to database
    const newMessage = addMessage(data);

    // Broadcast message to all connected clients
    io.emit("receiveMessage", newMessage);
  });

  // Listen for typing event
  socket.on("typing", (data) => {
    socket.broadcast.emit("userTyping", data);
  });

  // Listen for delete message request (from clients)
  socket.on("deleteMessage", (data) => {
    console.log("🔔 deleteMessage event received:", data);
    const deleted = deleteMessageById(data.id);
    if (deleted) {
      console.log("✅ Message deleted:", deleted);
      io.emit("messageDeleted", deleted);
    } else {
      console.log("⚠️ Message to delete not found:", data.id);
      // Notify requester that delete failed
      socket.emit("messageDeleteFailed", { id: data.id, message: "Not found" });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);

    // Notify others that user left
    io.emit("message", {
      user: "System",
      text: "A user has left the chat",
      timestamp: new Date().toISOString(),
    });
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: err.message,
  });
});

// 🔄 UPDATED - Start server with Socket.io
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});