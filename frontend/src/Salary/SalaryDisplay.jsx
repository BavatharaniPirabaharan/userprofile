// export default SalaryDisplay;
import { useEffect, useState } from "react";

const SalaryDisplay = ({ employee }) => {
  const { baseSalary, overtimeHours, salaryMonth, experience, position, name, id } = employee;
  const [settings, setSettings] = useState({
    epfPercentage: 8,
    etfPercentage: 3,
    transportAllowance: 2500,
    overtimeRate: 500
  });

  useEffect(() => {
    // Load position-based settings from localStorage
    const savedSettings = localStorage.getItem('positionSettings');
    console.log('Employee data:', employee); // Debug log
    console.log('Position from employee:', position); // Debug log
    
    if (savedSettings) {
      const positionSettings = JSON.parse(savedSettings);
      console.log('Position settings from localStorage:', positionSettings); // Debug log
      
      if (position && positionSettings[position]) {
        console.log('Applying settings for position:', position, positionSettings[position]);
        setSettings(positionSettings[position]);
      } else {
        console.log('No specific settings found for position:', position);
        // Reset to default settings if no position-specific settings found
        setSettings({
          epfPercentage: 8,
          etfPercentage: 3,
          transportAllowance: 2500,
          overtimeRate: 500
        });
      }
    }
  }, [position, employee]);

  // Add console.log to debug calculations
  console.log('Calculations:', {
    baseSalary,
    position,
    epfPercentage: settings.epfPercentage,
    etfPercentage: settings.etfPercentage,
    epf: baseSalary * (settings.epfPercentage / 100),
    etf: baseSalary * (settings.etfPercentage / 100)
  });

  const epf = baseSalary * (settings.epfPercentage / 100);
  const etf = baseSalary * (settings.etfPercentage / 100);
  const overtimePay = overtimeHours * settings.overtimeRate;
  const grossSalary = baseSalary + overtimePay + settings.transportAllowance;
  const netSalary = grossSalary - (epf + etf);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">
        <span className="font-bold">{name}</span> (ID: {id})
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="mb-2">
            <span className="font-semibold">Position:</span> {position || 'Not specified'}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Salary Month:</span> {salaryMonth}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Experience:</span> {experience} years
          </p>
        </div>
        
        <div>
          <p className="mb-2">
            <span className="font-semibold">Base Salary:</span> Rs. {baseSalary.toLocaleString()}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Overtime Pay:</span> Rs. {overtimePay.toLocaleString()}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Transport Allowance:</span> Rs. {settings.transportAllowance.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="mb-2">
          <span className="font-semibold">EPF ({settings.epfPercentage}%):</span> Rs. {epf.toLocaleString()}
        </p>
        <p className="mb-2">
          <span className="font-semibold">ETF ({settings.etfPercentage}%):</span> Rs. {etf.toLocaleString()}
        </p>
        <h5 className="text-lg font-bold mt-4">
          <span className="font-semibold">Net Salary:</span> Rs. {netSalary.toLocaleString()}
        </h5>
      </div>
    </div>
  );
};

export default SalaryDisplay;