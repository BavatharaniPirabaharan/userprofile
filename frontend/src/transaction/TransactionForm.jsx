import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const TransactionForm = ({ transaction = null, onClose = () => {}, onSuccess = () => {} }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    accountType: "cash",
    category: "",
    amount: "",
    description: "",
  });
  const navigate = useNavigate();


  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        name: transaction.name || "",
        type: transaction.type || "expense",
        accountType: transaction.account || "cash",
        category: transaction.category || "",
        amount: transaction.amount ? transaction.amount.toString() : "",
        description: transaction.description || "",
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        userId: "6632f0d91c75fc6f4bd55e9b",
        name: formData.name,
        type: formData.type,
        account: formData.accountType,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
      };

      let response;
      if (transaction && transaction._id) {
        response = await axios.put(`http://localhost:5001/TransactionController/updateTransaction/${transaction._id}`, payload);
        toast.success("Transaction updated successfully");
        navigate('/Transactions'); 
      } else {
        response = await axios.post(`http://localhost:5001/TransactionController/createTransaction`, payload);
        toast.success("Transaction added successfully");
        navigate('/Transactions'); 
      }

      setLoading(false);
      onSuccess(response.data);
      onClose();
    } catch (error) {
      setLoading(false);
      toast.error(error.response && error.response.data && error.response.data.message ? error.response.data.message : "Something went wrong");
      console.error("Error saving transaction:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h3 className="text-xl font-semibold text-black">
            {transaction ? "Edit Transaction" : "Add New Transaction"}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-light"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Transaction Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Office Supplies"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Transaction Type
                </label>
                <select
                  name="type"
                  className="w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Account Type
                </label>
                <select
                  name="accountType"
                  className="w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.accountType}
                  onChange={handleChange}
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Account</option>
                  <option value="petty">Petty Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Category
                </label>
                <select
                  name="category"
                  className="w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Services">Services</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Salary">Salary</option>
                  <option value="Rent">Rent</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Amount*
                </label>
                <input
                  type="number"
                  name="amount"
                  className="w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Description
              </label>
              <textarea
                name="description"
                className="w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Add details about this transaction"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {transaction ? "Updating..." : "Saving..."}
                </span>
              ) : transaction ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
