import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditInvoices = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    vendorName: '',
    issueDate: '',
    dueDate: '',
    status: 'Pending',
    amount: '',
    taxAmount: '',
    totalAmount: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/InvoiceController/getIn/${id}`);
        const invoice = response.data;
        
        // Format dates for the date input fields
        const issueDate = new Date(invoice.issueDate).toISOString().split('T')[0];
        const dueDate = new Date(invoice.dueDate).toISOString().split('T')[0];
        
        setFormData({
          invoiceNumber: invoice.invoiceNumber,
          vendorName: invoice.vendorName,
          issueDate,
          dueDate,
          status: invoice.status,
          amount: invoice.amount.toString(),
          taxAmount: invoice.taxAmount.toString(),
          totalAmount: invoice.totalAmount.toString()
        });
      } catch (error) {
        console.error('Error fetching invoice:', error);
        navigate('/invoices');
      }
    };

    fetchInvoice();
  }, [id, navigate]);

  useEffect(() => {
    if (formData.amount && formData.taxAmount) {
      const amount = parseFloat(formData.amount) || 0;
      const tax = parseFloat(formData.taxAmount) || 0;
      const total = amount + tax;
      setFormData(prev => ({
        ...prev,
        totalAmount: total.toFixed(2)
      }));
    }
  }, [formData.amount, formData.taxAmount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.invoiceNumber) {
      newErrors.invoiceNumber = 'Required';
    } else if (!/^INV-\d{3}$/.test(formData.invoiceNumber)) {
      newErrors.invoiceNumber = 'Must be in format INV-001 (3 digits)';
    }
    if (!formData.vendorName) newErrors.vendorName = 'Required';
    if (!formData.issueDate) newErrors.issueDate = 'Required';
    if (!formData.dueDate) newErrors.dueDate = 'Required';
    if (!formData.amount) newErrors.amount = 'Required';
    if (isNaN(formData.amount)) newErrors.amount = 'Must be number';
    if (!formData.taxAmount) newErrors.taxAmount = 'Required';
    if (isNaN(formData.taxAmount)) newErrors.taxAmount = 'Must be number';
  
    // New validation for issue date not being in the future
    if (formData.issueDate) {
      const issueDate = new Date(formData.issueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only
      
      if (issueDate > today) {
        newErrors.issueDate = 'Issue date cannot be in the future';
      }
    }
  
    // Additional validation: due date should not be before issue date
    if (formData.issueDate && formData.dueDate) {
      const issueDate = new Date(formData.issueDate);
      const dueDate = new Date(formData.dueDate);
      
      if (dueDate < issueDate) {
        newErrors.dueDate = 'Due date cannot be before issue date';
      }
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        vendorName: formData.vendorName,
        invoiceNumber: formData.invoiceNumber,
        issueDate: new Date(formData.issueDate).toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
        status: formData.status,
        amount: parseFloat(formData.amount),
        taxAmount: parseFloat(formData.taxAmount),
        totalAmount: parseFloat(formData.totalAmount || 0)
      };

      await axios.put(`http://localhost:5001/InvoiceController/updateinvoice/${id}`, payload);

      alert("Invoice updated successfully!");
      navigate('/Invoices');
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = "Error updating invoice";
      
      if (error.response) {
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 400) {
          errorMessage = "Validation error - please check your inputs";
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-6 text-center text-gray-800">Edit Invoice</h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Invoice Number *</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  readOnly
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  placeholder="INV-001"
                  className={`w-full text-black p-2 bg-white border rounded-md ${
                    errors.invoiceNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.invoiceNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.invoiceNumber}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Vendor Name *</label>
                <input
                  type="text"
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleChange}
                  placeholder="Vendor Name"
                  className={`w-full text-black p-2 bg-white border rounded-md ${
                    errors.vendorName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.vendorName && (
                  <p className="text-red-500 text-xs mt-1">{errors.vendorName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Issue Date *</label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                className={`w-full text-black p-2 bg-white border rounded-md ${
                  errors.issueDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.issueDate && (
                <p className="text-red-500 text-xs mt-1">{errors.issueDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Due Date *</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={`w-full text-black p-2 bg-white border rounded-md ${
                  errors.dueDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dueDate && (
                <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full text-black p-2 bg-white border border-gray-300 rounded-md"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Amount *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={`w-full text-black p-2 bg-white border rounded-md ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Tax Amount *</label>
                <input
                  type="number"
                  name="taxAmount"
                  value={formData.taxAmount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={`w-full text-black p-2 bg-white border rounded-md ${
                    errors.taxAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.taxAmount && (
                  <p className="text-red-500 text-xs mt-1">{errors.taxAmount}</p>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Total Amount</label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                readOnly
                className="w-full p-2 bg-white border text-black border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => navigate('/invoices')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Updating...' : 'Update Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInvoices;