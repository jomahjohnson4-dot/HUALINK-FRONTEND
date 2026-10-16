import axios from 'axios';

// Prioritize production Render backend URL with local fallback
const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  import.meta.env.VITE_API_BASE_URL || 
  'https://hualink-backend.onrender.com/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Automatically attach Bearer token to all outbound requests
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

// Response Interceptor: Centralized Error Handling & Auth Cleanup
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Clear token on 401 Unauthorized responses (session expired or invalid)
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        console.warn('[API Auth Session Expired]: Cleared local storage token.');
      }
      console.error(`[API Error ${error.response.status}]:`, error.response.data?.message || error.message);
    } else if (error.request) {
      console.error(`[Network Error]: Backend unreachable at ${API_BASE_URL}. Ensure Express server is running.`);
    } else {
      console.error('[Request Setup Error]:', error.message);
    }
    return Promise.reject(error);
  }
);

export default API;