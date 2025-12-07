// mock database
let messages = [
  {
    id: 1,
    text: "Hello welcome the real chat application bootcamp",
    user: "John",
    timestamp: new Date().toISOString(),
  },
  {
    id: 2,
    text: "Hello welcome the real chat application bootcamp",
    user: "Rudra Arora",
    timestamp: new Date().toISOString(),
  },
];

// Get all messages
const getMessages = (req, res) => {
  try {
    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// Create a new message
const createMessage = (req, res) => {
  try {
    const { text, user } = req.body;

    // Basic validation
    if (!text || !user) {
      return res.status(400).json({
        success: false,
        message: "Text and user are required",
      });
    }

    // Create new message object
    const newMessage = {
      id: messages.length + 1,
      text,
      user,
      timestamp: new Date().toISOString(),
    };

    // Push into mock DB
    messages.push(newMessage);

    res.status(201).json({
      success: true,
      message: "Message created successfully",
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

// Delete a message
const deleteMessage = (req, res) => {
  try {
    const { id } = req.params;

    // Convert id to number
    const messageId = parseInt(id);

    // Find message index
    const index = messages.findIndex(msg => msg.id === messageId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Remove message
    const deletedMessage = messages.splice(index, 1);

    res.json({
      success: true,
      message: "Message deleted successfully",
      data: deletedMessage[0],
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Delete all messages
const deleteAllMessages = (req, res) => {
  try {
    messages = []; // Clear the array

    res.json({
      success: true,
      message: "All messages deleted successfully",
      count: 0,
      data: []
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

module.exports={
  getMessages,
  createMessage,
  deleteMessage,
  deleteAllMessages,
}