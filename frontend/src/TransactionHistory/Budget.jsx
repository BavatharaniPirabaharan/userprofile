import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Budget = ({ userId, onBudgetCreated = () => {} }) => {
  const [month, setMonth] = useState('January');
  const [income, setIncome] = useState('');
  const [categories, setCategories] = useState([
    { id: 1, name: '', amount: '' },
    { id: 2, name: '', amount: '' },
    { id: 3, name: '', amount: '' },
    { id: 4, name: '', amount: '' },
    { id: 5, name: '', amount: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const calculateTotal = () =>
    categories.reduce((sum, category) => sum + (parseFloat(category.amount) || 0), 0);

  const handleCategoryChange = (index, field, value) => {
    const updated = [...categories];
    updated[index][field] = value;
    setCategories(updated);
  };

  const handleAddCategory = () => {
    const newCategory = {
      id: categories.length + 1,
      name: '',
      amount: ''
    };
    setCategories([...categories, newCategory]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!month || !income) return toast.error('Month and Income are required');
    const incomeValue = parseFloat(income);
    if (isNaN(incomeValue) || incomeValue <= 0) return toast.error('Enter valid income');

    const validCategories = categories.filter(c =>
      c.name.trim() !== '' && !isNaN(parseFloat(c.amount)) && parseFloat(c.amount) >= 0
    );

    if (!validCategories.length) return toast.error('Add at least one category');

    const total = calculateTotal();
    if (total > incomeValue) return toast.error('Budget exceeds income');

    const budgetData = {
      userId: userId || 'default-user-id',
      month,
      income: incomeValue,
      categories: validCategories.map(c => ({ name: c.name.trim(), amount: parseFloat(c.amount) })),
      total,
      status: total <= incomeValue ? 'Within Budget' : 'Budget Exceeded'
    };

    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5001/BudgetController/createBudget', budgetData);
      if (data.success) {
        toast.success('Budget created!');
        navigate('/BudgetData');
        onBudgetCreated();
        setMonth('January');
        setIncome('');
        setCategories(categories.map(c => ({ ...c, name: '', amount: '' })));
      } else throw new Error();
    } catch (err) {
      toast.error('Failed to create budget.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white-900 to-blue-800 p-6">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl p-8 transition-all">
        <h2 className="text-3xl font-bold mb-6 text-blue-900 text-center">Create New Budget</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="month" className="block text-base mb-2 text-blue-900">Month:</label>
              <select
                id="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full p-3 text-base border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={new Date(0, i).toLocaleString('default', { month: 'long' })}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="income" className="block text-base mb-2 text-blue-900">Monthly Income (Rs.):</label>
              <input
                type="number"
                id="income"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="Enter income"
                required
                min="0"
                step="0.01"
                className="w-full p-3 text-base border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-base mb-2 text-blue-900">Categories:</label>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 rounded-lg shadow-sm">
                <thead>
                  <tr className="bg-blue-100 text-blue-900">
                    <th className="p-3 border border-gray-300">Category</th>
                    <th className="p-3 border border-gray-300">Amount (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c, i) => (
                    <tr key={c.id} className="hover:bg-blue-50 transition">
                      <td className="p-2 border border-gray-300">
                        <input
                          type="text"
                          value={c.name}
                          onChange={(e) => handleCategoryChange(i, 'name', e.target.value)}
                          placeholder={i === 0 ? "e.g. Rent" : "Add category"}
                          className="w-full p-2 text-sm border border-gray-300 rounded bg-white text-black focus:ring-2 focus:ring-blue-500"
                          required={i === 0}
                          disabled={loading}
                        />
                      </td>
                      <td className="p-2 border border-gray-300">
                        <input
                          type="number"
                          value={c.amount}
                          onChange={(e) => handleCategoryChange(i, 'amount', e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded bg-white text-black focus:ring-2 focus:ring-blue-500"
                          required={i === 0}
                          min="0"
                          step="0.01"
                          disabled={loading}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-right text-base font-semibold text-blue-900 mt-3">
              Total Budgeted: Rs. {calculateTotal().toFixed(2)}
            </div>
            {income && (
              <div
                className={`text-right font-medium mt-1 ${
                  calculateTotal() > parseFloat(income) ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {calculateTotal() > parseFloat(income)
                  ? '⚠️ Budget exceeds income!'
                  : '✅ Within your income.'}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddCategory}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:bg-blue-400"
            disabled={loading}
          >
            Add Category
          </button>

          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:bg-blue-400"
            disabled={loading}
          >
            {loading ? 'Creating Budget...' : 'Create Budget'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Budget;
