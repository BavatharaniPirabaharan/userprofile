import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, IconButton, InputAdornment, Alert } from '@mui/material';
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
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 3,
        px: 2,
      }}
    >
      <Card sx={{ maxWidth: '30%', width: '100%', boxShadow: 3, color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
              Login
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              sx={{
                mb: 2,
                '& .MuiInputBase-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', // Background color
                },
                '& .MuiInputBase-input': {
                  color: 'white', // White text color
                },
                '& input:-webkit-autofill': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1) !important', // Prevent autofill background color override
                  color: 'white !important', // Prevent autofill text color override
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
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
              sx={{
                mb: 3,
                '& .MuiInputBase-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', // Background color
                },
                '& .MuiInputBase-input': {
                  color: 'white', // White text color
                },
                '& input:-webkit-autofill': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1) !important', // Prevent autofill background color override
                  color: 'white !important', // Prevent autofill text color override
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mb: 3,
                py: 1.5,
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Don&apos;t have an account?{' '}
                <Link to="/register" style={{ color: 'primary.main', textDecoration: 'none' }}>
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
