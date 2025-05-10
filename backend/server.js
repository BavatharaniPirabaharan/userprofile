// const express = require('express');
// const cors = require('cors');
// // const connectDB = require('./config/db');
// // const authRoutes = require('./routes/authRoutes');
// // const chatRoutes = require('./routes/chatRoutes');
// // const profileRoutes = require('./routes/profileRoutes');
// // const subscriptionRoutes = require('./routes/subscription');






// // import TransactionController from './controllers/TransactionController.js';
// // import InvoiceController from './controllers/InvoiceController.js';
// // import BudgetController  from './controllers/BudgetController.js'
// // import BankStatementControler from './controllers/BankStatementsController.js';


// import connectDB from './config/db.js';
// import authRoutes from './routes/authRoutes.js';
// import chatRoutes from './routes/chatRoutes.js';
// import profileRoutes from './routes/profileRoutes.js';
// import subscriptionRoutes from './routes/subscription.js';

// import TransactionController from './controllers/TransactionController.js';
// import InvoiceController from './controllers/InvoiceController.js';
// import BudgetController from './controllers/BudgetController.js';
// import BankStatementControler from './controllers/BankStatementsController.js';


// dotenv.config();

// // require('dotenv').config();

// // Initialize express app
// const app = express();

// // Connect to MongoDB
// connectDB();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/profile', profileRoutes);
// app.use("/api/subscription", subscriptionRoutes);



// app.use("/TransactionController", TransactionController);
// app.use("/InvoiceController", InvoiceController);
// app.use("/BudgetController",BudgetController);
// app.use("/BankStatementControler",BankStatementControler)



// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ 
//     success: false, 
//     message: 'Server error', 
//     error: process.env.NODE_ENV === 'development' ? err.message : undefined 
//   });
// });

// // Start server
// const PORT = 5001;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import subscriptionRoutes from './routes/subscription.js';

import TransactionController from './controllers/TransactionController.js';
import InvoiceController from './controllers/InvoiceController.js';
import BudgetController from './controllers/BudgetController.js';
import BankStatementsController from './controllers/BankStatementsController.js';
import employeeroutes from './routes/employeeRoutes.js'
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/TransactionController", TransactionController);
app.use("/InvoiceController", InvoiceController);
app.use("/BudgetController", BudgetController);
app.use("/BankStatementsController", BankStatementsController);
app.use('/api', employeeroutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
