import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'jspdf-autotable';
import logo from '../logo.jpg';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import { Link } from 'react-router-dom';

const BudgetData = () => {
  const [budgets, setBudgets] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ month: '', income: 0, categories: [], total: 0, balance: 0, status: '' });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/BudgetController/getBudgets`);
      setBudgets(response.data.budgets);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };


  const downloadPDF = () => {
    const doc = new jsPDF();
  
    // Add logo if needed (optional)
    const img = new Image();
    img.src = logo;
    doc.addImage(img, 'JPEG', 10, 10, 30, 30);
  
    doc.setFontSize(18);
    doc.text("Budget Report", 50, 20);
  
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 50, 30);
  
    const tableColumn = ["Month", "Income", "Categories", "Total", "Balance", "Status"];
    const tableRows = [];
  
    budgets.forEach(budget => {
      const categoriesText = budget.categories.map(cat => `${cat.name}: ${cat.amount}`).join(", ");
      const row = [
        budget.month,
        `Rs. ${budget.income}`,
        categoriesText || "No categories",
        `Rs. ${budget.total}`,
        `Rs. ${budget.balance}`,
        budget.status,
      ];
      tableRows.push(row);
    });
  
    autoTable(doc, {
      startY: 40,
      head: [tableColumn],
      body: tableRows,
    });
  
    doc.save("budget_report.pdf");
  };
  







  const updateBudget = async (id) => {
    try {
      // Send updated budget with recalculated total, balance, and status to the database
      await axios.put(`http://localhost:5001/BudgetController/updateBudget/${id}`, formData);
      setEditingId(null);
      fetchBudgets();
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  const deleteBudget = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/BudgetController/deleteBudget/${id}`);
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const handleCategoryChange = (index, field, value) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[index][field] = value;

    // Recalculate total and balance
    setFormData(prev => {
      const newFormData = { ...prev, categories: updatedCategories };

      // Recalculate total from categories
      const newTotal = updatedCategories.reduce((sum, category) => sum + (parseFloat(category.amount) || 0), 0);
      const balance = newFormData.income - newTotal;

      // Update total, balance and status
      newFormData.total = newTotal;
      newFormData.balance = balance;
      newFormData.status = balance >= 0 ? 'Within Budget' : 'Budget Exceeded';

      return newFormData;
    });
  };

  const handleIncomeChange = (e) => {
    const income = Number(e.target.value);

    // Recalculate total and balance when income changes
    setFormData(prev => {
      const newFormData = { ...prev, income: income };

      // Recalculate total from categories
      const newTotal = prev.categories.reduce((sum, category) => sum + (parseFloat(category.amount) || 0), 0);
      const balance = income - newTotal;

      // Update total, balance and status
      newFormData.total = newTotal;
      newFormData.balance = balance;
      newFormData.status = balance >= 0 ? 'Within Budget' : 'Budget Exceeded';

      return newFormData;
    });
  };

  const addNewCategory = () => {
    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, { name: '', amount: 0 }]
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-800 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-6xl transition-all duration-300">
        <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">Budget Management</h2>


        <div className="flex justify-end mb-6">
      <Link to='/Budget'><button 
       className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-all"
        >Add Budget</button>
      </Link> </div>

        <div className="flex justify-end mb-6">
          <button
          onClick={downloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-all"
          >
            Download PDF
          </button>
        </div>

        <table className="w-full border-collapse rounded-xl overflow-hidden shadow-lg table-auto">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="p-4">Month</th>
              <th className="p-4">Income</th>
              <th className="p-4">Categories</th>
              <th className="p-4">Total</th>
              <th className="p-4">Balance</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-blue-900">
            {budgets.map(budget => (
              <tr key={budget._id} className="hover:bg-blue-50 transition-all">
                {editingId === budget._id ? (
                  <>
                    <td className="p-4 border-t border-gray-300">
                      <input
                        type="text"
                        value={formData.month}
                        onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                        className="border rounded px-2 py-1 w-full bg-white text-blue-900"
                      />
                    </td>
                    <td className="p-4 border-t border-gray-300">
                      <input
                        type="number"
                        value={formData.income}
                        onChange={handleIncomeChange}
                        className="border rounded px-2 py-1 w-full bg-white text-blue-900"
                      />
                    </td>
                    <td className="p-4 border-t border-gray-300">
                      <div className="space-y-1">
                        {formData.categories.length > 0 ? (
                          formData.categories.map((cat, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={cat.name}
                                onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                                placeholder="Name"
                                className="border rounded px-2 py-1 text-sm w-28 bg-white text-blue-900"
                              />

                              <input
                                type="number"
                                value={cat.amount}
                                onChange={(e) => handleCategoryChange(index, 'amount', e.target.value)}
                                placeholder="Amount"
                                className="border rounded px-2 py-1 text-sm w-24 bg-white text-blue-900"
                              />
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 text-sm">No categories</div>
                        )}
                        <button
                          onClick={addNewCategory}
                          className="text-blue-600 text-xs mt-1 hover:underline"
                        >
                          + Add Category
                        </button>
                      </div>
                    </td>
                    <td className="p-4 border-t border-gray-300">{formData.total}</td>
                    <td className="p-4 border-t border-gray-300">{formData.balance}</td>
                    <td className="p-4 border-t border-gray-300">{formData.status}</td>
                    <td className="p-4 border-t border-gray-300 flex flex-col gap-2">
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                        onClick={() => updateBudget(budget._id)}
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-400 text-white px-3 py-1 rounded"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 border-t border-gray-300">{budget.month}</td>
                    <td className="p-4 border-t border-gray-300">Rs. {budget.income}</td>
                    <td className="p-4 border-t border-gray-300">
                      {budget.categories.length > 0 ? (
                        budget.categories.map((cat, idx) => (
                          <div key={idx} className="text-sm">{cat.name}: {cat.amount}</div>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No categories</span>
                      )}
                    </td>
                    <td className="p-4 border-t border-gray-300">Rs. {budget.total}</td>
                    <td className="p-4 border-t border-gray-300">Rs. {budget.balance}</td>
                    <td className="p-4 border-t border-gray-300">{budget.status}</td>
                    <td className="p-4 border-t border-gray-300 flex flex-col gap-2">
                      <button
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                        onClick={() => {
                          setEditingId(budget._id);
                          setFormData({
                            month: budget.month,
                            income: budget.income,
                            categories: budget.categories || [],
                            total: budget.total,
                            balance: budget.balance,
                            status: budget.status
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        onClick={() => deleteBudget(budget._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BudgetData;
