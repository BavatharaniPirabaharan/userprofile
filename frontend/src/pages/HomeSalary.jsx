// export default Home;
import React, { useState, useEffect } from "react";
import SalaryDisplay from "../Salary/SalaryDisplay";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSearch, FaEdit, FaTrashAlt, FaDownload, FaUserAlt } from "react-icons/fa";
import { MdWork } from "react-icons/md";
import { Navigate } from "react-router-dom";
import { Link } from 'react-router-dom';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const HomeSalary = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [editEmployee, setEditEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/employees");
      setEmployees(response.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError("Failed to load employee data");
      toast.error("Failed to load employee data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    
    try {
      await axios.delete(`http://localhost:5001/api/employees/${employeeToDelete.id}`);
      setEmployees(prev => prev.filter(employee => employee.id !== employeeToDelete.id));
      toast.success("Employee deleted successfully");
    } catch (err) {
      console.error("Error deleting employee:", err);
      toast.error("Failed to delete employee");
    } finally {
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditEmployee({ ...employee });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editEmployee.name.trim() || editEmployee.baseSalary <= 0 || editEmployee.overtimeHours < 0) {
      toast.error("Please fill out valid employee details");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5001/api/employees/${editEmployee.id}`,
        editEmployee
      );
      setEmployees(prev => 
        prev.map(emp => (emp.id === editEmployee.id ? response.data.employee : emp))
      );
      toast.success("Employee updated successfully");
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating employee:", err);
      toast.error("Failed to update employee");
    }
  };

  const downloadCSV = () => {
    const headers = ["ID", "Name", "Base Salary", "Overtime Hours", "Salary Month", "Net Salary"];
    const rows = filteredEmployees.map(employee => {
      const { id, name, baseSalary, overtimeHours, salaryMonth } = employee;
      const overtimePay = overtimeHours * 500;
      const transportAllowance = 2500;
      const grossSalary = baseSalary + overtimePay + transportAllowance;
      const epf = baseSalary * 0.08;
      const etf = baseSalary * 0.03;
      const netSalary = grossSalary - (epf + etf);
      
      return [id, name, baseSalary, overtimeHours, salaryMonth, netSalary];
    });
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `employees_${filterMonth || 'all'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEmployees = employees.filter(employee => {
    const { name, id, salaryMonth } = employee;
    const searchTermLower = searchTerm.toLowerCase();
    
    // Convert "YYYY-MM" format to month name for filtering
    const [year, month] = salaryMonth.split('-');
    const monthIndex = parseInt(month) - 1;
    const monthName = months[monthIndex];
    
    const matchesSearch = 
      name.toLowerCase().includes(searchTermLower) ||
      id.toLowerCase().includes(searchTermLower);
    
    const matchesMonth = 
      !filterMonth || 
      monthName.toLowerCase() === filterMonth.toLowerCase();
    
    const matchesYear = 
      !filterYear || 
      year === filterYear;
    
    return matchesSearch && matchesMonth && matchesYear;
  });

  // Calculate summary statistics
  const totalSalary = filteredEmployees.reduce(
    (acc, emp) => acc + emp.baseSalary + (emp.overtimeHours * 500) + 2500, 
    0
  );
  
  const totalEPF = filteredEmployees.reduce(
    (acc, emp) => acc + (emp.baseSalary * 0.08), 
    0
  );
  
  const totalOvertimePay = filteredEmployees.reduce(
    (acc, emp) => acc + (emp.overtimeHours * 500),
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-center text-3xl font-bold mb-8 text-blue-600">
        <FaUserAlt className="inline mr-2" /> Employee Salary Management
      </h1>
      
      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Name or ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pl-10"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <div className="md:col-span-2">
            <select
              value={filterYear} 
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-blue-500"
            >
              <option value="">All Years</option>
              {Array.from(new Set(employees.map(emp => emp.salaryMonth.split('-')[0]))).sort().reverse().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-4">
            <select
              value={filterMonth} 
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-blue-500"
            >
              <option value="">All Months</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <button
              onClick={downloadCSV}
              className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <FaDownload /> Export CSV
            </button>
          </div>
          <div className="md:col-span-2">
            <button
              className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            ><Link to={`/SalaryForm`}>
              + Add Employee</Link>
            </button>
          </div>
          <div className="md:col-span-2">
            <button
              className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            ><Link to={`/Settings`}>
              Salary Settings</Link>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center h-full">
          <h3 className="font-semibold mb-2"><MdWork className="inline mr-2" />Employees</h3>
          <p className="text-4xl font-bold">
            {filteredEmployees.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center h-full">
          <h3 className="font-semibold mb-2">Total Salary</h3>
          <p className="text-4xl font-bold">
            Rs. {totalSalary.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center h-full">
          <h3 className="font-semibold mb-2">Total EPF</h3>
          <p className="text-4xl font-bold">
            Rs. {totalEPF.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center h-full">
          <h3 className="font-semibold mb-2">Overtime Pay</h3>
          <p className="text-4xl font-bold">
            Rs. {totalOvertimePay.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Employee List */}
      {loading ? (
        <div className="text-center my-8">
          <div className="inline-block h-8 w-8 border-4 border-publuerple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading employee data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 text-center">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map(employee => (
            <div key={employee.id} className="space-y-4">
              <SalaryDisplay employee={employee} />
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => handleEditEmployee(employee)}
                  className="px-4 py-2 border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 flex items-center gap-2"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(employee)}
                  className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
                >
                  <FaTrashAlt /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <FaEdit /> Edit Employee
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              {editEmployee && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={editEmployee.name}
                      onChange={(e) => 
                        setEditEmployee({ ...editEmployee, name: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Base Salary</label>
                    <input
                      type="number"
                      value={editEmployee.baseSalary}
                      onChange={(e) =>
                        setEditEmployee({ ...editEmployee, baseSalary: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Overtime Hours</label>
                    <input
                      type="number"
                      value={editEmployee.overtimeHours}
                      onChange={(e) =>
                        setEditEmployee({ ...editEmployee, overtimeHours: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-4 border-t">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {employeeToDelete?.name} (ID: {employeeToDelete?.id})?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setEmployeeToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default HomeSalary;