import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { 
    type: String, 
    required: true,
    unique: true
  },
  vendorName: { 
    type: String, 
    required: true 
  },
  issueDate: { 
    type: Date, 
    required: true 
  },
  dueDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    required: true,
    enum: ['Pending', 'Paid', 'Overdue'],
    default: 'Pending'
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  taxAmount: { 
    type: Number, 
    required: true,
    min: 0
  },
  totalAmount: { 
    type: Number, 
    required: true,
    min: 0
  }
}, { 
  versionKey: false // Remove __v field
});

const InvoiceModel = mongoose.model('Invoice', invoiceSchema);

export default InvoiceModel;