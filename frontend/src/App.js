// export default App;
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard'; // User dashboard
import Assistant from './pages/Assistant';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import SubscriptionDetails from './pages/SubscriptionDetails';
import NotFound from './pages/NotFound';

// Components
import Layout from './components/Layout';

// Transaction-related components
import AccountSelection from './transaction/Accountsection';
import TransactionDashboard from './transaction/Dashboard'; // Renamed to avoid conflict
import Reports from './transaction/Reports';
import Transactions from './transaction/Transactions';
import TransactionForm from './transaction/TransactionForm';
// import Home from './Pages/Home';
import BankStatements from './Bankstatement/BankStatements';
import HomeWelcome from './Dashboard/HomeWelcome';
import Budget from './TransactionHistory/Budget';
import Chart from './TransactionHistory/Chart';
import AdminDashboard from './Dashboard/AdminDashboard';

import CreateInvoices from './TransactionHistory/CreateInvoices';
import EditInvoices from './TransactionHistory/EditInvoices';
import Invoices from './TransactionHistory/Invoices';
import BudgetData from './TransactionHistory/BudgetData';
import BankStatementForm from './Bankstatement/Bankstatementtransaction';
import BankStatementSummary from './Bankstatement/BankStatementSumary';
import BankStatementDetail from './Bankstatement/BankStatementDetails';
import EditBankStatement from './Bankstatement/EditbankStatement';
import BalanceSheet from './Bankstatement/BalanceSheet';
import PerformanceChart from './transaction/PerformanceChart';


import SalaryForm from "./Salary/SalaryForm";
import Settings from "./pages/Settings";
import SalaryDisplay from './Salary/SalaryDisplay';
import HomeSalary from './pages/HomeSalary';
import PLstatement from './Salary/PLstatement';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        
          <Routes>
            {/* Auth routes */}
            <Route path='/' element={<HomeWelcome />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/subscription' element={<Subscription />} />
            <Route path="/assistant" element={<Assistant />} />

            {/* Protected routes */}
            
              {/* <Route index element={<Navigate to="/dashboard" replace />} /> */}
              <Route path="dashboard" element={<Dashboard />} /> {/* User dashboard */}
              <Route path="profile" element={<Profile />} />
              <Route path="subscription-details" element={<SubscriptionDetails />} />
         

            {/* Public routes */}
            {/* <Route path="/Home" element={<Home />} /> */}
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
            <Route path="/AccountSelection" element={<AccountSelection />} />
            <Route path="/TransactionDashboard" element={<TransactionDashboard />} /> {/* Transaction dashboard */}
            <Route path="/Reports" element={<Reports />} />
            <Route path="/Transactions" element={<Transactions />} />
            <Route path="/TransactionForm" element={<TransactionForm />} />
            <Route path="/BankStatements" element={<BankStatements />} />
            <Route path="/CreateInvoices" element={<CreateInvoices />} />
            <Route path="/Invoices" element={<Invoices />} />
            <Route path="/EditInvoices/:id" element={<EditInvoices />} />
            <Route path="/Chart" element={<Chart />} />
            <Route path="/Budget" element={<Budget />} />
            <Route path="/BudgetData" element={<BudgetData />} />
            <Route path="/BankStatementForm" element={<BankStatementForm />} />
            <Route path="/BankStatementSummary" element={<BankStatementSummary />} />
            <Route path="/BankStatementDetail/:id" element={<BankStatementDetail />} />
            <Route path="/EditBankStatement/:id" element={<EditBankStatement />} />
            <Route path="/BalanceSheet" element={<BalanceSheet />} />
            <Route path="/PerformanceChart" element={<PerformanceChart />} />
            <Route path="/PLstatement" element={<PLstatement />} />




            <Route path="/SalaryForm" element={<SalaryForm />} />
            <Route path="/Settings" element={<Settings />} />
            <Route path="/SalaryDisplay" element={<SalaryDisplay />} />
            <Route path="/HomeSalary" element={<HomeSalary />} />


            {/* 404 route */}
            <Route path='*' element={<NotFound />} />
          </Routes>
       
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
