const Chat = require('../models/Chat');

// Get all chats for a user
exports.getUserChats = async (req, res) => {
  try {
    console.log('Getting chats for user:', req.user.id);
    console.log('User object:', req.user);
    
    // Check if the user ID is valid
    if (!req.user.id) {
      console.error('User ID is missing or invalid');
      return res.status(400).json({ message: 'User ID is missing or invalid' });
    }
    
    const chats = await Chat.find({ userId: req.user.id })
      .sort({ timestamp: -1 });
    console.log('Found chats:', chats.length);
    console.log('Chats:', JSON.stringify(chats, null, 2));
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

// Save a new chat
exports.saveChat = async (req, res) => {
  try {
    const { message, response } = req.body;
    console.log('Saving chat for user:', req.user.id);
    console.log('User object:', req.user);
    console.log('Chat data:', { message, response });
    
    // Check if the user ID is valid
    if (!req.user.id) {
      console.error('User ID is missing or invalid');
      return res.status(400).json({ message: 'User ID is missing or invalid' });
    }
    
    const chat = new Chat({
      userId: req.user.id,
      message,
      response
    });
    
    console.log('New chat object:', chat);
    const savedChat = await chat.save();
    console.log('Chat saved successfully:', savedChat._id);
    console.log('Saved chat:', JSON.stringify(savedChat, null, 2));
    res.status(201).json(savedChat);
  } catch (error) {
    console.error('Error saving chat:', error);
    console.error('Error stack:', error.stack);
    res.status(400).json({ message: error.message });
  }
};

// Delete a chat
exports.deleteChat = async (req, res) => {
  try {
    console.log('Deleting chat:', req.params.id, 'for user:', req.user.id);
    const chat = await Chat.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!chat) {
      console.log('Chat not found');
      return res.status(404).json({ message: 'Chat not found' });
    }
    console.log('Chat deleted successfully');
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update a chat
exports.updateChat = async (req, res) => {
  try {
    const { message, response } = req.body;
    console.log('Updating chat:', req.params.id, 'for user:', req.user.id);
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { message, response },
      { new: true }
    );
    if (!chat) {
      console.log('Chat not found');
      return res.status(404).json({ message: 'Chat not found' });
    }
    console.log('Chat updated successfully');
    res.json(chat);
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(400).json({ message: error.message });
  }
}; 