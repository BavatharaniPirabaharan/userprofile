import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { authAPI } from '../config/api';
import { useNavigate } from 'react-router-dom';
import logo from '../logo.jpg'
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';




const BalanceSheet = () => {
  const [profile, setProfile] = useState({
    currency: 'USD',
    nonCurrentAssets: 0,
    liabilities: 0,
    equity: 0
  });
  const [data, setData] = useState({
    bankStatements: [],
    invoices: [],
    transactions: [],
    budgets: [],
    salaries: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [totals, setTotals] = useState({
    income: 0,
    expenses: 0,
    net: 0,
    assets: 0,
    liabilities: 0,
    equity: 0
  });

  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const cardHover = {
    scale: 1.02,
    transition: { duration: 0.3 }
  };

  // Fetch all data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          bankStatementsRes,
          invoicesRes,
          transactionsRes,
          budgetsRes,
          salariesRes
        ] = await Promise.all([
          axios.get('http://localhost:5001/BankStatementsController/get'),
          axios.get('http://localhost:5001/InvoiceController/getIn'),
          axios.get('http://localhost:5001/TransactionController/getTransaction'),
          axios.get('http://localhost:5001/BudgetController/getBudgets'),
          axios.get('http://localhost:5001/api/employees')
        ]);
  
        console.log('Bank Statements:', bankStatementsRes.data);
        console.log('Invoices:', invoicesRes.data);
        console.log('Transactions:', transactionsRes.data);
        console.log('Budgets:', budgetsRes.data);
        console.log('Salaries:', salariesRes.data);
  
        const newData = {
          bankStatements: bankStatementsRes.data.success ? bankStatementsRes.data.statements : [],
          invoices: Array.isArray(invoicesRes.data) ? invoicesRes.data : [], // Modified
          transactions: Array.isArray(transactionsRes.data) ? transactionsRes.data : [], // Modified
          budgets: budgetsRes.data.success ? budgetsRes.data.budgets : [],
          salaries: Array.isArray(salariesRes.data) ? salariesRes.data : [] // Modified
        };
  
        setData(newData);
        extractAvailableMonths(newData);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
    fetchData();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.data.user) {
        const profileResponse = await authAPI.getFullProfile();
        setProfile(profileResponse.data);
      } else {
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Extract unique months from all data sources
  const extractAvailableMonths = (data) => {
    const months = new Set();

    // Get months from bank statements
    data.bankStatements.forEach(stmt => {
      if (stmt.selectedMonth) {
        months.add(stmt.selectedMonth.slice(0, 7)); // YYYY-MM format
      }
    });

    // Get months from invoices
    data.invoices.forEach(inv => {
      if (inv.date) {
        months.add(inv.createdAt.slice(0, 7));
      }
    });

    // Get months from budgets
    data.budgets.forEach(budget => {
      if (budget.month) {
        months.add(budget.month.slice(0, 7));
      }
    });

    // Get months from salaries
    data.salaries.forEach(salary => {
      if (salary.salaryMonth) {
        months.add(salary.salaryMonth.slice(0, 7));
      }
    });

    setAvailableMonths(Array.from(months).sort().reverse());
  };

  // Calculate totals when month or data changes
  useEffect(() => {
    if (data.bankStatements.length > 0) {
      calculateTotals();
    }
  }, [selectedMonth, data]);

  const calculateTotals = () => {
    // Filter data by selected month if specified
    const filterByMonth = (item, dateField) => {
      if (!selectedMonth) return true;
      
      const itemDate = item[dateField];
      if (!itemDate) return false;
      
      return itemDate.includes(selectedMonth);
    };
  
    const filteredBankStatements = data.bankStatements.filter(item => 
      filterByMonth(item, 'selectedMonth')
    );
    
    const filteredInvoices = data.invoices.filter(item => 
      filterByMonth(item, 'date') || filterByMonth(item, 'createdAt')
    );
    
    const filteredTransactions = data.transactions.filter(item => 
      filterByMonth(item, 'date') || filterByMonth(item, 'createdAt')
    );
    
    const filteredBudgets = data.budgets.filter(item => 
      filterByMonth(item, 'month')
    );
    
    const filteredSalaries = data.salaries.filter(item => 
      filterByMonth(item, 'salaryMonth') || filterByMonth(item, 'date')
    );
   

    // Calculate income (invoices + salary + bank credits)
    const invoiceIncome = filteredInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const salaryIncome = filteredSalaries.reduce((sum, sal) => sum + (sal.baseSalary || 0), 0);
    const bankCredits = filteredBankStatements.reduce((sum, stmt) => sum + (stmt.totalCredit || 0), 0);
    const transactioncredits = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    const totalIncome = invoiceIncome + bankCredits+transactioncredits;

    // Calculate expenses (budgets + bank debits + debit transactions)
    const budgetExpenses = filteredBudgets.reduce((sum, budget) => sum + (budget.total || 0), 0);
    const bankDebits = filteredBankStatements.reduce((sum, stmt) => sum + (stmt.totalDebit || 0), 0);
    const transactionDebits = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpenses =  bankDebits + transactionDebits+salaryIncome;

  
    const totalAssets = filteredBankStatements
    .reduce((sum, stmt) => sum + (stmt.netAmount > 0 ? stmt.netAmount : 0), 0) 
    + (parseFloat(profile.nonCurrentAssets) || 0);

  const totalLiabilities = filteredBankStatements
    .reduce((sum, stmt) => sum + (stmt.netAmount < 0 ? Math.abs(stmt.netAmount) : 0), 0) 
    + (parseFloat(profile.liabilities) || 0);

  const totalEquity = (parseFloat(profile.equity) || 0);

  setTotals({
    income: totalIncome,
    expenses: totalExpenses,
    net: totalIncome - totalExpenses,
    assets: totalAssets,
    liabilities: totalLiabilities,
    equity: totalEquity,
    currency: profile.currency
  });
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm'
    });
  
    // Add logo and title
    if (logo) {
      doc.addImage(logo, 'JPEG', 10, 10, 30, 30);
    }
  
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text('Financial Balance Sheet', 105, 20, { align: 'center' });
  
    // Add date filter info
    doc.setFontSize(12);
    doc.setTextColor(100);
    const periodText = selectedMonth
      ? `Period: ${new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
      : 'Period: All Time';
    doc.text(periodText, 105, 30, { align: 'center' });
  
    // Current date
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generated on: ${currentDate}`, 200, 290, { align: 'right' });
  
    // Add summary cards section
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text('Financial Summary', 14, 45);
    
  
    // Safeguard totals
    const safeTotals = {
      income: totals.income || 0,
      expenses: totals.expenses || 0,
      net: totals.net || 0,
      assets: totals.assets || 0,
      liabilities: totals.liabilities || 0,
      equity: totals.equity || 0
    };
    
  
    // Summary table
    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Amount (Rs.)']],
      body: [
        ['Total Income', safeTotals.income.toFixed(2)],
        ['Total Expenses', safeTotals.expenses.toFixed(2)],
        ['Net Balance', safeTotals.net.toFixed(2)],
        ['Total Assets', safeTotals.assets.toFixed(2)],
        ['Total Liabilities', safeTotals.liabilities.toFixed(2)],
        ['Equity', safeTotals.equity.toFixed(2)]
      ],
      styles: {
        cellPadding: 5,
        fontSize: 12,
        halign: 'left'
      },
      columnStyles: {
        1: { halign: 'right' }
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.row.index === 2) {
          const fillColor = safeTotals.net >= 0 ? [200, 230, 200] : [230, 200, 200];
          doc.setFillColor(...fillColor);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        }
      }
    });

    
  
    // Save the PDF
    const fileName = selectedMonth
      ? `balance_sheet_${selectedMonth}.pdf`
      : `balance_sheet_all_time.pdf`;
    doc.save(fileName);
  };
  


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading financial data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-xl shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Financial Balance Sheet</h1>
                <p className="mt-2 text-blue-100">Comprehensive overview of all financial activities</p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-4">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="p-2 rounded-lg border border-blue-300 bg-blue-700 bg-opacity-30 text-white focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                >
                  <option value="">All Time</option>
                  {availableMonths.map(month => (
                    <option key={month} value={month}>
                      {new Date(month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </option>
                  ))}
                </select>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generatePDF}
                  className="bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-md"
                >
                  Download PDF
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6"
        >
          {/* Income Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={cardHover}
            className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-green-200 text-green-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800">Total Income</h3>
            </div>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {profile.currency} {totals.income.toFixed(2)}
            </p>
            <p className="text-sm text-green-600 mt-1">
              {selectedMonth || 'All Time'}
            </p>
          </motion.div>

          {/* Expenses Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={cardHover}
            className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-red-200 text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-800">Total Expenses</h3>
            </div>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {profile.currency} {totals.expenses.toFixed(2)}
            </p>
            <p className="text-sm text-red-600 mt-1">
              {selectedMonth || 'All Time'}
            </p>
          </motion.div>

          {/* Net Balance Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={cardHover}
            className={`rounded-xl p-6 shadow-md hover:shadow-lg transition-all ${
              totals.net >= 0 
                ? 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200' 
                : 'bg-gradient-to-br from-red-50 to-red-100 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-full ${
                totals.net >= 0 ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className={`text-lg font-semibold ${
                totals.net >= 0 ? 'text-green-800' : 'text-red-800'
              }`}>
                {totals.net >= 0 ? 'Net Profit' : 'Net Loss'}
              </h3>
            </div>
            <p className={`text-3xl font-bold mt-2 ${
              totals.net >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {profile.currency} {Math.abs(totals.net).toFixed(2)}
            </p>
            <p className={`text-sm mt-1 ${
              totals.net >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {selectedMonth || 'All Time'}
            </p>
          </motion.div>
        </motion.div>

        {/* Assets & Liabilities Section */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-6"
        >
          {/* Assets Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={cardHover}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-blue-200 text-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-800">Total Assets</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {profile.currency} {totals.assets.toFixed(2)}
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Bank Assets:</span>
                <span className="text-sm font-medium text-blue-800">
                  {profile.currency} {(totals.assets - (parseFloat(profile.nonCurrentAssets) || 0).toFixed(2))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Non-Current Assets:</span>
                <span className="text-sm font-medium text-blue-800">
                  {profile.currency} {(parseFloat(profile.nonCurrentAssets) || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Liabilities Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={cardHover}
            className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-amber-200 text-amber-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-amber-800">Total Liabilities</h3>
            </div>
            <p className="text-3xl font-bold text-amber-600 mt-2">
              {profile.currency} {totals.liabilities.toFixed(2)}
            </p>
          </motion.div>

          {/* Equity Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={cardHover}
            className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-purple-200 text-purple-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-purple-800">Equity</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {profile.currency} {totals.equity.toFixed(2)}
            </p>
          </motion.div>
        </motion.div>

        
      /</motion.div>
    </div>
  );
};

export default BalanceSheet;