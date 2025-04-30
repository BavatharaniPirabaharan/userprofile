import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Assistant from './pages/Assistant';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import SubscriptionDetails from './pages/SubscriptionDetails';
import NotFound from './pages/NotFound';

// Components
import Layout from './components/Layout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
          <Routes>
            {/* Auth routes */}
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/subscription' element={<Subscription />} />
            <Route path="/assistant" element={<Assistant />} />

            {/* Protected routes */}
            <Route path='/' element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="subscription-details" element={<SubscriptionDetails />} />
            </Route>

            {/* 404 route */}
            <Route path='*' element={<NotFound />} />
          </Routes>
        </Box>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
