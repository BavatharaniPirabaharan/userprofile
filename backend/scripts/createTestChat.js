const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/axento_books')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import the Chat model
const Chat = require('../models/Chat');
const User = require('../models/User');

// Function to create a test chat
async function createTestChat() {
  try {
    // Get the first user from the database
    const user = await User.findOne();
    
    if (!user) {
      console.error('No users found in the database. Please create a user first.');
      process.exit(1);
    }
    
    console.log(`Creating test chat for user: ${user._id}`);
    
    // Create a new chat
    const chat = new Chat({
      userId: user._id,
      message: 'This is a test message',
      response: 'This is a test response'
    });
    
    // Save the chat
    const savedChat = await chat.save();
    console.log('Test chat created successfully:');
    console.log(`ID: ${savedChat._id}`);
    console.log(`User ID: ${savedChat.userId}`);
    console.log(`Message: ${savedChat.message}`);
    console.log(`Response: ${savedChat.response}`);
    console.log(`Timestamp: ${savedChat.timestamp}`);
    
    // Exit the process
    process.exit(0);
  } catch (error) {
    console.error('Error creating test chat:', error);
    process.exit(1);
  }
}

// Run the function
createTestChat(); 