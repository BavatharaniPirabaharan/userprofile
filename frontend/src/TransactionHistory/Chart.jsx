import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';

const FinancialCharts = () => {
  const [budgetData, setBudgetData] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Color palette
  const COLORS = {
    income: '#10b981',    // Green
    expense: '#ef4444',   // Red
    budget: '#3b82f6',    // Blue
    savings: '#f59e0b'    // Amber
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch budget data
        const budgetResponse = await axios.get('http://localhost:5001/BudgetController/getBudgets');
        console.log('Budget Response:', budgetResponse.data);

        // Fetch transaction data
        const transactionResponse = await axios.get('http://localhost:5001/TransactionController/getTransaction');
        console.log('Transaction Response:', transactionResponse.data);

        // Process budget data
        const formattedBudget = budgetResponse.data.budgets.map(budget => ({
          month: budget.month,
          incomeBudget: parseFloat(budget.income) || 0,
          expenseBudget: parseFloat(budget.total) || 0,
          plannedSavings: parseFloat(budget.balance) || 0
        }));

        // Process transaction data by month
        const monthlyData = {};

        // Initialize with budget data
        formattedBudget.forEach(budget => {
          monthlyData[budget.month] = {
            ...budget,
            income: 0,
            expense: 0,
            actualSavings: 0
          };
        });

        // Process transactions
        transactionResponse.data.forEach(transaction => {
          const date = new Date(transaction.createdAt);
          const month = date.toLocaleString('default', { month: 'long' });
          
          if (!monthlyData[month]) {
            monthlyData[month] = {
              month,
              incomeBudget: 0,
              expenseBudget: 0,
              plannedSavings: 0,
              income: 0,
              expense: 0,
              actualSavings: 0
            };
          }

          const amount = parseFloat(transaction.amount) || 0;
          if (transaction.type === 'income') {
            monthlyData[month].income += amount;
          } else {
            monthlyData[month].expense += amount;
          }
          monthlyData[month].actualSavings = monthlyData[month].income - monthlyData[month].expense;
        });

        const processedData = Object.values(monthlyData).sort((a, b) => {
          const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
          return months.indexOf(a.month) - months.indexOf(b.month);
        });

        console.log('Processed Data:', processedData);
        setTransactionData(processedData);

      } catch (error) {
        console.error('Error in data processing:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold">Loading financial insights...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!transactionData || transactionData.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold">No data available for charts.</div>
      </div>
    );
  }

  // Calculate totals for pie chart
  const totalIncome = transactionData.reduce((sum, t) => sum + (t.income || 0), 0);
  const totalExpense = transactionData.reduce((sum, t) => sum + (t.expense || 0), 0);
  const categoryData = [
    { name: 'Income', value: totalIncome },
    { name: 'Expenses', value: totalExpense }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Financial Performance Dashboard</h1>
      
      {/* Debug Info */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">Data Points: {transactionData.length}</p>
        <p className="text-sm text-gray-600">Total Income: {totalIncome}</p>
        <p className="text-sm text-gray-600">Total Expenses: {totalExpense}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 1. Budget vs Actual Comparison */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Budget vs Actual Performance</h2>
          <div style={{ height: 400 }}>
            <ResponsiveContainer>
              <ComposedChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="incomeBudget" fill={COLORS.budget} name="Planned Income" opacity={0.7} />
                <Bar dataKey="expenseBudget" fill="#cbd5e1" name="Planned Expenses" opacity={0.7} />
                <Line type="monotone" dataKey="income" stroke={COLORS.income} strokeWidth={2} name="Actual Income" />
                <Line type="monotone" dataKey="expense" stroke={COLORS.expense} strokeWidth={2} name="Actual Expenses" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Savings Trend */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Savings Trend</h2>
          <div style={{ height: 400 }}>
            <ResponsiveContainer>
              <AreaChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="actualSavings" 
                  stroke={COLORS.savings} 
                  fill={COLORS.savings} 
                  fillOpacity={0.2} 
                  name="Actual Savings" 
                />
                <Area 
                  type="monotone" 
                  dataKey="plannedSavings" 
                  stroke="#94a3b8" 
                  fill="#e2e8f0" 
                  fillOpacity={0.2} 
                  name="Planned Savings" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Income vs Expense Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Income vs Expense Distribution</h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill={COLORS.income} />
                  <Cell fill={COLORS.expense} />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Monthly Budget Overview */}
        <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Budget Overview</h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" stackId="a" fill={COLORS.income} name="Income" />
                <Bar dataKey="expense" stackId="a" fill={COLORS.expense} name="Expenses" />
                <Bar dataKey="actualSavings" fill={COLORS.savings} name="Net Savings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialCharts;