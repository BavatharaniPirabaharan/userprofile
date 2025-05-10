import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const BankStatements = () => {
  const [statements, setStatements] = useState([]);
  const [editingStatement, setEditingStatement] = useState(null);
  const { register, handleSubmit, reset, setValue, getValues, formState: { errors } } = useForm();

  const API_BASE = 'http://localhost:5001/BankStatementsController';
  const userId = '6632f0d91c75fc6f4bd55e9b'; // Replace with actual authenticated user ID

  const validationRules = {
    bankName: { required: 'Bank name is required' },
    description: {},
    startDate: { required: 'Start date is required' },
    endDate: {
      required: 'End date is required',
      validate: (endDate) => {
        const startDate = new Date(getValues('startDate'));
        return new Date(endDate) >= startDate || 'End date must be after start date';
      }
    },
    statementFile: { required: editingStatement ? false : 'PDF file is required' },
  };

  

  const fetchStatements = async () => {
    try {
      const res = await axios.get(`${API_BASE}/get/user/${userId}`);
      setStatements(res.data.statements);
    } catch (err) {
      console.error('Error fetching statements:', err);
    }
  };

  useEffect(() => {
    fetchStatements();
  }, []);



  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('bankName', data.bankName);
    formData.append('description', data.description || '');
    formData.append('startDate', data.startDate);
    formData.append('endDate', data.endDate);
    if (data.statementFile?.[0]) {
      formData.append('Img', data.statementFile[0]);
    }

    try {
      if (editingStatement) {
        await axios.put(`${API_BASE}/updatebank/${editingStatement._id}`, formData);
        alert('Statement updated successfully!');
        setEditingStatement(null);
      } else {
        await axios.post(`${API_BASE}/addstatements`, formData);
        alert('Statement uploaded successfully!');
      }
      reset();
      fetchStatements();
    } catch (err) {
      console.error('Submit failed:', err);
      alert('Submit failed. Please try again.');
    }
  };

  const deleteStatement = async (id) => {
    if (window.confirm('Are you sure you want to delete this statement?')) {
      try {
        await axios.delete(`${API_BASE}/deletebank/${id}`);
        fetchStatements();
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Delete failed.');
      }
    }
  };

  const editStatement = (statement) => {
    setEditingStatement(statement);
    setValue('bankName', statement.bankName);
    setValue('description', statement.description);
    setValue('startDate', new Date(statement.startDate).toISOString().split('T')[0]);
    setValue('endDate', new Date(statement.endDate).toISOString().split('T')[0]);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto p-4">
        <center><h1 className="text-2xl font-bold mb-6 text-black">Bank Statements Upload</h1></center>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200 max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-black">
            {editingStatement ? 'Edit Bank Statement' : 'Upload Bank Statement'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

              <div>
                <label className="block text-sm font-medium mb-2 text-black">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("bankName", validationRules.bankName)}
                  className="w-full p-2 border border-gray-300 rounded text-black bg-white"
                />
                {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-black">Description</label>
                <input
                  type="text"
                  {...register("description")}
                  className="w-full p-2 border border-gray-300 rounded text-black bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-black">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("startDate", validationRules.startDate)}
                  className="w-full p-2 border border-gray-300 rounded text-black bg-white"
                />
                {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-black">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("endDate", validationRules.endDate)}
                  className="w-full p-2 border border-gray-300 rounded text-black bg-white"
                />
                {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-black">
                  Statement File {editingStatement ? '(Already uploaded)' : '(PDF only) *'}
                </label>
                {editingStatement ? (
                  <div className="p-2 bg-gray-100 rounded text-sm text-black">
                    Current file: {editingStatement.fileName}
                    <br />
                    <a
                      href={`http://localhost:5001/uploads/${editingStatement.fileName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View File
                    </a>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      accept=".pdf"
                      {...register("statementFile", validationRules.statementFile)}
                      className="w-full p-2 border border-gray-300 rounded text-black bg-white"
                    />
                    {errors.statementFile && <p className="text-red-500 text-xs mt-1">{errors.statementFile.message}</p>}
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              {editingStatement && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingStatement(null);
                    reset();
                  }}
                  className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingStatement ? 'Update Statement' : 'Upload Statement'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-black mb-4">Your Uploaded Statements</h2>
          {statements.length === 0 ? (
            <p className="text-gray-500">No statements uploaded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statements.map(statement => (
                    <tr key={statement._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{statement.bankName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {new Date(statement.startDate).toLocaleDateString()} - {new Date(statement.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{statement.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        <a
                          href={`http://localhost:5001/uploads/${statement.fileName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          View PDF
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => editStatement(statement)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteStatement(statement._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankStatements;