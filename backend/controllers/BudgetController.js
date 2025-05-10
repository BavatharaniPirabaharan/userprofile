import express from "express";
import cors from 'cors';
import BudgetModel from '../models/Budget.js';

const router = express.Router();
router.use(cors());

router.post("/createBudget", async (req, res) => {
    const { userId, month, income, categories } = req.body;

    if (!userId || !month || income == null || !categories || categories.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: userId, month, income, or categories"
        });
    }

    try {
        // Calculate total from categories
        const total = categories.reduce((sum, category) => sum + (parseFloat(category.amount) || 0), 0);
        const balance = income - total;
        const status = balance >= 0 ? 'Within Budget' : 'Exceeded Budget';

        const budget = new BudgetModel({
            userId,
            month,
            income,
            categories,
            total,
            balance,
            status
        });

        await budget.save();

        res.status(201).json({
            success: true,
            message: "Budget created successfully!",
            budgetId: budget._id,
            budget
        });

    } catch (err) {
        console.error(err);
        const statusCode = err.name === 'ValidationError' ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: "Error creating budget",
            error: err.message
        });
    }
});

router.get("/getBudgets", async (req, res) => {
    try {
      const budgets = await BudgetModel.find();
      res.json({
        success: true,
        budgets,
        count: budgets.length
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to get budgets",
        error: err.message
      });
    }
  });
  
router.get("/getBudgets/:userId", async (req, res) => {
    try {
        const budgets = await BudgetModel.find({ userId: req.params.userId });
        res.json({
            success: true,
            budgets,
            count: budgets.length
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to get budgets",
            error: err.message
        });
    }
});

// Get a specific budget by ID
router.get("/getBudgets/:id", async (req, res) => {
    try {
        const budget = await BudgetModel.findById(req.params.id);
        if (!budget) {
            return res.status(404).json({ 
                success: false,
                message: "Budget not found" 
            });
        }
        res.json({
            success: true,
            budget
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error retrieving budget",
            error: err.message
        });
    }
});

router.put("/updateBudget/:id", async (req, res) => {
    const { month, income, categories } = req.body;

    try {
        // Calculate total from categories
        const total = categories.reduce((sum, category) => sum + (parseFloat(category.amount) || 0), 0);
        const balance = income - total;
        const status = balance >= 0 ? 'Within Budget' : 'Exceeded Budget';

        // Update the budget with recalculated total, balance, and status
        const updatedBudget = await BudgetModel.findByIdAndUpdate(
            req.params.id,
            { month, income, categories, total, balance, status },
            { new: true, runValidators: true }
        );

        if (!updatedBudget) {
            return res.status(404).json({ 
                success: false,
                message: "Budget not found" 
            });
        }

        res.json({
            success: true,
            message: "Budget updated successfully",
            budget: updatedBudget
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error updating budget",
            error: err.message
        });
    }
});



router.delete("/deleteBudget/:id", async (req, res) => {
    try {
        const deletedBudget = await BudgetModel.findByIdAndDelete(req.params.id);
        if (!deletedBudget) {
            return res.status(404).json({ 
                success: false,
                message: "Budget not found" 
            });
        }
        res.json({
            success: true,
            message: "Budget deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error deleting budget",
            error: err.message
        });
    }
});

export default router;
