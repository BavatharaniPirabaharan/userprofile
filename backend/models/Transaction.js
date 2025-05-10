import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    name: {
        type: String,
        required: [true, "Please provide a transaction name"],
        trim: true,
    },
    type: {
        type: String,
        enum: ["income", "expense"],
        required: [true, "Please specify transaction type"],
    },
    account: {
        type: String,
        enum: ["cash", "bank", "petty"],
        required: [true, "Please specify account type"],
    },
    category: {
        type: String,
        required: [true, "Please provide a category"],
    },
    amount: {
        type: Number,
        required: [true, "Please provide an amount"],
    },
    description: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const TransactionModel = mongoose.model("Transaction", TransactionSchema);

export default TransactionModel;