const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/axento_books')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import the Chat model
const Chat = require('../models/Chat');

// Function to check chats
async function checkChats() {
  try {
    // Get all chats
    const chats = await Chat.find();
    console.log(`Found ${chats.length} chats in the database`);
    
    if (chats.length > 0) {
      console.log('Chats:');
      chats.forEach(chat => {
        console.log(`ID: ${chat._id}`);
        console.log(`User ID: ${chat.userId}`);
        console.log(`Message: ${chat.message.substring(0, 50)}...`);
        console.log(`Response: ${chat.response.substring(0, 50)}...`);
        console.log(`Timestamp: ${chat.timestamp}`);
        console.log('---');
      });
    }
    
    // Exit the process
    process.exit(0);
  } catch (error) {
    console.error('Error checking chats:', error);
    process.exit(1);
  }
}

// Run the function
checkChats(); 