


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


const BankStatementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stmt, setStmt] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [editTx, setEditTx] = useState(null); 

  const fetchDetails = () => {
    axios.get(`http://localhost:5001/BankStatementsController/detail/${id}`)
      .then(({ data }) => {
        if (data.success) setStmt(data.statement);
      })
      .catch(err => console.error('Load detail failed:', err));
  };

  const calculateTotals = () => {
    try {
      if (!stmt || !stmt.transactions) {
        return {
          totalDebit: 0,
          totalCredit: 0,
          netAmount: 0
        };
      }

      const totals = stmt.transactions.reduce((acc, tx) => {
        const amount = parseFloat(tx.amount) || 0;
        if (tx.type.toLowerCase() === 'debit') {
          acc.totalDebit += amount;
        } else if (tx.type.toLowerCase() === 'credit') {
          acc.totalCredit += amount;
        }
        return acc;
      }, { totalDebit: 0, totalCredit: 0 });

      totals.netAmount = totals.totalCredit - totals.totalDebit;

      return totals;
    } catch (error) {
      console.error('Calculation error:', error);
      return {
        totalDebit: 0,
        totalCredit: 0,
        netAmount: 0
      };
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (stmt) {
      const totals = calculateTotals();
      setStmt(prev => ({
        ...prev,
        totalDebit: totals.totalDebit,
        totalCredit: totals.totalCredit,
        netAmount: totals.netAmount
      }));
    }
  }, [stmt?.transactions]);

  if (!stmt) return <p className="p-4 text-center text-blue-900">Loading…</p>;

  


  const filteredTransactions = stmt.transactions.filter((tx) => {
    const matchesType = filterType === 'All' || tx.type.toLowerCase() === filterType.toLowerCase();
    const matchesSearch = tx.description
      .toLowerCase()
      .includes(searchText.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleDelete = async (txId) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      // First verify the statement exists
      const statementResponse = await axios.get(`http://localhost:5001/BankStatementsController/detail/${id}`);
      if (!statementResponse.data.success) {
        throw new Error('Statement not found');
      }

      // Then attempt to delete the transaction
      const deleteResponse = await axios.delete(
        `http://localhost:5001/BankStatementsController/${id}/transactions/${txId}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (deleteResponse.data.success) {
        // Update local state
        const updatedTransactions = stmt.transactions.filter(tx => tx._id !== txId);
        
        // Recalculate totals
        const totals = calculateTotals();
        
        // Update state with new data
        setStmt(prev => ({
          ...prev,
          transactions: updatedTransactions,
          totalDebit: totals.totalDebit,
          totalCredit: totals.totalCredit,
          netAmount: totals.netAmount
        }));

        alert('Transaction deleted successfully');
      } else {
        throw new Error(deleteResponse.data.message || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert(error.message || 'Failed to delete transaction. Please try again.');
    }
  };



  const handleEditSave = () => {
    if (!editTx) return;

    const updatedTx = {
      description: editTx.description,
      type: editTx.type.toLowerCase(),
      amount: parseFloat(editTx.amount),
      date: editTx.date // Keep the date in its original format
    };

    axios.put(`http://localhost:5001/BankStatementsController/${id}/transactions/${editTx._id}`, updatedTx)
      .then((response) => {
        if (response.data.success) {
          // Update the statement with the new transaction data
          const updatedTransactions = stmt.transactions.map(tx => 
            tx._id === editTx._id ? { ...tx, ...updatedTx } : tx
          );
          
          // Recalculate totals
          const totals = calculateTotals();
          
          setStmt({
            ...stmt,
            transactions: updatedTransactions,
            totalDebit: totals.totalDebit,
            totalCredit: totals.totalCredit,
            netAmount: totals.netAmount
          });
          
          setEditTx(null);
        } else {
          throw new Error(response.data.message || 'Failed to update transaction');
        }
      })
      .catch(err => {
        console.error('Update failed:', err);
        alert('Failed to update transaction. Please try again.');
      });
  };

  const handleDeleteStatement = async () => {
        if (!window.confirm("Are you sure you want to delete this entire bank statement? This action cannot be undone.")) {
          return;
        }
      
        try {
          const response = await axios.delete(
            `http://localhost:5001/BankStatementsController/delete/${id}`,
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
      
          if (response.data.success) {
            alert('Bank statement deleted successfully');
            navigate(-1); 
          } else {
            throw new Error(response.data.message || 'Failed to delete statement');
          }
        } catch (error) {
          console.error('Delete failed:', error);
          alert(error.message || 'Failed to delete statement. Please try again.');
        }
      };

  const generatePdf = () => {
    try {
      const doc = new jsPDF();
    
      // Title
      doc.setFontSize(20);
      doc.setTextColor(33, 37, 41);
      doc.text(stmt.bankName, 14, 20);
    
      // Period & Description
      doc.setFontSize(12);
      doc.setTextColor(55, 65, 81);
      doc.text(`Period: ${stmt.selectedMonth}`, 14, 30);
      doc.text(`Description: ${stmt.description || 'N/A'}`, 14, 38);
    
      // Summary Section
      doc.setFontSize(14);
      doc.setTextColor(33, 37, 41);
      doc.text('Summary', 14, 48);
      
      // Summary Table
      autoTable(doc, {
        startY: 52,
        head: [['Category', 'Amount']],
        body: [
          ['Total Debits', `Rs. ${stmt.totalDebit.toFixed(2)}`],
          ['Total Credits', `Rs. ${stmt.totalCredit.toFixed(2)}`],
          ['Net Balance', `Rs. ${stmt.netAmount.toFixed(2)}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [13, 42, 148], textColor: 255 },
        styles: { fontSize: 11 },
        columnStyles: {
          1: { halign: 'right' }
        }
      });
    
      // Transactions Section
      doc.setFontSize(14);
      doc.setTextColor(33, 37, 41);
      doc.text('Transactions', 14, doc.lastAutoTable.finalY + 15);
    
      // Transactions Table
      const tableData = stmt.transactions.map((tx) => [
        new Date(tx.date).toLocaleDateString(),
        tx.description,
        tx.type,
        {
          content: `Rs. ${parseFloat(tx.amount).toFixed(2)}`,
          styles: {
            textColor: tx.type.toLowerCase() === 'debit' ? [0, 128, 0] : [220, 53, 69]
          }
        }
      ]);
    
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Date', 'Description', 'Type', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [13, 42, 148], textColor: 255 },
        styles: { fontSize: 10 },
        columnStyles: {
          3: { halign: 'right' }
        }
      });
    
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() - 20,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'right' }
        );
      }
    
      doc.save(`${stmt.bankName}_Statement_${stmt.selectedMonth}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };
  

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-8 text-white">
            <button
              onClick={() => navigate(-1)}
              className="mb-6 text-white/80 hover:text-white transition flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">{stmt.bankName}</h2>
                <p className="text-white/80">{stmt.description}</p>
                <p className="text-white/80 mt-1">Period: {new String(stmt.selectedMonth)}</p>
              </div>
              <div className="flex gap-4">
              
                <button
                  onClick={generatePdf}
                  className="inline-flex items-center gap-2 bg-white text-blue-900 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download PDF
                </button>
                <button
                  onClick={handleDeleteStatement}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                  title="Delete Statement"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>


              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-lg border border-red-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-red-500 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-red-800">Total Debits</h3>
                </div>
                <p className="text-2xl font-bold text-red-900">{stmt.totalDebit.toFixed(2)}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-green-800">Total Credits</h3>
                </div>
                <p className="text-2xl font-bold text-red-900">{stmt.totalCredit.toFixed(2)}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-800">Net Balance</h3>
                </div>
                <p className="text-2xl font-bold text-blue-900">{stmt.netAmount.toFixed(2)}</p>
              </div>
            </div>

            {/* Balance Sheet Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Balance Sheet</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assets Side */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Assets</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cash & Bank Balance</span>
                      <span className="font-medium text-green-600">{stmt.netAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Assets</span>
                      <span className="font-bold text-green-600">{stmt.netAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Liabilities Side */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Liabilities</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Credits</span>
                      <span className="font-medium text-red-600">{stmt.totalCredit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Debits</span>
                      <span className="font-medium text-red-600">{stmt.totalDebit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-gray-600">Net Liabilities</span>
                      <span className="font-bold text-red-600">{stmt.netAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Financial Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Total Transactions</p>
                    <p className="text-xl font-bold text-gray-900">{stmt.transactions.length}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Average Transaction</p>
                    <p className="text-xl font-bold text-gray-900">
                      {(stmt.transactions.reduce((acc, tx) => acc + parseFloat(tx.amount), 0) / stmt.transactions.length).toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Statement Period</p>
                    <p className="text-xl font-bold text-gray-900">{new String(stmt.selectedMonth)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="All">All Transactions</option>
                <option value="credit">Credits Only</option>
                <option value="debit">Debits Only</option>
              </select>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Description</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTransactions.map((tx, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {tx.date ? tx.date.split('T')[0] : new Date().toISOString().slice(0, 10)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{tx.description}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tx.type.toLowerCase() === 'credit' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <span className={tx.type.toLowerCase() === 'debit' ? 'text-green-600' : 'text-red-600'}>
                            {tx.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setEditTx(tx)}
                              className="text-blue-600 hover:text-blue-800 transition"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(tx._id)}
                              className="text-red-600 hover:text-red-800 transition"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editTx && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Transaction</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={editTx.description}
                    onChange={(e) => setEditTx({ ...editTx, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Transaction description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={editTx.amount}
                    onChange={(e) => setEditTx({ ...editTx, amount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={editTx.type}
                    onChange={(e) => setEditTx({ ...editTx, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Credit">Credit</option>
                    <option value="Debit">Debit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editTx.date ? editTx.date.split('T')[0] : new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setEditTx({ ...editTx, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setEditTx(null)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankStatementDetail;
