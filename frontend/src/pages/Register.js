import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  IconButton, 
  InputAdornment, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
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
    
    // Clear field-specific error when user types
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
    
    // Clear general error when user types
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

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'businessName', 'phoneNumber'];
    for (const key of requiredFields) {
      if (!formData[key]) {
        errors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
        hasErrors = true;
      }
    }

    // Validate email format
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
      hasErrors = true;
    }

    // Validate password length
    if (formData.password && !validatePassword(formData.password)) {
      errors.password = 'Password must be at least 6 characters long';
      hasErrors = true;
    }

    // Validate phone number format
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

    // Validate form
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Send all data in a single request
      const response = await authAPI.register(formData);
      
      // Store token and user data
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));

      // Redirect to subscription page
      navigate('/subscription');
    } catch (err) {
      console.error('Registration error:', err);
      
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
            setError('Invalid registration data. Please check your inputs.');
          }
        } else if (err.response.status === 409) {
          // Conflict (e.g., email already exists)
          setError('This email is already registered. Please use a different email or try logging in.');
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
    <Box sx={{ minHeight: '100vh', display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', py: 3, px: 2 }}>
      <Card sx={{ maxWidth: '50%', width: '100%', boxShadow: 3, color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
              Register
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Typography variant="h6" sx={{ mb: 2 }}>Personal Information</Typography>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="firstName"
              label="First Name"
              name="firstName"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={handleChange}
              error={!!fieldErrors.firstName}
              helperText={fieldErrors.firstName}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="lastName"
              label="Last Name"
              name="lastName"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={handleChange}
              error={!!fieldErrors.lastName}
              helperText={fieldErrors.lastName}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="businessName"
              label="Business Name"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              error={!!fieldErrors.businessName}
              helperText={fieldErrors.businessName}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="phoneNumber"
              label="Phone Number"
              name="phoneNumber"
              autoComplete="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={!!fieldErrors.phoneNumber}
              helperText={fieldErrors.phoneNumber}
              sx={{ mb: 3 }}
            />

            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" sx={{ mb: 2 }}>Financial Information</Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="currency-label">Currency</InputLabel>
              <Select
                labelId="currency-label"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                label="Currency"
              >
                <MenuItem value="USD">US Dollar USD</MenuItem>
                <MenuItem value="LKR">Sri Lankan Rupees LKR</MenuItem>
                <MenuItem value="INR">Indian Rupees INR</MenuItem>
                <MenuItem value="CAD">Canadian Dollar CAD</MenuItem>
                <MenuItem value="AUD">Australian Dollar AUD</MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              fullWidth
              name="nonCurrentAssets"
              label="Non-Current Assets"
              value={formData.nonCurrentAssets}
              onChange={handleChange}
              inputProps={{ pattern: '^[0-9]*$', maxLength: 12 }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              fullWidth
              name="nonCurrentAssetsDesc"
              label="Non-Current Assets Description (Optional)"
              value={formData.nonCurrentAssetsDesc}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              fullWidth
              name="liabilities"
              label="Liabilities"
              value={formData.liabilities}
              onChange={handleChange}
              inputProps={{ pattern: '^[0-9]*$', maxLength: 12 }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              fullWidth
              name="liabilitiesDesc"
              label="Liabilities Description (Optional)"
              value={formData.liabilitiesDesc}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              fullWidth
              name="equity"
              label="Equity"
              value={formData.equity}
              onChange={handleChange}
              inputProps={{ pattern: '^[0-9]*$', maxLength: 12 }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              fullWidth
              name="equityDesc"
              label="Equity Description (Optional)"
              value={formData.equityDesc}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />

            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              sx={{ mb: 3, py: 1.5 }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'primary.main', textDecoration: 'none' }}>Sign in</Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
