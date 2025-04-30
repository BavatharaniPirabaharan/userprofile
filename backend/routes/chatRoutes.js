const express = require('express');
const router = express.Router();
const getGeminiResponse = require('../services/geminiService');
const authMiddleware = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

// Add a simple test endpoint that doesn't require authentication
router.get('/test', (req, res) => {
  res.json({ message: 'Chat API is working!' });
});

// Add a test endpoint that requires authentication
router.get('/test-auth', authMiddleware, (req, res) => {
  res.json({ 
    message: 'Chat API with auth is working!',
    user: req.user
  });
});

router.post('/send-message', async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  // Basic validation
  if (!senderId || !receiverId || !message) {
    return res.status(400).json({ message: 'Sender, receiver, and message are required' });
  }

  try {
    // Save the message to the database
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      sentAt: new Date(),
    });
    await newMessage.save();

    // Respond with a success message
    res.status(201).json({ message: 'Message sent successfully', newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// AI Chat endpoint
router.post('/ai-chat', authMiddleware, async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    console.log(`Processing AI chat request for user ${userId}`);
    const response = await getGeminiResponse(message, userId);
    console.log('AI response received successfully');
    res.json(response);
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ 
      message: 'Failed to get AI response', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// All routes are protected with auth middleware
router.use(authMiddleware);

// Get all chats for the authenticated user
router.get('/', chatController.getUserChats);

// Save a new chat
router.post('/', chatController.saveChat);

// Delete a chat
router.delete('/:id', chatController.deleteChat);

// Update a chat
router.put('/:id', chatController.updateChat);

module.exports = router;
