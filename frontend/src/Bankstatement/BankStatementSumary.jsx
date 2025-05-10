import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../logo.jpg';

const BankStatementList = ({ userId }) => {
  const [statements, setStatements] = useState([]);
  const [filteredStatements, setFilteredStatements] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [bankNameFilter, setBankNameFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');  // asc or desc

  useEffect(() => {
    // Fetch all bank statements
    axios
      .get(`http://localhost:5001/BankStatementsController/get`)
      .then(({ data }) => {
        if (data.success) {
          setStatements(data.statements);
          setFilteredStatements(data.statements);
        } else {
          console.error('API returned success=false');
        }
      })
      .catch(err => {
        console.error('Fetch failed:', err);
      });
  }, [userId]);

  const handleFilter = () => {
    let filtered = [...statements];
    
    // Apply month filter
    if (selectedMonth) {
      filtered = filtered.filter(stmt => {
        const stmtMonth = stmt.selectedMonth.slice(0, 7); // Extract YYYY-MM
        return stmtMonth === selectedMonth;
      });
    }
    
    // Apply bank name filter
    if (bankNameFilter) {
      filtered = filtered.filter(stmt => 
        stmt.bankName.toLowerCase().includes(bankNameFilter.toLowerCase())
      );
    }
    
    setFilteredStatements(filtered);
  };

  const handleSort = (field) => {
    const sortedStatements = [...filteredStatements].sort((a, b) => {
      if (field === 'date') {
        const dateA = a.selectedMonth;
        const dateB = b.selectedMonth;
        return sortOrder === 'asc' ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
      } else if (field === 'amount') {
        // Sorting by total transaction amount
        const totalAmountA = a.transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const totalAmountB = b.transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        return sortOrder === 'asc' ? totalAmountA - totalAmountB : totalAmountB - totalAmountA;
      }
      return 0;
    });
    setFilteredStatements(sortedStatements);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Calculate totals for all filtered statements
  const calculateTotals = () => {
    return filteredStatements.reduce((acc, stmt) => {
      const stmtTotals = stmt.transactions.reduce(
        (sum, tx) => {
          const amount = parseFloat(tx.amount);
          if (tx.type.toLowerCase() === 'credit') {
            sum.totalCredit += amount;
          } else if (tx.type.toLowerCase() === 'debit') {
            sum.totalDebit += amount;
          }
          return sum;
        },
        { totalCredit: 0, totalDebit: 0 }
      );
      
      return {
        totalCredit: acc.totalCredit + stmtTotals.totalCredit,
        totalDebit: acc.totalDebit + stmtTotals.totalDebit,
        netAmount: acc.netAmount + (stmtTotals.totalCredit - stmtTotals.totalDebit)
      };
    }, { totalCredit: 0, totalDebit: 0, netAmount: 0 });
  };



const generatePDF = () => {
  const doc = new jsPDF();

  // Create an image object
  const img = new Image();
  img.src = logo;

  img.onload = () => {
    // Add logo when image is loaded
    doc.addImage(img, 'JPEG', 14, 10, 30, 15); // (x, y, width, height)

    // Title
    doc.setFontSize(18);
    doc.setTextColor(40, 53, 147);
    doc.text(' Summary ', 105, 20, { align: 'center' });

    // Filters
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    let y = 30;
    if (selectedMonth) doc.text(`Month: ${selectedMonth}`, 14, y += 10);
    if (bankNameFilter) doc.text(`Bank: ${bankNameFilter}`, 14, y += 10);

    // Table
    const tableData = filteredStatements.map(stmt => {
      const sum = stmt.transactions.reduce((s, tx) => {
        const amt = parseFloat(tx.amount);
        tx.type.toLowerCase() === 'credit' ? s.credit += amt : s.debit += amt;
        return s;
      }, { credit: 0, debit: 0 });

      return {
        bankName: stmt.bankName,
        credit: `Rs. ${sum.credit.toFixed(2)}`,
        debit: `Rs. ${sum.debit.toFixed(2)}`,
        net: `Rs. ${(sum.credit - sum.debit).toFixed(2)}`
      };
    });

    autoTable(doc, {
      startY: y + 15,
      head: [['Bank Name', 'Total Credit', 'Total Debit', 'Net Amount']],
      body: tableData.map(row => [row.bankName, row.credit, row.debit, row.net]),
      theme: 'grid',
      headStyles: { fillColor: [40, 53, 147], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    const totals = calculateTotals();
    const finalY = doc.lastAutoTable.finalY + 10;



    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Credit: Rs. ${totals.totalCredit.toFixed(2)}`, 14, finalY + 10);
    doc.text(`Total Debit: Rs. ${totals.totalDebit.toFixed(2)}`, 14, finalY + 20);
    doc.text(`Net Amount: Rs. ${totals.netAmount.toFixed(2)}`, 14, finalY + 30);

    // Footer page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10);
    }

    // Save PDF
    doc.save(`Bank_Statement_${selectedMonth || 'All'}_${bankNameFilter || 'All'}.pdf`);
  };
};







  const totals = calculateTotals();

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this statement?')) {
      axios
        .delete(`http://localhost:5001/BankStatementsController/delete/${id}`)
        .then(res => {
          if (res.data.success) {
            setStatements(statements.filter(stmt => stmt._id !== id));
            setFilteredStatements(filteredStatements.filter(stmt => stmt._id !== id));
          } else {
            alert('Failed to delete statement.');
          }
        })
        .catch(err => {
          console.error('Delete failed:', err);
          alert('An error occurred while deleting.');
        });
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-800 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-6xl transition-all duration-300">
      <Link to='/AdminDashboard'><button
              
              className="mb-6 text-blue-900/80 hover:text-black-900 transition flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button></Link>
        <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">Your Bank Statements</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col">
            <label className="text-sm text-blue-900 mb-2">Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border p-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-blue-900"
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm text-blue-900 mb-2">Bank Name:</label>
            <input
              type="text"
              value={bankNameFilter}
              onChange={(e) => setBankNameFilter(e.target.value)}
              placeholder="Search by bank name"
              className="border p-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-blue-900"
            />
          </div>
          
          <div className="flex items-end gap-4">
            <button
              onClick={handleFilter}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all"
            >
              Filter
            </button>

            <button
              onClick={generatePDF}
              className="bg-green-600 text-white px-4 py-1 rounded-lg shadow-md hover:bg-green-700 transition-all"
            >
              Download PDF
            </button>


             <Link to='/BankStatementForm'><button 
                   className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1 rounded-lg shadow transition-all"
                    >Add Statement</button>
                  </Link> 
          </div>
        </div>
        
        {filteredStatements.length === 0 ? (
          <p className="text-center text-blue-600 text-lg">No statements found.</p>
        ) : (
          <>
            <table className="w-full border-collapse rounded-xl overflow-hidden shadow-lg table-auto mb-4">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="p-4 cursor-pointer hover:bg-blue-800 transition-all" onClick={() => handleSort('date')}>
                    Bank <span className="ml-2">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-blue-800 transition-all" onClick={() => handleSort('amount')}>
                    No. of Transactions
                  </th>
                  <th className="p-4">Period</th>
                  <th className="p-4">NET AMOUNT</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="text-blue-900">
                {filteredStatements.map(stmt => (
                  <tr key={stmt._id} className="hover:bg-blue-50 transition-all">
                    <td className="p-4 border-t border-gray-300">{stmt.bankName}</td>
                    <td className="p-4 border-t border-gray-300">{stmt.transactions.length}</td>
                    <td className="p-4 border-t border-gray-300">{stmt.selectedMonth}</td>
                    <td className="p-4 border-t border-gray-300">Rs. {stmt.netAmount.toFixed(2)}</td>
                    <td className="p-4 border-t border-gray-300">
                      <Link to={`/BankStatementDetail/${stmt._id}`} className="text-green-600 hover:underline transition-all">Details →</Link>
                    </td>
                    
                  </tr>
                ))}
              </tbody>

            </table>
            
            {/* Totals Section */}
            <div className="bg-blue-50 p-4 rounded-lg shadow-md mt-6">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">GRAND TOTALS</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-blue-700">Total Credit</p>
                  <p className="text-2xl font-bold text-green-600">Rs. {totals.totalCredit.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-blue-700">Total Debit</p>
                  <p className="text-2xl font-bold text-red-600">Rs. {totals.totalDebit.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-blue-700">Net Amount</p>
                  <p className="text-2xl font-bold text-blue-900">Rs. {totals.netAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BankStatementList;