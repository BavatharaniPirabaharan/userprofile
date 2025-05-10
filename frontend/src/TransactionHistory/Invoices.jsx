import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaDownload, FaSearch } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../logo.jpg';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get('http://localhost:5001/InvoiceController/getIn');
        setInvoices(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`http://localhost:5001/InvoiceController/deleteIn/${id}`);
        setInvoices(invoices.filter(invoice => invoice._id !== id));
        alert('Invoice deleted successfully');
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Failed to delete invoice');
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/EditInvoices/${id}`);
  };

  const handleDownload = (invoice) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
  
      const img = new Image();
      img.src = logo; // Make sure 'logo' is defined and accessible
      doc.addImage(img, 'JPEG', pageWidth / 2 - 15, 10, 30, 30); // Centered logo
  
      doc.setProperties({
        title: `Invoice ${invoice.invoiceNumber}`,
        subject: 'Invoice',
        author: 'TeaCups',
      });
  
      // Title
      doc.setFontSize(16);
      doc.setTextColor('#007BFF'); // Blue
      doc.setFont(undefined, 'bold');
    
  
      doc.setFontSize(20);
      doc.text(`${invoice.invoiceNumber}`, pageWidth / 2, 55, { align: 'center' });
  
      // From and To
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      let y = 70;
  
      doc.setFont(undefined, 'normal');
      doc.text('From:', 20, y);
      doc.setFont(undefined, 'bold');
      doc.text('Axento', 20, y + 6);
      doc.setFont(undefined, 'normal');
      doc.text('Colombo', 20, y + 12);
  
      doc.setFont(undefined, 'normal');
      doc.text('Bill To:', pageWidth - 70, y);
      doc.setFont(undefined, 'bold');
      doc.text(invoice.vendorName, pageWidth - 70, y + 6);
      doc.setFont(undefined, 'normal');
  
      // Invoice Info
      y += 30;
      doc.text(`Invoice Date: ${formatDate(invoice.issueDate)}`, 20, y);
      doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 20, y + 6);
      doc.text(`Status: ${invoice.status}`, 20, y + 12);
  
      // Table
      autoTable(doc, {
        startY: y + 20,
        head: [['DESCRIPTION', 'AMOUNT (LKR)']],
        body: [
          ['Amount', formatCurrency(invoice.amount)],
          ['Tax', formatCurrency(invoice.taxAmount)],
          ['TOTAL', formatCurrency(invoice.totalAmount)]
        ],
        styles: {
          fontSize: 11,
          cellPadding: 5,
        },
        headStyles: {
          fillColor: [0, 123, 255], // Blue
          textColor: 255,           // White
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 'auto', halign: 'left' },
          1: { cellWidth: 50, halign: 'right' }
        },
        margin: { top: 10 }
      });
  
      doc.save(`invoice_${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };
  

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
  const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Invoice Management</h1>
            <button 
              onClick={() => navigate('/CreateInvoices')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow w-full md:w-auto"
            >
              Create New Invoice
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
              <div className="relative w-full md:w-64 mb-4 md:mb-0">
                <input
                  type="text"
                  placeholder="Search invoices..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-500" />
              </div>
              <div className="text-gray-600">
                Showing {currentInvoices.length} of {filteredInvoices.length} invoices
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="py-3 px-4 text-left font-semibold">Invoice #</th>
                    <th className="py-3 px-4 text-left font-semibold">Vendor</th>
                    <th className="py-3 px-4 text-left font-semibold">Issue Date</th>
                    <th className="py-3 px-4 text-left font-semibold">Due Date</th>
                    <th className="py-3 px-4 text-left font-semibold">Status</th>
                    <th className="py-3 px-4 text-right font-semibold">Amount</th>
                    <th className="py-3 px-4 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentInvoices.length > 0 ? (
                    currentInvoices.map((invoice) => (
                      <tr key={invoice._id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 text-gray-800">{invoice.invoiceNumber}</td>
                        <td className="py-4 px-4 text-gray-800">{invoice.vendorName}</td>
                        <td className="py-4 px-4 text-gray-800">{formatDate(invoice.issueDate)}</td>
                        <td className="py-4 px-4 text-gray-800">{formatDate(invoice.dueDate)}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            invoice.status === 'Paid' 
                              ? 'bg-green-100 text-green-800' 
                              : invoice.status === 'Overdue' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-gray-800 font-medium">
                          {formatCurrency(invoice.totalAmount)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center space-x-3">
                            <button
                              onClick={() => handleEdit(invoice._id)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                              title="Edit"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(invoice._id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <FaTrash size={16} />
                            </button>
                            <button
                              onClick={() => handleDownload(invoice)}
                              className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                              title="Download"
                            >
                              <FaDownload size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500">
                        No invoices found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-4 sm:space-y-0">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  Previous
                </button>
                <div className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices;