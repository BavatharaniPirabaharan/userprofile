import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaWallet, FaChartBar, FaCheck } from 'react-icons/fa';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const steps = [
    {
      id: 1,
      title: 'Welcome to Expense Manager',
      description: 'Let\'s get started with setting up your account.',
      icon: <FaUser className="text-4xl" />,
    },
    {
      id: 2,
      title: 'Create Your Account',
      description: 'Please fill in your details to create your account.',
      icon: <FaWallet className="text-4xl" />,
    },
    {
      id: 3,
      title: 'Ready to Start',
      description: 'Your account is ready! Let\'s begin managing your expenses.',
      icon: <FaChartBar className="text-4xl" />,
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle form submission
      navigate('/dashboard');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {steps[currentStep - 1].title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {steps[currentStep - 1].description}
          </p>
        </div>

        <div className="mt-8">
          <div className="flex justify-center mb-8">
            <div className="bg-blue-100 p-4 rounded-full text-blue-500">
              {steps[currentStep - 1].icon}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 2 && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center text-green-500">
                  <FaCheck className="mr-2" />
                  <span>Account created successfully</span>
                </div>
                <div className="flex items-center text-green-500">
                  <FaCheck className="mr-2" />
                  <span>Profile setup completed</span>
                </div>
                <div className="flex items-center text-green-500">
                  <FaCheck className="mr-2" />
                  <span>Ready to start managing expenses</span>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="btn btn-outline"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary ml-auto"
              >
                {currentStep === steps.length ? 'Get Started' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;