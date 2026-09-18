import axios from 'axios';
import { getCookie } from '../utils/cookies';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    if (envUrl.includes('localhost') && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return envUrl.replace('localhost', window.location.hostname);
    }
    return envUrl;
  }
  if (import.meta.env.PROD) return '';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${hostname}:5000`;
};

const API_BASE_URL = getBaseUrl();

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
