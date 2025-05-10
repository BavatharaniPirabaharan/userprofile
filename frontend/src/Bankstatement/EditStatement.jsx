import React, { useState } from 'react';
import axios from 'axios';

const EditStatement = ({ transaction, onClose, onSaved }) => {
  const [form, setForm] = useState({
    description: transaction.description,
    type: transaction.type,
    amount: transaction.amount,
    date: transaction.date,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalCredits = stmt.transactions
      .filter(tx => tx.type === 'Credit')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

      const totalDebits = stmt.transactions
      .filter(tx => tx.type === 'Debit')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

      const netBalance = totalCredits - totalDebits;
    axios
      .put(`http://localhost:5001/BankStatementsController/${statementId}/transactions/${transactionId}`, form)
      .then(() => onSaved())
      .catch(err => console.error('Update failed:', err));

  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Edit Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="border border-blue-200 rounded p-2 w-full bg-white text-blue-900"
            required
          />
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="border border-blue-200 rounded p-2 w-full bg-white text-blue-900"
          >
            <option value="Credit">Credit</option>
            <option value="Debit">Debit</option>
          </select>
          <input
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount"
            className="border border-blue-200 rounded p-2 w-full bg-white text-blue-900"
            required
          />
          <input
            name="date"
            type="date"
            value={form.date.slice(0, 10)}
            onChange={handleChange}
            className="border border-blue-200 rounded p-2 w-full bg-white text-blue-900"
            required
          />
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStatement;
