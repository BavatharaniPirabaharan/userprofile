// export default router;


import express from 'express';
import multer from 'multer';
import path from 'path';
import BankStatement from '../models/Bank.js';

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'statement-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage }).single('statementFile');

// Add Bank Statement
router.post('/add', (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error('Multer error:', err);
      return res.status(500).json({ message: 'File upload failed.', error: err.message });
    }

    try {
      const { userId, bankName, description, selectedMonth, totalDebit, totalCredit, netAmount, transactions } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: 'PDF file is required.' });
      }

      const parsedTransactions = JSON.parse(transactions).map(tx => ({
        ...tx,
        date: tx.date, // Keep the date as is since it's already in YYYY-MM-DD format
        amount: parseFloat(tx.amount),
        type: tx.type.toLowerCase()
      }));

      const newStatement = new BankStatement({
        userId,
        bankName,
        description,
        selectedMonth,
        statementFile: req.file.filename,
        totalDebit: parseFloat(totalDebit),
        totalCredit: parseFloat(totalCredit),
        netAmount: parseFloat(netAmount),
        transactions: parsedTransactions,
      });

      await newStatement.save();

      res.status(201).json({ message: 'Bank statement and transactions saved successfully.' });
    } catch (err) {
      console.error('Error adding bank statement:', err);
      res.status(500).json({ message: 'Failed to save bank statement.', error: err.message });
    }
  });
});

// Get all statements
router.get('/get', async (req, res) => {
  try {
    const statements = await BankStatement.find().sort({ selectedMonth: -1 });
    res.status(200).json({ success: true, statements });
  } catch (err) {
    console.error('Failed to fetch statements:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve bank statements.', error: err.message });
  }
});

// Get statements by userId
router.get("/get/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const statements = await BankStatement.find({ userId });
    res.status(200).json({ success: true, statements });
  } catch (err) {
    console.error("Error fetching bank statements:", err);
    res.status(500).json({ success: false, message: "Failed to fetch bank statements.", error: err.message });
  }
});

// Get statement detail by statementId
router.get("/detail/:id", async (req, res) => {
  try {
    const statement = await BankStatement.findById(req.params.id);
    if (!statement) {
      return res.status(404).json({ success: false, message: "Statement not found" });
    }
    res.json({ success: true, statement });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch statement", error: err.message });
  }
});

// Update a transaction in a statement
router.put("/:statementId/transactions/:transactionId", async (req, res) => {
  const { statementId, transactionId } = req.params;
  const { description, type, amount, date } = req.body;

  try {
    const statement = await BankStatement.findById(statementId);
    if (!statement) {
      return res.status(404).json({ success: false, message: "Statement not found." });
    }

    const transaction = statement.transactions.id(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found." });
    }

    // Update transaction fields
    transaction.description = description;
    transaction.type = type;
    transaction.amount = parseFloat(amount);
    transaction.date = date; // Keep the date as is since it's already in YYYY-MM-DD format

    // Recalculate totals from all transactions
    const transactions = statement.transactions || [];
    const totalCredit = transactions
      .filter(t => t.type.toLowerCase() === 'credit')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const totalDebit = transactions
      .filter(t => t.type.toLowerCase() === 'debit')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    statement.totalCredit = totalCredit;
    statement.totalDebit = totalDebit;
    statement.netAmount = totalCredit - totalDebit;

    await statement.save();
    
    res.json({ 
      success: true, 
      message: "Transaction updated successfully.",
      updatedStatement: statement
    });

  } catch (err) {
    console.error("Update transaction error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update transaction.", 
      error: err.message 
    });
  }
});

// Delete a transaction in a statement
router.delete("/:statementId/transactions/:transactionId", async (req, res) => {
  const { statementId, transactionId } = req.params;

  try {
    const statement = await BankStatement.findById(statementId);
    if (!statement) {
      return res.status(404).json({ success: false, message: "Statement not found." });
    }

    // Use the new removeTransaction method
    // statement.removeTransaction(transactionId);
    statement.transactions.pull(transactionId);


    // Recalculate totals
    const totalCredit = statement.transactions
      .filter(t => t.type.toLowerCase() === 'credit')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const totalDebit = statement.transactions
      .filter(t => t.type.toLowerCase() === 'debit')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    statement.totalCredit = totalCredit;
    statement.totalDebit = totalDebit;
    statement.netAmount = totalCredit - totalDebit;

    // Save the updated statement
    const updatedStatement = await statement.save();
    
    res.json({ 
      success: true, 
      message: "Transaction deleted successfully.",
      statement: updatedStatement
    });

  } catch (err) {
    console.error("Delete transaction error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete transaction.", 
      error: err.message 
    });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    await BankStatement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
});


export default router;
