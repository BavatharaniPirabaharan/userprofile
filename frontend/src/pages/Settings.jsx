// export default Settings;
import React, { useState, useEffect } from 'react';
import { FaBriefcase, FaCode, FaPaintBrush, FaCalculator, FaUserAlt, FaQuestionCircle } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const POSITIONS = [
  { title: 'Manager', icon: <FaBriefcase className="inline mr-2" /> },
  { title: 'Developer', icon: <FaCode className="inline mr-2" /> },
  { title: 'Designer', icon: <FaPaintBrush className="inline mr-2" /> },
  { title: 'Accountant', icon: <FaCalculator className="inline mr-2" /> },
  { title: 'Clerk', icon: <FaUserAlt className="inline mr-2" /> }
];

const Settings = () => {
  const [selectedPosition, setSelectedPosition] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [settings, setSettings] = useState({
    baseSalary: 0,
    epfPercentage: 8,
    etfPercentage: 3,
    transportAllowance: 2500,
    overtimeRate: 500
  });
   const navigate = useNavigate();

  const [positionSettings, setPositionSettings] = useState(() => {
    const savedSettings = localStorage.getItem('positionSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      Manager: { baseSalary: 120000, epfPercentage: 8, etfPercentage: 3, transportAllowance: 5000, overtimeRate: 1000 },
      Developer: { baseSalary: 90000, epfPercentage: 8, etfPercentage: 3, transportAllowance: 4000, overtimeRate: 800 },
      Designer: { baseSalary: 80000, epfPercentage: 8, etfPercentage: 3, transportAllowance: 3500, overtimeRate: 700 },
      Accountant: { baseSalary: 75000, epfPercentage: 8, etfPercentage: 3, transportAllowance: 3000, overtimeRate: 600 },
      Clerk: { baseSalary: 60000, epfPercentage: 8, etfPercentage: 3, transportAllowance: 2500, overtimeRate: 500 }
    };
  });

  useEffect(() => {
    if (selectedPosition) {
      setSettings(positionSettings[selectedPosition]);
    }
  }, [selectedPosition]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPosition) {
      alert('Please select a position first');
      return;
    }

    const updatedSettings = {
      ...positionSettings,
      [selectedPosition]: settings
    };

    setPositionSettings(updatedSettings);
    localStorage.setItem('positionSettings', JSON.stringify(updatedSettings));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
    navigate('/HomeSalary')
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-gray-50 p-6 rounded-xl shadow-lg">
        <h3 className="text-center text-2xl font-bold mb-3 text-blue-600 font-sans">
          Position-Based Salary Settings
        </h3>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Select a job position to customize salary details including base salary, EPF/ETF rates, allowances, and overtime rate. 
          These values will be auto-applied when adding a new employee.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Select Position</label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              required
              autoFocus
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-700"
            >
              <option value="">Choose a position</option>
              {POSITIONS.map(pos => (
                <option key={pos.title} value={pos.title}>
                  {pos.icon} {pos.title}
                </option>
              ))}
            </select>
          </div>

          {selectedPosition && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Base Salary (Rs.)</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="baseSalary"
                      value={settings.baseSalary}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-500"
                    />
                    <div className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-help" title="Base salary for the selected position">
                      <FaQuestionCircle />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Transport Allowance (Rs.)</label>
                  <input
                    type="number"
                    name="transportAllowance"
                    value={settings.transportAllowance}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">EPF Percentage (%)</label>
                  <input
                    type="number"
                    name="epfPercentage"
                    value={settings.epfPercentage}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">ETF Percentage (%)</label>
                  <input
                    type="number"
                    name="etfPercentage"
                    value={settings.etfPercentage}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Overtime Rate (Rs./hour)</label>
                <input
                  type="number"
                  name="overtimeRate"
                  value={settings.overtimeRate}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-500"
                />
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                >
                  Save Settings for {selectedPosition}
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          Settings saved successfully!
        </div>
      )}
    </div>
  );
};

export default Settings;