import axios from 'axios';
import { getCookie } from '../utils/cookies';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Automatically attach JWT token from cookies to headers if available
api.interceptors.request.use(
  (config) => {
    const token = getCookie('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Extract clean error messages from backend responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage = 
      error.response?.data?.message || 
      error.message || 
      'An unexpected error occurred.';
    return Promise.reject(new Error(customMessage));
  }
);

export default api;
