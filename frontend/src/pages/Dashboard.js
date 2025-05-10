// export default Dashboard;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AccountCircle,
  TrendingUp,
  People,
  ShoppingCart,
  Assessment,
  MoreVert as MoreVertIcon,
  Dashboard as DashboardIcon,
  Chat as ChatIcon,
  Description as DescriptionIcon,
  AttachMoney,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import PerformanceChart from '../transaction/PerformanceChart';

const statsData = [
  {
    title: 'Total Sales',
    value: '$24,500',
    icon: <TrendingUp />,
    color: 'bg-blue-500',
    progress: 75,
  },
  {
    title: 'Total Customers',
    value: '1,250',
    icon: <People />,
    color: 'bg-green-500',
    progress: 85,
  },
  {
    title: 'Total Orders',
    value: '450',
    icon: <ShoppingCart />,
    color: 'bg-orange-500',
    progress: 65,
  },
  {
    title: 'Total Revenue',
    value: '$45,000',
    icon: <Assessment />,
    color: 'bg-red-500',
    progress: 80,
  },
];

const recentActivities = [
  {
    action: 'New order received',
    time: '2 minutes ago',
    amount: '$350.00',
  },
  {
    action: 'Customer payment received',
    time: '15 minutes ago',
    amount: '$520.50',
  },
  {
    action: 'New customer registered',
    time: '1 hour ago',
    amount: null,
  },
  {
    action: 'Order #2458 shipped',
    time: '2 hours ago',
    amount: '$145.00',
  },
];

const subscriptionData = [
  {
    id: 1,
    name: 'Basic Plan',
    pdfUrl: '/path/to/pdf1.pdf',
    uploadDate: '2024-04-29',
  },
  {
    id: 2,
    name: 'Premium Plan',
    pdfUrl: '/path/to/pdf2.pdf',
    uploadDate: '2024-04-28',
  },
];

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
  };
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
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

      


  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        const res = await axios.get('http://localhost:5001/TransactionController/getTransaction');
        // Sort by date and take first 4
        const sortedTransactions = res.data
          .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
          .slice(0, 4);
        setRecentTransactions(sortedTransactions);
      } catch (error) {
        console.error('Error fetching recent transactions:', error);
      } finally {
        setLoadingTransactions(false);
      }
    };
  
    fetchRecentTransactions();
  }, []);

 

  // Format transaction for display
  const formatTransactionActivity = (transaction) => {
    return {
      name: transaction.name, // Make sure to include name here
      action: `${transaction.type === 'income' ? 'Income' : 'Expense'}: ${transaction.name}`,
      time: formatTime(transaction.createdAt || transaction.date),
      amount: transaction.type === 'income' ? `+${transaction.amount}` : `-${transaction.amount}`
    };
  };
  const formatTime = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className="flex bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-60 h-screen fixed bg-white shadow-md">
        <div className="pt-16 overflow-auto h-full">
          <ul className="space-y-1 p-4">
            <li>
              <button 
                onClick={() => handleNavigate('/AdminDashboard')}
                className="flex items-center p-3 w-full hover:bg-blue-50 rounded-lg text-blue-600 font-medium transition-colors"
              >
                <DashboardIcon className="mr-3" />
                <span>Panel</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNavigate('/profile')}
                className="flex items-center p-3 w-full hover:bg-blue-50 rounded-lg text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                <AccountCircle className="mr-3" />
                <span>Profile</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNavigate('/assistant')}
                className="flex items-center p-3 w-full hover:bg-blue-50 rounded-lg text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                <ChatIcon className="mr-3" />
                <span>AI Chat</span>
              </button>
            </li>
            
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-60">
        {/* AppBar */}
        <div className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-semibold text-gray-800">Dashboard Overview</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{currentUser?.email}</span>
              </div>
              <button
                onClick={handleMenu}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <AccountCircle className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat) => (
              <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                      <p className="text-2xl font-semibold mt-1 text-gray-800">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg text-white`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${stat.color} h-2 rounded-full`}
                        style={{ width: `${stat.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{stat.progress}% of target</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart and Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Chart - Takes 2/3 width on large screens */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Financial Performance</h2>
                {/* <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full">Monthly</button>
                  <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">Yearly</button>
                </div> */}
              </div>
              <div className="h-80">
                <PerformanceChart />
              </div>
            </div>

            {/* Recent Activities - Takes 1/3 width on large screens */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertIcon />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {loadingTransactions ? (
                  <div className="p-6 text-center text-gray-500">Loading transactions...</div>
                ) : recentTransactions.length > 0 ? (
                  recentTransactions.slice(0, 4).map((transaction, index) => {
                    const activity = formatTransactionActivity(transaction);
                    return (
                      <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full mr-3 ${
                            transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.type === 'income' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{transaction.name}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                          <p className={`text-sm font-medium ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {activity.amount}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-gray-500">No recent transactions</div>
                )}
              </div>
              <div className="p-4 border-t border-gray-200 text-center">
                <button 
                  onClick={() => handleNavigate('/transactions')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Transactions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Dashboard;