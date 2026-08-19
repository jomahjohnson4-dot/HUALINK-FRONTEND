import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check token and initialize user state on app mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Hits your backend auth validation endpoint
          const response = await API.get('/auth/me');
          setUser(response.data.user || response.data);
        } catch (error) {
          console.error('Session expired or invalid token:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    const { token, user: userData } = response.data;

    if (token) {
      localStorage.setItem('token', token);
      setUser(userData);
    }
    return response.data;
  };

  // Register handler
  const register = async (formData) => {
    const response = await API.post('/auth/register', formData);
    const { token, user: userData } = response.data;

    if (token) {
      localStorage.setItem('token', token);
      setUser(userData);
    }
    return response.data;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook for accessing AuthContext throughout the app
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};