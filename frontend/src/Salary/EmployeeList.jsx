// export default EmployeeList;
import React from "react";

const EmployeeList = ({ employees }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Employee List</h2>
      {employees.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {employees.map((employee) => (
            <li 
              key={employee.id} 
              className="py-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">
                  {employee.name} <span className="text-gray-600">(ID: {employee.id})</span>
                </p>
                <p className="text-sm text-gray-500">
                  Experience: {employee.experience} years (since {employee.jobStartYear})
                </p>
              </div>
              <div className="text-right">
                <p>{employee.salaryMonth}</p>
                <p className="text-sm text-gray-500">
                  Base: {formatCurrency(employee.baseSalary)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No employees found</p>
      )}
    </div>
  );
};

export default EmployeeList;