import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../config/api';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authAPI.getProfile();
        setCurrentUser(response.data);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      localStorage.removeItem('token');
      setCurrentUser(null);
      setError(error.response?.data?.message || 'Failed to check authentication status');
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        businessName: formData.businessName,
        phoneNumber: formData.phoneNumber,
      });
      const { token } = response.data;
      localStorage.setItem('token', token);
      await checkAuthStatus();
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login(email, password);
      const { token } = response.data;
      localStorage.setItem('token', token);
      await checkAuthStatus();
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      setError(error.response?.data?.message || 'Logout failed. Please try again.');
    } finally {
      localStorage.removeItem('token');
      setCurrentUser(null);
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.updateProfile(data);
      setCurrentUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Profile update failed:', error);
      setError(error.response?.data?.message || 'Profile update failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      await authAPI.changePassword({
        currentPassword,
        newPassword,
      });
    } catch (error) {
      console.error('Password change failed:', error);
      setError(error.response?.data?.message || 'Password change failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 