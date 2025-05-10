import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['debit', 'credit'], required: true },
});


const bankStatementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  bankName: { type: String, required: true },
  description: { type: String },
  selectedMonth: { type: String, required: true },
  statementFile: { type: String, required: true },
  totalDebit:{ type: Number },
  totalCredit: { type: Number },
  netAmount: { type: Number },
  transactions: [transactionSchema],
}, {
  timestamps: true
});

const BankStatement = mongoose.model('BankStatement', bankStatementSchema);

export default BankStatement;
