// export default Register;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { authAPI } from '../config/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    businessName: '',
    phoneNumber: '',
    nonCurrentAssets: '',
    liabilities: '',
    equity: '',
    nonCurrentAssetsDesc: '',
    liabilitiesDesc: '',
    equityDesc: '',
    currency: 'USD',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value;

    if (['nonCurrentAssets', 'liabilities', 'equity'].includes(name)) {
      formattedValue = value.replace(/\D/g, '');

      if (formattedValue === '') {
        formattedValue = '0';
      }

      if (formattedValue.length > 2) {
        formattedValue = `${formattedValue.slice(0, -2)}.${formattedValue.slice(-2)}`;
      } else if (formattedValue.length === 1) {
        formattedValue = `0.0${formattedValue}`;
      } else if (formattedValue.length === 2) {
        formattedValue = `0.${formattedValue}`;
      }

      formattedValue = formattedValue.replace(/^0+/, '');
    }

    setFormData({ ...formData, [name]: formattedValue });
    
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
    
    setError('');
  };

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validatePhoneNumber = (phoneNumber) => {
    const regex = /^[0-9]{10}$/; 
    return regex.test(phoneNumber);
  };

  const validateForm = () => {
    const errors = {};
    let hasErrors = false;

    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'businessName', 'phoneNumber'];
    for (const key of requiredFields) {
      if (!formData[key]) {
        errors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
        hasErrors = true;
      }
    }

    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
      hasErrors = true;
    }

    if (formData.password && !validatePassword(formData.password)) {
      errors.password = 'Password must be at least 6 characters long';
      hasErrors = true;
    }

    if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number (10 digits)';
      hasErrors = true;
    }

    setFieldErrors(errors);
    return !hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register(formData);
      
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));

      navigate('/subscription');
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response) {
        if (err.response.status === 400) {
          if (err.response.data.errors) {
            setFieldErrors(err.response.data.errors);
          } else if (err.response.data.message) {
            setError(err.response.data.message);
          } else {
            setError('Invalid registration data. Please check your inputs.');
          }
        } else if (err.response.status === 409) {
          setError('This email is already registered. Please use a different email or try logging in.');
        } else if (err.response.status === 500) {
          setError('Server error. Please try again later or contact support.');
        } else {
          setError(`Error: ${err.response.data.message || 'Unknown error occurred'}`);
        }
      } else if (err.request) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8 px-4">
      <div className="w-full max-w-2xl bg-gray-300 rounded-lg shadow-lg">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h1 className="text-3xl font-bold text-center mb-6">Register</h1>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  className={`w-full px-3 py-2 border ${fieldErrors.firstName ? 'border-red-500' : 'border-gray-400'} rounded-md bg-white bg-opacity-40`}
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {fieldErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  className={`w-full px-3 py-2 border ${fieldErrors.lastName ? 'border-red-500' : 'border-gray-400'} rounded-md bg-white bg-opacity-40`}
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {fieldErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                className={`w-full px-3 py-2 border ${fieldErrors.email ? 'border-red-500' : 'border-gray-400'} rounded-md bg-white bg-opacity-40`}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <div className="relative">
                <input
                  className={`w-full px-3 py-2 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-400'} rounded-md bg-white bg-opacity-40`}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <VisibilityOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Visibility className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
              <input
                className={`w-full px-3 py-2 border ${fieldErrors.businessName ? 'border-red-500' : 'border-gray-400'} rounded-md bg-white bg-opacity-40`}
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
              />
              {fieldErrors.businessName && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.businessName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                className={`w-full px-3 py-2 border ${fieldErrors.phoneNumber ? 'border-red-500' : 'border-gray-400'} rounded-md bg-white bg-opacity-40`}
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                maxLength="10"
              />
              {fieldErrors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.phoneNumber}</p>
              )}
            </div>

            <div className="border-t border-gray-400 my-6"></div>
            
            <h2 className="text-xl font-semibold mb-4">Financial Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-400 rounded-md bg-white bg-opacity-40"
              >
                <option value="USD">US Dollar USD</option>
                <option value="LKR">Sri Lankan Rupees LKR</option>
                <option value="INR">Indian Rupees INR</option>
                <option value="CAD">Canadian Dollar CAD</option>
                <option value="AUD">Australian Dollar AUD</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Non-Current Assets</label>
                <input
                  className="w-full px-3 py-2 border border-gray-400 rounded-md bg-white bg-opacity-40"
                  type="text"
                  name="nonCurrentAssets"
                  value={formData.nonCurrentAssets}
                  onChange={handleChange}
                  pattern="^\d+(\.\d{1,2})?$"
                  maxLength="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Non-Current Assets Description (Optional)</label>
                <input
                  className="w-full px-3 py-2 border border-gray-400 rounded-md bg-white bg-opacity-40"
                  type="text"
                  name="nonCurrentAssetsDesc"
                  value={formData.nonCurrentAssetsDesc}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Liabilities</label>
                <input
                  className="w-full px-3 py-2 border border-gray-400 rounded-md bg-white bg-opacity-40"
                  type="text"
                  name="liabilities"
                  value={formData.liabilities}
                  onChange={handleChange}
                  pattern="^\d+(\.\d{1,2})?$"
                  maxLength="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Liabilities Description (Optional)</label>
                <input
                  className="w-full px-3 py-2 border border-gray-400 rounded-md bg-white bg-opacity-40"
                  type="text"
                  name="liabilitiesDesc"
                  value={formData.liabilitiesDesc}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equity</label>
                <input
                  className="w-full px-3 py-2 border border-gray-400 rounded-md bg-white bg-opacity-40"
                  type="text"
                  name="equity"
                  value={formData.equity}
                  onChange={handleChange}
                  pattern="^\d+(\.\d{1,2})?$"
                  maxLength="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equity Description (Optional)</label>
                <input
                  className="w-full px-3 py-2 border border-gray-400 rounded-md bg-white bg-opacity-40"
                  type="text"
                  name="equityDesc"
                  value={formData.equityDesc}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 px-4 bg-blue-800 text-white font-medium rounded-md hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;