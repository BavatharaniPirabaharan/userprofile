import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { authAPI } from '../config/api';
import { useNavigate } from 'react-router-dom';
import logo from '../logo.jpg';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';
import { FiDownload, FiFilter, FiDollarSign, FiTrendingUp, FiTrendingDown, FiCreditCard, FiPieChart } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';




const PLstatement = () => {
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
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableYears, setAvailableYears] = useState([]);
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
        extractAvailableDates(newData);
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

  // Extract unique years and months from all data sources
  const extractAvailableDates = (data) => {
    const years = new Set();
    const months = new Set();

    // Helper function to add dates
    const addDates = (dateStr) => {
      if (dateStr) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          years.add(date.getFullYear().toString());
          months.add(date.getMonth() + 1); // 1-12 for months
        }
      }
    };

    // Get dates from bank statements
    data.bankStatements.forEach(stmt => {
      if (stmt.selectedMonth) {
        addDates(stmt.selectedMonth);
      }
    });

    // Get dates from invoices
    data.invoices.forEach(inv => {
      if (inv.date) {
        addDates(inv.date);
      }
      if (inv.createdAt) {
        addDates(inv.createdAt);
      }
    });

    // Get dates from transactions
    data.transactions.forEach(tx => {
      if (tx.date) {
        addDates(tx.date);
      }
      if (tx.createdAt) {
        addDates(tx.createdAt);
      }
    });

    // Get dates from budgets
    data.budgets.forEach(budget => {
      if (budget.month) {
        addDates(budget.month);
      }
    });

    // Get dates from salaries
    data.salaries.forEach(salary => {
      if (salary.salaryMonth) {
        addDates(salary.salaryMonth);
      }
      if (salary.date) {
        addDates(salary.date);
      }
    });

    setAvailableYears(Array.from(years).sort().reverse());
    setAvailableMonths(Array.from(months).sort((a, b) => a - b));
  };

  // Calculate totals when filters or data changes
  useEffect(() => {
    if (data.bankStatements.length > 0) {
      calculateTotals();
    }
  }, [selectedYear, selectedMonth, data]);

  const calculateTotals = () => {
    // Filter data by selected year and month if specified
    const filterByDate = (item, dateField) => {
      if (!selectedYear && !selectedMonth) return true;
      
      const itemDate = new Date(item[dateField]);
      if (isNaN(itemDate.getTime())) return false;
      
      const itemYear = itemDate.getFullYear().toString();
      const itemMonth = (itemDate.getMonth() + 1).toString();
      
      if (selectedYear && selectedMonth) {
        return itemYear === selectedYear && itemMonth === selectedMonth;
      } else if (selectedYear) {
        return itemYear === selectedYear;
      } else if (selectedMonth) {
        return itemMonth === selectedMonth;
      }
      
      return true;
    };
  
    const filteredBankStatements = data.bankStatements.filter(item => 
      filterByDate(item, 'selectedMonth')
    );
    
    const filteredInvoices = data.invoices.filter(item => 
      filterByDate(item, 'date') || filterByDate(item, 'createdAt')
    );
    
    const filteredTransactions = data.transactions.filter(item => 
      filterByDate(item, 'date') || filterByDate(item, 'createdAt')
    );
    
    const filteredBudgets = data.budgets.filter(item => 
      filterByDate(item, 'month')
    );
    
    const filteredSalaries = data.salaries.filter(item => 
      filterByDate(item, 'salaryMonth') || filterByDate(item, 'date')
    );
   

    // Calculate income (invoices + salary + bank credits)
    const invoiceIncome = filteredInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const salaryIncome = filteredSalaries.reduce((sum, sal) => sum + (sal.amount || 0), 0);
    const bankCredits = filteredBankStatements.reduce((sum, stmt) => sum + (stmt.totalCredit || 0), 0);
    const transactionCredits = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalIncome =  transactionCredits + bankCredits;

    // Calculate expenses (budgets + bank debits + debit transactions)
    const budgetExpenses = filteredBudgets.reduce((sum, budget) => sum + (budget.total || 0), 0);
    const bankDebits = filteredBankStatements.reduce((sum, stmt) => sum + (stmt.totalDebit || 0), 0);
    const transactionDebits = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpenses =  bankDebits + transactionDebits;

  
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

  // Generate chart data based on filters
  const generateChartData = () => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    if (selectedYear && selectedMonth) {
      // Show data for specific month
      return [{
        name: months[parseInt(selectedMonth) - 1],
        income: totals.income,
        expenses: totals.expenses
      }];
    } else if (selectedYear) {
      // Show data for all months in selected year
      return months.map((month, index) => {
        const monthData = data.transactions.filter(tx => {
          const txDate = new Date(tx.date || tx.createdAt);
          return txDate.getFullYear().toString() === selectedYear &&
                 (txDate.getMonth() + 1) === (index + 1);
        });

        const monthIncome = monthData
          .filter(tx => tx.type?.toLowerCase() === 'income')
          .reduce((sum, tx) => sum + (tx.amount || 0), 0);

        const monthExpenses = monthData
          .filter(tx => tx.type?.toLowerCase() === 'expense')
          .reduce((sum, tx) => sum + (tx.amount || 0), 0);

        return {
          name: month,
          income: monthIncome,
          expenses: monthExpenses
        };
      });
    } else {
      // Show data for all time
      return months.map((month, index) => {
        const monthData = data.transactions.filter(tx => {
          const txDate = new Date(tx.date || tx.createdAt);
          return (txDate.getMonth() + 1) === (index + 1);
        });

        const monthIncome = monthData
          .filter(tx => tx.type?.toLowerCase() === 'income')
          .reduce((sum, tx) => sum + (tx.amount || 0), 0);

        const monthExpenses = monthData
          .filter(tx => tx.type?.toLowerCase() === 'expense')
          .reduce((sum, tx) => sum + (tx.amount || 0), 0);

        return {
          name: month,
          income: monthIncome,
          expenses: monthExpenses
        };
      });
    }
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
    doc.text('Profit & Loss Statement', 105, 20, { align: 'center' });
  
    // Add date filter info
    doc.setFontSize(12);
    doc.setTextColor(100);
    const periodText = selectedYear && selectedMonth
      ? `Period: ${new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
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
      net: totals.net || 0
    };
    
    // Summary table
    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Amount (Rs.)']],
      body: [
        ['Total Income', safeTotals.income.toFixed(2)],
        ['Total Expenses', safeTotals.expenses.toFixed(2)],
        ['Net Balance', safeTotals.net.toFixed(2)]
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

    // Add Income Breakdown
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Income Breakdown', 14, 20);

    // Bank Statement Income
    const bankIncomeData = data.bankStatements
      .filter(stmt => !selectedYear || stmt.selectedMonth?.includes(selectedYear))
      .map(stmt => [
        stmt.bankName,
        stmt.selectedMonth,
        stmt.totalCredit?.toFixed(2) || '0.00'
      ]);

    autoTable(doc, {
      startY: 25,
      head: [['Source', 'Month', 'Amount']],
      body: bankIncomeData,
      styles: {
        cellPadding: 4,
        fontSize: 10
      },
      columnStyles: {
        2: { halign: 'right' }
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255
      }
    });

    // Transaction Income
    const transactionIncomeData = data.transactions
      .filter(tx => {
        if (!selectedYear) return tx.type?.toLowerCase() === 'income';
        const txDate = tx.date || tx.createdAt;
        return txDate?.includes(selectedYear) && tx.type?.toLowerCase() === 'income';
      })
      .map(tx => [
        tx.name || 'N/A',
        tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A',
        tx.amount?.toFixed(2) || '0.00',
        tx.category || 'N/A'
      ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Description', 'Date', 'Amount', 'Category']],
      body: transactionIncomeData,
      styles: {
        cellPadding: 4,
        fontSize: 10
      },
      columnStyles: {
        2: { halign: 'right' }
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255
      }
    });

    // Add Expenses Breakdown
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Expenses Breakdown', 14, 20);

    // Bank Statement Expenses
    const bankExpenseData = data.bankStatements
      .filter(stmt => !selectedYear || stmt.selectedMonth?.includes(selectedYear))
      .map(stmt => [
        stmt.bankName,
        stmt.selectedMonth,
        stmt.totalDebit?.toFixed(2) || '0.00'
      ]);

    autoTable(doc, {
      startY: 25,
      head: [['Source', 'Month', 'Amount']],
      body: bankExpenseData,
      styles: {
        cellPadding: 4,
        fontSize: 10
      },
      columnStyles: {
        2: { halign: 'right' }
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255
      }
    });

    // Transaction Expenses
    const transactionExpenseData = data.transactions
      .filter(tx => {
        if (!selectedYear) return tx.type?.toLowerCase() === 'expense';
        const txDate = tx.date || tx.createdAt;
        return txDate?.includes(selectedYear) && tx.type?.toLowerCase() === 'expense';
      })
      .map(tx => [
        tx.name || 'N/A',
        tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A',
        tx.amount?.toFixed(2) || '0.00',
        tx.category || 'N/A'
      ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Description', 'Date', 'Amount', 'Category']],
      body: transactionExpenseData,
      styles: {
        cellPadding: 4,
        fontSize: 10
      },
      columnStyles: {
        2: { halign: 'right' }
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255
      }
    });
  
    // Save the PDF
    const fileName = selectedYear && selectedMonth
      ? `profit_loss_statement_${selectedYear}-${selectedMonth}.pdf`
      : `profit_loss_statement_all_time.pdf`;
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Profit & Loss Statement</h1>
                <p className="mt-2 text-gray-600">Comprehensive overview of your financial performance</p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-3">
                <div className="relative">
                  <FiFilter className="absolute left-3 top-3 text-gray-400" />
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">All Years</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <FiFilter className="absolute left-3 top-3 text-gray-400" />
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">All Months</option>
                    {availableMonths.map(month => (
                      <option key={month} value={month}>
                        {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={generatePDF}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm"
                >
                  <FiDownload />
                  Export PDF
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
        >
          {/* Income Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={cardHover}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Income</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {profile.currency} {totals.income.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FiTrendingUp size={24} />
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span>{selectedYear && selectedMonth ? `${selectedYear}-${selectedMonth}` : 'All Time Period'}</span>
            </div>
          </motion.div>

          {/* Expenses Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={cardHover}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Expenses</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {profile.currency} {totals.expenses.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <FiTrendingDown size={24} />
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span>{selectedYear && selectedMonth ? `${selectedYear}-${selectedMonth}` : 'All Time Period'}</span>
            </div>
          </motion.div>

          {/* Net Balance Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={cardHover}
            className={`bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-all ${
              totals.net >= 0 ? 'border-green-100' : 'border-red-100'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {totals.net >= 0 ? 'Net Profit' : 'Net Loss'}
                </p>
                <p className={`text-3xl font-bold mt-1 ${
                  totals.net >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {profile.currency} {Math.abs(totals.net).toFixed(2)}
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                totals.net >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                <FiDollarSign size={24} />
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span>{selectedYear && selectedMonth ? `${selectedYear}-${selectedMonth}` : 'All Time Period'}</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Financial Overview Chart */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Financial Overview</h2>
              {/* <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full">Monthly</button>
                <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">Yearly</button>
              </div> */}
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={generateChartData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" fill="#4ade80" name="Income" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#f87171" name="Expenses" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Data Tables */}
        <motion.div 
          variants={containerVariants}
          className="space-y-6"
        >
          {/* Bank Statements Table */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Bank Statements</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debits</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Balance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.bankStatements
                      .filter(stmt => !selectedYear || stmt.selectedMonth?.includes(selectedYear))
                      .map((stmt, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stmt.bankName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stmt.selectedMonth}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{profile.currency} {stmt.totalCredit?.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{profile.currency} {stmt.totalDebit?.toFixed(2)}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                            stmt.netAmount >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {profile.currency} {stmt.netAmount?.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Transactions Table */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Transactions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.transactions
                      .filter(tx => {
                        if (!selectedYear) return true;
                        const txDate = tx.date || tx.createdAt;
                        return txDate?.includes(selectedYear);
                      })
                      .map((transaction, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.type?.toLowerCase() === 'income' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type || 'N/A'}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                            transaction.type?.toLowerCase() === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {profile.currency} {transaction.amount?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.category || 'N/A'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PLstatement;
