import axios from 'axios';

// Create Axios instance using environment variable or local backend fallback
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Allows cross-origin cookies / sessions
});

// Request Interceptor: Automatically attach Bearer token if logged in
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Automatically clear local session on unauthorized responses
      if (error.response.status === 401) {
        localStorage.removeItem('token');
      }
      console.error(`[API Error ${error.response.status}]:`, error.response.data?.message || error.message);
    } else if (error.request) {
      console.error('[Network Error]: Express backend unreachable at http://localhost:5000');
    }
    return Promise.reject(error);
  }
);

export default API;