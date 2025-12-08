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

const addMessage=(messageData)=>{
  const newMessage={
    id:messages.length+1,
    text:messageData.text,
    user:messageData.user,
    timestamp: new Date().toISOString()
  };
  messages.push(newMessage);
  return newMessage;
}

module.exports = {
  getMessages,
  createMessage,
  deleteAllMessages,
  addMessage
};