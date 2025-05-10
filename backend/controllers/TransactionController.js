import express from "express";
import cors from 'cors';
import TransactionModel  from '../models/Transaction.js';

const router = express.Router();
router.use(cors());

router.post("/createTransaction", async (req, res) => {
    const { userId, name, type, account, category, amount, description } = req.body;

    if (!userId || !name || !type || !account || !category || amount == null) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields"
        });
    }

    try {
        const transaction = new TransactionModel({
            userId,
            name,
            type,
            account,
            category,
            amount,
            description,
            
        });

        await transaction.save();

        res.status(201).json({
            success: true,
            message: "Transaction recorded successfully!",
            transactionId: transaction._id
        });

    } catch (err) {
        console.error(err); 
        const statusCode = err.name === 'ValidationError' ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: "Error processing transaction",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

router.get("/getTransaction/user/:userId", async (req, res) => {
    try {
        const transactions = await TransactionModel.find({ userId: req.params.userId });
        res.json({
            success: true,
            transactions,
            count: transactions.length
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to get transactions"
        });
    }
});

router.get("/getTransaction", async (req, res) => {
    try {
        const transactions = await TransactionModel.find({});
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: "Error fetching transactions", error: err });
    }
});

router.get("/getTransaction/:id", async (req, res) => {
    try {
        const transaction = await TransactionModel.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }
        res.json(transaction);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving transaction", error: err });
    }
});

router.delete("/deleteTransaction/:id", async (req, res) => {
    try {
        const deletedTransaction = await TransactionModel.findByIdAndDelete(req.params.id);
        if (!deletedTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }
        res.json({ message: "Transaction deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting transaction", error: err });
    }
});

router.put("/updateTransaction/:id", async (req, res) => {
    const { name, type, account, category, amount, description } = req.body;

    try {
        const updatedTransaction = await TransactionModel.findByIdAndUpdate(
            req.params.id,
            { name, type, account, category, amount, description },
            { new: true }
        );

        if (!updatedTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.json(updatedTransaction);
    } catch (err) {
        res.status(500).json({ message: "Error updating transaction", error: err });
    }
});


router.get('/getRecentTransactions',  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 4;
      const transactions = await TransactionModel.find()
        .sort({ createdAt: -1 }) // Sort by most recent first
        .limit(limit);
      
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching recent transactions' });
    }
  });
export default router;
