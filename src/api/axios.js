import axios from 'axios';

// Central Axios base URL. Strictly targets the Express backend on port 5000.
// Override via VITE_API_URL / VITE_API_BASE_URL for production (Render, etc.).
// The `/api` prefix is always applied exactly once, whether the env var is a
// bare host (http://host:5000) or already includes it (http://host:5000/api).
const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000';

const API_BASE_URL = `${RAW_API_URL.replace(/\/+$/, '')}/api`;

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
    const token = localStorage.getItem('hualink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized Error Handling & Auth Cleanup
// Network errors (backend unreachable) and 404s are NOT swallowed here —
// they are re-thrown so the calling page can render a graceful UI fallback
// and persist a local session so testing is never blocked.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // No response received => backend is unreachable (network error)
    if (!error.response) {
      const isNetworkError =
        error.code === 'ECONNREFUSED' ||
        error.code === 'ERR_NETWORK' ||
        error.message === 'Network Error' ||
        !error.request;
      if (isNetworkError) {
        console.error(
          `[Network Error]: Backend unreachable at ${API_BASE_URL}. Ensure Express server is running on port 5000.`
        );
      }
      return Promise.reject(error);
    }

    // Backend responded with an error status (e.g. 404, 500, 401)
    if (error.response.status === 401) {
      localStorage.removeItem('hualink_token');
      localStorage.removeItem('hualink_user');
      console.warn('[API Auth Session Expired]: Cleared local storage session.');
    }
    console.error(
      `[API Error ${error.response.status}]:`,
      error.response.data?.message || error.message
    );
    return Promise.reject(error);
  }
);

export { API, API_BASE_URL };
export default API;
