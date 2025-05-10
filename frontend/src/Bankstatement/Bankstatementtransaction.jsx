
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BankStatementWithTransactions = () => {
  const [transactions, setTransactions] = useState([
    { date: '', description: '', amount: '', type: 'debit' },
  ]);
  const { register, handleSubmit, setValue, getValues, reset, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const handleTransactionChange = (index, field, value) => {
    const updated = [...transactions];
    updated[index][field] = value;
    setTransactions(updated);
  };

  const addRow = () => {
    setTransactions([...transactions, { date: '', description: '', amount: '', type: 'debit' }]);
  };

  const removeRow = (index) => {
    setTransactions(transactions.filter((_, i) => i !== index));
  };

  // Check if selectedMonth is in the future
  const isFutureMonth = (selectedMonth) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const selectedDate = new Date(year, month - 1);
    const now = new Date();
    return selectedDate > now;
  };

  // Check if transaction date is in the future
  const isFutureDate = (date) => {
    const txDate = new Date(date);
    const now = new Date();
    return txDate > now;
  };

  // Check if transaction date is in same month and year as selectedMonth
  const isSameMonthYear = (date, selectedMonth) => {
    const [selYear, selMonth] = selectedMonth.split('-').map(Number);
    const txDate = new Date(date);
    return txDate.getFullYear() === selYear && (txDate.getMonth() + 1) === selMonth;
  };


  const onSubmit = async (data) => {
    
    if (isFutureMonth(data.selectedMonth)) {
      alert('Selected month cannot be in the future.');
      return;
    }
  
    const incompleteTransaction = transactions.some(tx => !tx.date || !tx.description || !tx.amount || !tx.type);
    if (incompleteTransaction) {
      alert('Please fill all transaction fields before submitting.');
      return;
    }
  
    const invalidTransactionDate = transactions.some(tx => {
      return isFutureDate(tx.date) || !isSameMonthYear(tx.date, data.selectedMonth);
    });
    if (invalidTransactionDate) {
      alert('All transaction dates must be in the same month and year as selected month, and not in the future.');
      return;
    }
    
  
    const userId = '6632f0d91c75fc6f4bd55e9b';
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('bankName', data.bankName);
    formData.append('description', data.description || '');
    formData.append('selectedMonth', data.selectedMonth);
  
    if (data.statementFile?.[0]) {
      formData.append('statementFile', data.statementFile[0]);
    }
  
    // Calculate totals
    const totalDebit = transactions
      .filter(tx => tx.type === 'debit')
      .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
  
    const totalCredit = transactions
      .filter(tx => tx.type === 'credit')
      .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
  
    const netAmount = totalCredit - totalDebit;
  
    // Append calculated totals
    formData.append('totalDebit', totalDebit);
    formData.append('totalCredit', totalCredit);
    formData.append('netAmount', netAmount);
  
    // Append transactions
    formData.append('transactions', JSON.stringify(transactions));
  
    try {
      await axios.post(`http://localhost:5001/BankStatementsController/add`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Bank statement, PDF and transactions submitted successfully!');
      reset();
      setTransactions([{ date: '', description: '', amount: '', type: 'debit' }]);
      navigate('/BankStatementSummary');
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Submission failed.');
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-800 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-6xl transition-all duration-300">
        <h2 className="text-3xl font-bold mb-8 text-blue-900 text-center">Upload Bank Statement & Transactions</h2>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Bank Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-1">Bank Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                {...register('bankName', { required: 'Bank name is required' })}
                className="w-full border border-gray-300 rounded-xl p-3 bg-white text-blue-900 focus:ring-2 focus:ring-blue-500"
              />
              {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900 mb-1">Description</label>
              <input
                type="text"
                {...register('description')}
                className="w-full border border-gray-300 rounded-xl p-3 bg-white text-blue-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900 mb-1">Select Month <span className="text-red-500">*</span></label>
              <input
                type="month"
                {...register('selectedMonth', { required: 'Month is required' })}
                className="w-full border border-gray-300 rounded-xl p-3 bg-white text-blue-900 focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              />
              {errors.selectedMonth && <p className="text-red-500 text-xs mt-1">{errors.selectedMonth.message}</p>}
            </div>


            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-blue-900 mb-1">Statement PDF <span className="text-red-500">*</span></label>
              <input
                type="file"
                accept=".pdf"
                {...register('statementFile', { required: 'PDF file is required' })}
                className="w-full border border-gray-300 rounded-xl p-3 bg-white text-blue-900"
              />
              {errors.statementFile && <p className="text-red-500 text-xs mt-1">{errors.statementFile.message}</p>}
            </div>
          </div>

          {/* Transaction Table */}
          <h3 className="text-2xl font-semibold text-blue-900 mb-4">Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm rounded-xl overflow-hidden">
              <thead className="bg-blue-900 text-white text-left">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index} className="hover:bg-blue-50 transition-all duration-200">
                    <td className="border-t p-2">
                      <input
                        type="date"
                        value={tx.date}
                        onChange={(e) => handleTransactionChange(index, 'date', e.target.value)}
                        className="border border-gray-300 rounded p-2 w-full bg-white text-blue-900 appearance-none cursor-pointer"
                        required
                      />
                    </td>
                    <td className="border-t p-2">
                      <input
                        type="text"
                        value={tx.description}
                        onChange={(e) => handleTransactionChange(index, 'description', e.target.value)}
                        className="border border-gray-300 rounded p-2 w-full bg-white text-blue-900"
                        placeholder="Details"
                        required
                      />
                    </td>
                    <td className="border-t p-2">
                      <input
                        type="number"
                        value={tx.amount}
                        onChange={(e) => handleTransactionChange(index, 'amount', e.target.value)}
                        className="border border-gray-300 rounded p-2 w-full bg-white text-blue-900"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </td>
                    <td className="border-t p-2">
                      <select
                        value={tx.type}
                        onChange={(e) => handleTransactionChange(index, 'type', e.target.value)}
                        className="border border-gray-300 rounded p-2 w-full bg-white text-blue-900"
                        required
                      >
                        <option value="debit">Debit</option>
                        <option value="credit">Credit</option>
                      </select>
                    </td>
                    <td className="border-t p-2 text-center">
                      <button type="button" onClick={() => removeRow(index)} className="text-red-600 font-semibold hover:underline">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Transaction Summary */}
          <div className="mt-6 p-6 bg-blue-100 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Transaction Summary</h3>
          
            <div className="flex justify-between mb-3">
              <span className="font-semibold text-blue-900">Total Debits:</span>
              <span className="text-blue-900">
                {transactions
                  .filter((tx) => tx.type === 'debit')
                  .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="font-semibold text-blue-900">Total Credits:</span>
              <span className="text-blue-900">
                {transactions
                  .filter((tx) => tx.type === 'credit')
                  .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span className="text-blue-900">Net Amount:</span>
              <span className="text-blue-900">
                {(
                  transactions
                    .filter((tx) => tx.type === 'credit')
                    .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0) -
                  transactions
                    .filter((tx) => tx.type === 'debit')
                    .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0)
                ).toFixed(2)}
              </span>
            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={addRow}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-200"
            >
              + Add Transaction
            </button>
            <button
              type="submit"
              className="bg-blue-800 text-white px-8 py-3 rounded-lg hover:bg-blue-900 transition-all duration-200"
            >
              Submit All
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default BankStatementWithTransactions;

