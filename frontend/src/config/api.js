import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    
    if (error.response?.status === 401) {
      console.log('Unauthorized access, clearing token and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  getFullProfile: () => api.get('/profile'),
  updateProfile: (data) => {
    console.log('Sending profile update request with data:', data);
    return api.put('/profile', data)
      .then(response => {
        console.log('Profile update successful:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Profile update failed:', error);
        throw error;
      });
  },
  deleteProfile: () => api.delete('/profile'),
};

export const userAPI = {
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const businessAPI = {
  getBusinesses: () => api.get('/businesses'),
  getBusiness: (id) => api.get(`/businesses/${id}`),
  createBusiness: (data) => api.post('/businesses', data),
  updateBusiness: (id, data) => api.put(`/businesses/${id}`, data),
  deleteBusiness: (id) => api.delete(`/businesses/${id}`),
};

export const transactionAPI = {
  getTransactions: () => api.get('/transactions'),
  getTransaction: (id) => api.get(`/transactions/${id}`),
  createTransaction: (data) => api.post('/transactions', data),
  updateTransaction: (id, data) => api.put(`/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/transactions/${id}`),
};

export const chatAPI = {
  getChats: () => api.get('/chat'),
  getChat: (id) => api.get(`/chat/${id}`),
  createChat: (data) => api.post('/chat', data),
  updateChat: (id, data) => api.put(`/chat/${id}`, data),
  deleteChat: (id) => api.delete(`/chat/${id}`),
  testChat: () => api.get('/chat/test'),
  testAuthChat: () => api.get('/chat/test-auth'),
};

export default api;
