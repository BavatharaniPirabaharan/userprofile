import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaFilePdf } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../logo.jpg';

const Transactions = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
  });
  const [newTransaction, setNewTransaction] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    category: '',
    type: 'expense',
    account: 'cash',
  });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
 

  useEffect(() => {
    
    const debounceTimer = setTimeout(() => {
      fetchTransactions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters, selectedMonth]);

  
const fetchTransactions = async () => {
  try {
    setLoading(true);
    const res = await axios.get('http://localhost:5001/TransactionController/getTransaction', {
      params: {
        search: filters.search,
        type: filters.type === 'all' ? undefined : filters.type,
        category: filters.category === 'all' ? undefined : filters.category,
        month: selectedMonth || undefined, // Only send month if selectedMonth exists
      },
    });

    setTransactions(res.data);
    calculateSummary(res.data);
  } catch (error) {
    toast.error('Failed to fetch transactions');
    console.error('Fetch error:', error);
  } finally {
    setLoading(false);
  }
};

// In the filteredTransactions calculation, add month filtering:
const filteredTransactions = transactions.filter(transaction => {
  const matchesSearch = transaction.name.toLowerCase().includes(filters.search.toLowerCase());
  const matchesType = filters.type === 'all' || transaction.type === filters.type;
  const matchesCategory = filters.category === 'all' || transaction.category === filters.category;
  
  // Add month filtering
  const transactionDate = new Date(transaction.date || transaction.createdAt);
  const transactionMonth = transactionDate.getFullYear() + '-' + 
                         String(transactionDate.getMonth() + 1).padStart(2, '0');
  const matchesMonth = !selectedMonth || transactionMonth === selectedMonth;
  
  return matchesSearch && matchesType && matchesCategory && matchesMonth;
});
  const calculateSummary = (transactions) => {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === 'income') {
        totalIncome += parseFloat(transaction.amount);
      } else {
        totalExpense += parseFloat(transaction.amount);
      }
    });

    setSummary({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
      };

      if (editingTransaction) {
        await axios.put(
          `http://localhost:5001/TransactionController/updateTransaction/${editingTransaction._id}`,
          payload
        );
        toast.success('Transaction updated successfully');
      } else {
        await axios.post(
          'http://localhost:5001/TransactionController/createTransaction',
          payload
        );
        toast.success('Transaction added successfully');
      }
      setShowAddModal(false);
      setEditingTransaction(null);
      setNewTransaction({
        name: '',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        category: '',
        type: 'expense',
        account: 'cash',
      });
      fetchTransactions();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(
        error.response?.data?.message || 
        (editingTransaction ? 'Failed to update transaction' : 'Failed to add transaction')
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(
          `http://localhost:5001/TransactionController/deleteTransaction/${id}`
        );
        toast.success('Transaction deleted successfully');
        fetchTransactions();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete transaction');
      }
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setNewTransaction({
      name: transaction.name,
      amount: transaction.amount.toString(),
      date: transaction.date ? transaction.date.split('T')[0] : new Date().toISOString().slice(0, 10),
      category: transaction.category,
      type: transaction.type,
      account: transaction.account || 'cash',
    });
    setShowAddModal(true);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
  
    const img = new Image();
    img.src = logo;
    doc.addImage(img, 'JPEG', pageWidth / 2 - 15, 10, 30, 30); 
  
    
    doc.setFontSize(18);
    doc.setTextColor('#007BFF'); // Blue
    doc.text('Transactions Report', pageWidth / 2, 45, { align: 'center' });
  
    // Subtitle
    doc.setFontSize(10);
    doc.text(`Date Range: ${selectedMonth}`, pageWidth / 2, 52, { align: 'center' });
  
    // Summary section
    doc.setTextColor(0, 0, 0); 
    doc.setFontSize(12);
    let y = 62;
    doc.setTextColor('#007BFF');
    doc.text('Financial Summary', 14, y);
    doc.setTextColor(0, 0, 0);
    y += 8;
    doc.text(`Total Income: ${summary.totalIncome.toFixed(2)}`, 14, y);
    y += 6;
    doc.text(`Total Expenses: ${summary.totalExpense.toFixed(2)}`, 14, y);
    y += 6;
    doc.text(`Net Balance: ${summary.balance.toFixed(2)}`, 14, y);
  
    // Transactions table
    y += 10;
    doc.setTextColor('#007BFF');
    doc.text('Transaction Details', 14, y);
  
    const tableData = filteredTransactions.map(transaction => [
      transaction.name,
      parseFloat(transaction.amount).toFixed(2),
      transaction.category || '-',
      formatDate(transaction.date),
      transaction.type.toUpperCase()
    ]);
  
    autoTable(doc, {
      startY: y + 4,
      head: [['Description', 'Amount', 'Category', 'Date', 'Type']],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: {
        fillColor: [0, 123, 255], // Blue
        textColor: 255,           // White text
      },
      columnStyles: {
        1: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 }
      }
    });
  
    doc.save(`transactions-report-${selectedMonth}.pdf`);
  };
  
  const createInvoice = (transaction) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
  
    const img = new Image();
    img.src = logo;
    doc.addImage(img, 'JPEG', pageWidth / 2 - 15, 10, 30, 30); 
  
    // Title
    doc.setFontSize(18);
    doc.setTextColor('#007BFF'); // Blue
    doc.text('Transactions', pageWidth / 2, 45, { align: 'center' });
  
    // Invoice details
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Black
    doc.text(`Transactions INV-${transaction._id.slice(-6).toUpperCase()}`, 14, 55);
    doc.text(`Date: ${formatDate(transaction.date)}`, 14, 61);
  
  
    doc.setFontSize(12);
    doc.setTextColor('#007BFF');
    doc.text('From:', 14, 71);
    doc.setTextColor(0, 0, 0);
    doc.text('Your Business Name', 20, 77);
    doc.text('123 Business Address', 20, 83);
    doc.text('City, Country', 20, 89);
  
    doc.setTextColor('#007BFF');
    doc.text('To:', 14, 101);
    doc.setTextColor(0, 0, 0);
    doc.text(transaction.name, 20, 107);
  
    // Invoice Table
    autoTable(doc, {
      startY: 117,
      head: [['Description', 'Amount']],
      body: [
        [transaction.category || 'Service', `LKR ${parseFloat(transaction.amount).toFixed(2)}`],
        ['Total', `LKR ${parseFloat(transaction.amount).toFixed(2)}`]
      ],
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [0, 123, 255], // Blue
        textColor: 255            // White text
      }
    });
  
    // Footer
    doc.setFontSize(8);
    doc.setTextColor('#007BFF');
    doc.text('Thank you for your business!', pageWidth / 2, doc.lastAutoTable.finalY + 15, { align: 'center' });
  
    doc.save(`invoice-${transaction.name}-${transaction.date || 'no-date'}.pdf`);
  };
  
  



  

  const formatDate = (dateString) => {
    if (!dateString) return 'No Date';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Transactions</h2>
        <div className="flex gap-4 text-black">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border text-black rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />

          <button 
            onClick={exportToPDF}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            title="Export to PDF"
          >
            <FaFilePdf className="mr-2" /> Export
          </button>

        <Link to='/TransactionForm'>
        <button 
            
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaPlus className="mr-2" /> Add Transaction
          </button></Link>  
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg shadow border border-green-100">
          <h3 className="text-gray-600 text-sm font-medium">Total Income</h3>
          <p className="text-2xl font-semibold text-green-600">{summary.totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow border border-red-100">
          <h3 className="text-gray-600 text-sm font-medium">Total Expense</h3>
          <p className="text-2xl font-semibold text-red-600">{summary.totalExpense.toFixed(2)}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-100">
          <h3 className="text-gray-600 text-sm font-medium">Balance</h3>
          <p className={`text-2xl font-semibold ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {summary.balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 border border-gray-200">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-900" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border text-black rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-4 py-2 border rounded-lg focus:ring-2 text-black focus:ring-blue-500 bg-white"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.name}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {parseFloat(transaction.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="mr-2 text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction._id)}
                        className="mr-2 text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                      <button
                        onClick={() => createInvoice(transaction)}
                        className="text-green-600 hover:text-green-900"
                        title="Create Invoice"
                      >
                        <FaFilePdf />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
              </h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTransaction(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  id="name"
                  value={newTransaction.name}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 bg-white text-black py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  id="amount"
                  step="0.01"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full bg-white text-black  px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  id="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-white text-black  px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  id="type"
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-white text-black  px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
              <Link to='/Transactions'>
              <button
                  type="button"
                 
                  className="px-4 py-2  text-black  border border-gray-300 rounded-md shadow-sm text-sm font-medium  bg-white hover:bg-gray-50"
                >
                  Cancel
                </button></Link>  
                <button
                  type="submit"
                  className="px-4  text-black  py-2 border border-transparent rounded-md shadow-sm text-sm font-medium  bg-blue-600 hover:bg-blue-700"
                >
                  {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;