import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EmployeeList from "./EmployeeList";

const POSITIONS = ['Manager', 'Developer', 'Designer', 'Accountant', 'Clerk'];

const SalaryForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    baseSalary: "",
    overtimeHours: 0,
    salaryMonth: "",
    jobStartYear: new Date().getFullYear(),
  });

  const [positionSettings, setPositionSettings] = useState({});
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", variant: "bg-green-500" });
  const navigate = useNavigate();

  useEffect(() => {
    // Load position settings from localStorage
    const savedSettings = localStorage.getItem('positionSettings');
    if (savedSettings) {
      setPositionSettings(JSON.parse(savedSettings));
    }
  }, []);

  const calculateExperience = (startYear) => {
    const currentYear = new Date().getFullYear();
    const validStartYear = parseInt(startYear) || currentYear;
    return currentYear - validStartYear;
  };

  const generateEmployeeId = () => {
    const lastEmployee = employees[employees.length - 1];
    if (!lastEmployee) return "EMP001";

    const lastIdNumber = parseInt(lastEmployee.id.replace("EMP", ""));
    const nextIdNumber = lastIdNumber + 1;
    return `EMP${nextIdNumber.toString().padStart(3, "0")}`;
  };

  const handleToast = (message, variant = "bg-green-500") => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast({ show: false, message: "", variant: "" }), 3000);
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/employees");
        setEmployees(response.data);
      } catch (error) {
        handleToast("Failed to fetch employee data", "bg-red-500");
      }
    };
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "position") {
      // Update base salary based on position
      const settings = positionSettings[value] || {};
      setFormData(prev => ({
        ...prev,
        position: value,
        baseSalary: settings.baseSalary || 0,
      }));
      return;
    }

    let updatedValue = value;
    if (["baseSalary", "overtimeHours"].includes(name)) {
      updatedValue = parseFloat(value) || 0;
    } else if (name === "jobStartYear") {
      updatedValue = parseInt(value) || new Date().getFullYear();
    }

    setFormData(prev => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const employeeData = {
        ...formData,
        id: generateEmployeeId(),
        experience: calculateExperience(formData.jobStartYear),
        position: formData.position
      };

      console.log('Submitting employee data:', employeeData);

      const response = await axios.post("http://localhost:5001/api/add-employee", employeeData);
      console.log('Server response:', response.data);
      
      if (response.data.employee) {
        setEmployees([...employees, response.data.employee]);
        handleToast("Employee added successfully!");
      } else {
        throw new Error('Invalid response format from server');
      }

      setFormData({
        name: "",
        position: "",
        baseSalary: "",
        overtimeHours: 0,
        salaryMonth: "",
        jobStartYear: new Date().getFullYear(),
      });
      navigate('/HomeSalary');
    } catch (error) {
      console.error('Error adding employee:', error);
      handleToast("Failed to add employee", "bg-red-500");
    } finally {
      setLoading(false);
    }
  };

  const totalSalary = parseFloat(formData.baseSalary || 0) + 
    (parseFloat(formData.overtimeHours || 0) * 
    (positionSettings[formData.position]?.overtimeRate || 500));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Add New Employee</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Position</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Position</option>
                {POSITIONS.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 mb-2">Job Start Year</label>
              <input
                type="number"
                name="jobStartYear"
                min="2000"
                max={new Date().getFullYear()}
                value={formData.jobStartYear}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Experience: {calculateExperience(formData.jobStartYear)} years
              </p>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Salary Month</label>
              <input
                type="month"
                name="salaryMonth"
                value={formData.salaryMonth}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 mb-2" >Base Salary</label>
              <input 
                readOnly
                type="number"
                name="baseSalary"
                min="0"
                value={formData.baseSalary}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Overtime Hours</label>
              <input
                type="number"
                name="overtimeHours"
                min="0"
                value={formData.overtimeHours}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <p className="font-semibold ">
              Net Salary (Preview): Rs. {totalSalary.toLocaleString()}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.position}
            className={`px-6 py-2 rounded-lg text-white ${loading || !formData.position ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
          >
            {loading ? "Adding..." : "Add Employee"}
          </button>
        </form>
      </div>

      <EmployeeList employees={employees} />

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 ${toast.variant} text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default SalaryForm;
