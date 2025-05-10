import React, { useState, useEffect } from 'react';
import { FaChartBar, FaArrowUp, FaArrowDown, FaChartLine } from 'react-icons/fa';
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

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  useEffect(() => {
    fetchReportData();
  }, [selectedYear, selectedPeriod]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [monthlyOverview, categoryDistribution] = await Promise.all([
        reportService.getMonthlyOverview(selectedYear),
        reportService.getCategoryDistribution(selectedPeriod),
      ]);

      setMonthlyData(monthlyOverview);
      setCategoryData(categoryDistribution);
    } catch (error) {
      toast.error('Failed to fetch report data');
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = monthlyData.reduce((sum, month) => sum + month.income, 0);
  const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0);
  const netSavings = totalIncome - totalExpenses;

  const stats = [
    {
      title: 'Total Income',
      value: `$${totalIncome.toFixed(2)}`,
      icon: FaArrowUp,
      color: 'bg-green-500',
      change: '+12.3%',
      changeColor: 'text-green-600',
    },
    {
      title: 'Total Expenses',
      value: `$${totalExpenses.toFixed(2)}`,
      icon: FaArrowDown,
      color: 'bg-red-500',
      change: '-5.2%',
      changeColor: 'text-red-600',
    },
    {
      title: 'Net Savings',
      value: `$${netSavings.toFixed(2)}`,
      icon: FaChartLine,
      color: 'bg-blue-500',
      change: '+8.1%',
      changeColor: 'text-blue-600',
    },
  ];

  return (
    <div className="space-y-6 bg-white">
      {/* Period Selection */}
      <div className="flex justify-between bg-white items-center">
        <h2 className="text-2xl font-semibold bg-white text-gray-800">Financial Reports</h2>
        <div className="flex bg-white gap-4">
          {/* Future selection controls can go here */}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">{stat.title}</p>
                <p className="text-2xl font-semibold mt-1 text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${stat.changeColor}`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-600 ml-1">vs last period</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
