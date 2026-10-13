import axios from 'axios';
import { getCookie } from '../utils/cookies';

const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Automatically attach JWT token from cookies/localStorage to headers if available
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
    let customMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.';

    // Fallback cleanup if any raw Firestore / gRPC error slipped past backend
    if (typeof customMessage === 'string') {
      if (customMessage.includes('1,048,576') || customMessage.includes('maximum allowed size')) {
        customMessage = 'Product data size exceeds the 1MB limit. Please ensure description does not contain pasted images and upload photos only through the Media section.';
      } else if (customMessage.includes('DEADLINE_EXCEEDED') || customMessage.includes('ETIMEDOUT')) {
        customMessage = 'Network connection timed out. Please check your internet connection and try again.';
      } else if (customMessage.includes('UNAVAILABLE')) {
        customMessage = 'Database service is temporarily unavailable. Please try again in a few moments.';
      }
    }

    return Promise.reject(new Error(customMessage));
  }
);


export default api;
