import axios from 'axios';
import { getCookie } from '../utils/cookies';

const api = axios.create({
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
