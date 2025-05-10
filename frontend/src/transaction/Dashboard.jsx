import React, { useState, useEffect } from 'react';
import { FaWallet, FaArrowUp, FaArrowDown, FaChartLine, FaSync } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Minimal service implementations to fix undefined errors
const transactionService = {
  getAll: async ({ limit } = {}) => {
    // This is just a placeholder - replace with actual API call
    return [];
  }
};

const reportService = {
  getMonthlyOverview: async (year) => {
    // This is just a placeholder - replace with actual API call
    return {};
  }
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0,
    incomeChange: 0,
    expensesChange: 0,
    savingsChange: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [transactions, monthlyOverview] = await Promise.all([
        transactionService.getAll({ limit: 5 }),
        reportService.getMonthlyOverview(new Date().getFullYear()),
      ]);

      const currentMonth = new Date().getMonth();
      const previousMonth = currentMonth - 1;

      const currentMonthData = monthlyOverview[currentMonth] || { income: 0, expenses: 0 };
      const previousMonthData = monthlyOverview[previousMonth] || { income: 0, expenses: 0 };

      const totalBalance = transactions.reduce((sum, t) => 
        sum + (t.type === 'income' ? t.amount : -t.amount), 0
      );

      const monthlyIncome = currentMonthData.income || 0;
      const monthlyExpenses = currentMonthData.expenses || 0;
      const savingsRate = monthlyIncome > 0 
        ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 
        : 0;

      const incomeChange = previousMonthData.income > 0
        ? ((currentMonthData.income - previousMonthData.income) / previousMonthData.income) * 100
        : 0;

      const expensesChange = previousMonthData.expenses > 0
        ? ((currentMonthData.expenses - previousMonthData.expenses) / previousMonthData.expenses) * 100
        : 0;

      const savingsChange = previousMonthData.income > 0
        ? ((savingsRate - ((previousMonthData.income - previousMonthData.expenses) / previousMonthData.income) * 100))
        : 0;

      setStats({
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        savingsRate,
        incomeChange,
        expensesChange,
        savingsChange,
      });

      setRecentTransactions(transactions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to connect to the server. Please make sure the backend server is running.');
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Balance',
      value: `$${stats.totalBalance.toFixed(2)}`,
      icon: FaWallet,
      color: 'bg-blue-500',
      change: `${stats.savingsChange >= 0 ? '+' : ''}${stats.savingsChange.toFixed(1)}%`,
      changeColor: stats.savingsChange >= 0 ? 'text-green-500' : 'text-red-500',
    },
    {
      title: 'Monthly Income',
      value: `$${stats.monthlyIncome.toFixed(2)}`,
      icon: FaArrowUp,
      color: 'bg-green-500',
      change: `${stats.incomeChange >= 0 ? '+' : ''}${stats.incomeChange.toFixed(1)}%`,
      changeColor: stats.incomeChange >= 0 ? 'text-green-500' : 'text-red-500',
    },
    {
      title: 'Monthly Expenses',
      value: `$${stats.monthlyExpenses.toFixed(2)}`,
      icon: FaArrowDown,
      color: 'bg-red-500',
      change: `${stats.expensesChange >= 0 ? '+' : ''}${stats.expensesChange.toFixed(1)}%`,
      changeColor: stats.expensesChange >= 0 ? 'text-red-500' : 'text-green-500',
    },
    {
      title: 'Savings Rate',
      value: `${stats.savingsRate.toFixed(1)}%`,
      icon: FaChartLine,
      color: 'bg-purple-500',
      change: `${stats.savingsChange >= 0 ? '+' : ''}${stats.savingsChange.toFixed(1)}%`,
      changeColor: stats.savingsChange >= 0 ? 'text-green-500' : 'text-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-red-800">Connection Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FaSync className="mr-2" />
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
              <div key={stat.title} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-full text-white`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className={`text-sm font-medium ${stat.changeColor}`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            </div>
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {transaction.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;