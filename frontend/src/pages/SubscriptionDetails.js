// export default SubscriptionDetails; 

import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const SubscriptionDetails = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);

  useEffect(() => {
    setSubscriptions([
      { id: 1, name: 'Basic Plan', pdfUrl: '/path/to/pdf1.pdf', uploadDate: '2024-04-29' },
      { id: 2, name: 'Premium Plan', pdfUrl: '/path/to/pdf2.pdf', uploadDate: '2024-04-28' },
    ]);
  }, []);

  const handleFileUpload = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleOpen = (subscription = null) => {
    setCurrentSubscription(subscription);
    setEditMode(!!subscription);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFile(null);
    setCurrentSubscription(null);
    setEditMode(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Implement file upload and update logic here
    handleClose();
  };

  const handleDelete = async (id) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 mb-10 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Subscription Details</h1>
        <button
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => handleOpen()}
        >
          <FaPlus className="mr-2" />
          Add New Subscription
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-6 py-3 text-left font-medium text-gray-600">PDF Document</th>
              <th className="px-6 py-3 text-left font-medium text-gray-600">Upload Date</th>
              <th className="px-6 py-3 text-left font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscriptions.map((subscription) => (
              <tr key={subscription.id}>
                <td className="px-6 py-4">{subscription.name}</td>
                <td className="px-6 py-4">
                  <a
                    href={subscription.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View PDF
                  </a>
                </td>
                <td className="px-6 py-4">{subscription.uploadDate}</td>
                <td className="px-6 py-4 flex space-x-2">
                  <button
                    onClick={() => handleOpen(subscription)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(subscription.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 relative shadow-xl">
            <h2 className="text-xl font-semibold mb-4">
              {editMode ? 'Edit Subscription' : 'Add New Subscription'}
            </h2>
            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-medium mb-1">Subscription Name</label>
              <input
                type="text"
                defaultValue={currentSubscription?.name}
                className="w-full border rounded px-3 py-2 mb-4"
                required
              />
              <label className="block text-sm font-medium mb-1">Upload PDF</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="w-full border rounded px-3 py-2 mb-2"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mb-4">
                  Selected file: {selectedFile.name}
                </p>
              )}
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  {editMode ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDetails;
