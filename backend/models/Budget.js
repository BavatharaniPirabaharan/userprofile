import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  // userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  month: { 
    type: String, 
    required: true,
    enum: [
      'January', 'February', 'March', 'April', 
      'May', 'June', 'July', 'August', 
      'September', 'October', 'November', 'December'
    ]
  },
  income: { 
    type: Number, 
    required: true,
    min: 0
  },
  categories: [{
    name: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  total: { 
    type: Number, 
    required: true,
    min: 0
  },
  balance: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Within Budget', 'Exceeded Budget'],
    default: 'Within Budget'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  versionKey: false // Remove __v field
});

budgetSchema.pre('save', function(next) {
  if (!this.total) {
    this.total = this.categories.reduce((sum, category) => sum + category.amount, 0);
  }
  

  this.balance = this.income - this.total;
  this.status = this.balance >= 0 ? 'Within Budget' : 'Exceeded Budget';
  
  next();
});

const BudgetModel = mongoose.model('Budget', budgetSchema);

export default BudgetModel;