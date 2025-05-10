// export default Login;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { authAPI } from '../config/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Clear field-specific error when user types
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
    
    // Clear general error when user types
    setError('');
  };

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6; // Example: password should be at least 6 characters
  };

  const validateForm = () => {
    const errors = {};
    let hasErrors = false;

    // Validate email
    if (!formData.email) {
      errors.email = "Email is required";
      hasErrors = true;
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
      hasErrors = true;
    }

    // Validate password
    if (!formData.password) {
      errors.password = "Password is required";
      hasErrors = true;
    } else if (!validatePassword(formData.password)) {
      errors.password = "Password must be at least 6 characters long";
      hasErrors = true;
    }

    setFieldErrors(errors);
    return !hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.login(formData.email, formData.password);
      
      // Check if the response has the expected structure
      if (response.data && response.data.data) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        navigate('/dashboard');
      } else {
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle specific API error responses
      if (err.response) {
        // Server responded with an error
        if (err.response.status === 400) {
          // Validation error from server
          if (err.response.data.errors) {
            // Field-specific errors
            setFieldErrors(err.response.data.errors);
          } else if (err.response.data.message) {
            // General error message
            setError(err.response.data.message);
          } else {
            setError('Invalid login data. Please check your inputs.');
          }
        } else if (err.response.status === 401) {
          // Unauthorized (invalid credentials)
          setError('Invalid email or password');
        } else if (err.response.status === 500) {
          // Server error
          setError('Server error. Please try again later or contact support.');
        } else {
          // Other error
          setError(`Error: ${err.response.data.message || 'Unknown error occurred'}`);
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('Network error. Please check your internet connection and try again.');
      } else {
        // Something else happened
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 py-8 px-4">
      <div className="max-w-md w-full shadow-lg rounded-lg bg-gray-300">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h1 className="text-3xl font-bold text-center mb-6">Login</h1>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md bg-white bg-opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md bg-white bg-opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'bg-blue-400' : 'bg-blue-800 hover:bg-blue-700'}`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-sm text-gray-600">
             Don&apos;t have an account?{' '}
             <Link 
            to="/register" 
           className="text-blue-600 hover:text-blue-800 font-medium"
            >
         Sign up
        </Link>
</p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;