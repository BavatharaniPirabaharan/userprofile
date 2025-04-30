const express = require('express');
const path = require('node:path');
const app = express();

// Set environment variables
process.env.MONGO_URI = 'mongodb+srv://axento_user:AxentoPass123@cluster0.czmhy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
process.env.PORT = 5001;
process.env.JWT_SECRET = 'your_jwt_secret_key_here';

// Redirect to backend server
app.get('/', (req, res) => {
  res.redirect('/api');
});

// Start the backend server
const { exec } = require('node:child_process');
const backendProcess = exec('cd backend && node server.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error starting backend server: ${error}`);
    return;
  }
  console.log(`Backend server output: ${stdout}`);
  if (stderr) {
    console.error(`Backend server error: ${stderr}`);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  backendProcess.kill();
  process.exit();
}); 