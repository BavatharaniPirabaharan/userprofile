import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function EditBankStatement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bankName, setBankName] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5001/BankStatementsController/get/${id}`)
      .then(res => {
        if (res.data.success) {
          const stmt = res.data.data;
          setBankName(stmt.bankName);
          setSelectedMonth(stmt.selectedMonth);
        } else {
          alert('Failed to fetch statement details.');
        }
      })
      .catch(err => console.error('Fetch error:', err));
  }, [id]);

  const handleUpdate = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:5001/BankStatementsController/update/${id}`, {
        bankName,
      selectedMonth,
    })
      .then(res => {
        if (res.data.success) {
          alert('Statement updated successfully!');
          navigate('/BankStatementsList');
        } else {
          alert('Failed to update.');
        }
      })
      .catch(err => console.error('Update error:', err));
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white shadow rounded mt-10">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Edit Bank Statement</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-blue-900 mb-1">Bank Name:</label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-blue-900 mb-1">Statement Month:</label>
          <input
            type="text"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded shadow transition-all"
        >
          Update Statement
        </button>
      </form>
    </div>
  );
}

export default EditBankStatement;
