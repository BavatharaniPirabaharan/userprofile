// models/Subscription.js
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: String,
    required: true,
  },
  pinCode: {
    type: String,
    required: true,
  },
  cardType: {
    type: String,
    enum: ['debit', 'credit'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
