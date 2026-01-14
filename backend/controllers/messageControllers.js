// ⭐ NEW FILE - Message Controller
// Mock database - array to store messages in memory
let messages = [
  {
    id: 1,
    text: "Hello! Welcome to the chat",
    user: "John",
    timestamp: new Date().toISOString(),
  },
  {
    id: 2,
    text: "Hi there!",
    user: "Alice",
    timestamp: new Date().toISOString(),
  },
];

// GET all messages
const getMessages = (req, res) => {
  try {
    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// POST new message
const createMessage = (req, res) => {
  try {
    const { text, user } = req.body;

    // Validation
    if (!text || !user) {
      return res.status(400).json({
        success: false,
        message: "Please provide text and user",
      });
    }

    // Create new message
    const newMessage = {
      id: messages.length + 1,
      text,
      user,
      timestamp: new Date().toISOString(),
    };

    // Add to mock database
    messages.push(newMessage);

    res.status(201).json({
      success: true,
      message: "Message created",
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// DELETE all messages (for testing)
const deleteAllMessages = (req, res) => {
  try {
    messages = [];
    res.json({
      success: true,
      message: "All messages deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const addMessage = (messageData) => {
  const newMessage = {
    id: messages.length + 1,
    text: messageData.text,
    user: messageData.user,
    timestamp: new Date().toISOString(),
  };
  messages.push(newMessage);
  return newMessage;
};

// DELETE a single message by id
const deleteMessage = (req, res) => {
  try {
    const id = Number(req.params.id);
    const index = messages.findIndex((m) => m.id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }
    const deleted = messages.splice(index, 1)[0];

    console.log('🗑️ HTTP deleteMessage executed for id:', deleted.id);

    // If Socket.io instance is attached to app, broadcast the deletion
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('messageDeleted', deleted);
      }
    } catch (e) {
      // ignore emitter errors
      console.warn('Could not emit messageDeleted from HTTP delete:', e.message);
    }

    res.json({
      success: true,
      message: "Message deleted",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Helper to delete by id programmatically (for socket handlers)
const deleteMessageById = (id) => {
  const index = messages.findIndex((m) => m.id === Number(id));
  if (index === -1) return null;
  return messages.splice(index, 1)[0];
};

module.exports = {
  getMessages,
  createMessage,
  deleteAllMessages,
  deleteMessage,
  addMessage,
  deleteMessageById,
};