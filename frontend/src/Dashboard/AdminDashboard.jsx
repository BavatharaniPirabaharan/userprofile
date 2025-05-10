// export default AdminDashboard;
import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import Chart from "../TransactionHistory/Chart";
import Invoices from "../TransactionHistory/Invoices";
import Transactions from "../transaction/Transactions";
import BudgetData from "../TransactionHistory/BudgetData";
import HomeSalary from "../pages/HomeSalary";
import BankStatementList from "../Bankstatement/BankStatementSumary";
import BalanceSheet from "../Bankstatement/BalanceSheet";
// import Profile from "../pages/Profile"; 
import PLstatement from "../Salary/PLstatement";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [currentSection, setCurrentSection] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", title: "Analytics" },
    { id: "Invoices", title: "Invoices" },
    { id: "Budget", title: "Budget" },
    { id: "Transactions", title: "Transactions" },
    { id: "Payroll", title: "Payroll" },
    { id: "Bank", title: "Bank Accounts" },
    { id: "BalanceSheet", title: "BalanceSheet Details" },
    { id: "PLstatement", title: "PLstatement" }
  ];

  const renderSection = () => {
    switch (currentSection) {
      case "dashboard":
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Financial Overview
            </h3>
            <Chart />
          </div>
        );
      case "Invoices":
        return <Invoices />;
      case "Budget":
        return <BudgetData />;
      case "Transactions":
        return <Transactions />;
      case "Payroll":
        return <HomeSalary />;
      case "Bank":
        return <BankStatementList />;
      case "BalanceSheet":
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Overall Financial Summary
            </h3>
            <BalanceSheet />
          </div>
        );
      case "PLstatement":
        return (
        
            <PLstatement />

        );
      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md text-blue-900">
            <h2 className="text-xl font-semibold mb-4">
              Welcome to Financial Dashboard
            </h2>
            <p>Select a section from the navigation to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen ml-18 bg-gray-100 font-sans">
      {/* Navbar */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-blue-600">axento</h1>
            <nav className="hidden md:flex gap-6">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentSection(item.id)}
                  className={`px-3 py-2 font-medium transition-all duration-150 rounded-md ${
                    currentSection === item.id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white shadow px-4 py-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentSection(item.id)}
            className={`w-full text-left px-4 py-2 rounded-md mb-1 text-sm font-medium ${
              currentSection === item.id
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.title}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {renderSection()}
      </main>
    </div>
  );
};

export default AdminDashboard;
