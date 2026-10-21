import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from './auth-context';

// Synchronously restore any persisted session so the very first render is
// never blocked by (or waiting on) a network round-trip. Malformed JSON or
// unavailable storage must never throw — it would blank the whole app.
const readStoredSession = () => {
  try {
    const token = localStorage.getItem('hualink_token');
    const rawUser = localStorage.getItem('hualink_user');
    if (!token || !rawUser) return null;
    const parsed = JSON.parse(rawUser);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

// Local/demo sessions (written by the offline fallback or the "Login as
// Admin" demo button) cannot be validated by the backend, so they are
// trusted instead of being wiped by a failing /auth/me call.
const isLocalSession = (token, user) =>
  user?.fallback === true || user?.demo === true || String(token || '').startsWith('demo');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredSession);
  const [loading, setLoading] = useState(true);

  // Check token and initialize user state on app mount
  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
      const token = localStorage.getItem('hualink_token');
      const storedUser = readStoredSession();

      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      if (isLocalSession(token, storedUser)) {
        if (!cancelled) setUser(storedUser);
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        // Hits your backend auth validation endpoint (bounded so a dead or
        // misconfigured API can never keep the app in a permanent loading
        // state / blank screen).
        const response = await API.get('/auth/me', { timeout: 8000 });
        if (!cancelled) {
          setUser(response.data?.user || response.data || storedUser);
        }
      } catch (error) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          // Definitive rejection from the backend -> session is really dead.
          localStorage.removeItem('hualink_token');
          localStorage.removeItem('hualink_user');
          if (!cancelled) setUser(null);
        } else {
          // Backend unreachable / timeout / 5xx: keep the local session so
          // the user is not logged out (and never left on a blank screen).
          console.warn('[Auth] Session validation skipped (API unreachable):', error.message);
          if (!cancelled) setUser(storedUser);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initializeAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  // Stay in sync with sessions written by the login/register pages.
  useEffect(() => {
    const handleSessionChange = (event) => {
      const detailUser = event?.detail?.user;
      if (detailUser && typeof detailUser === 'object') {
        setUser(detailUser);
      } else {
        setUser(readStoredSession());
      }
    };
    window.addEventListener('hualink:session-change', handleSessionChange);
    return () => window.removeEventListener('hualink:session-change', handleSessionChange);
  }, []);

  // Login handler
  const login = async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    const { token, user: userData } = response.data;

    if (token) {
      localStorage.setItem('hualink_token', token);
      localStorage.setItem('hualink_user', JSON.stringify(userData));
      setUser(userData);
    }
    return response.data;
  };

  // Register handler
  const register = async (formData) => {
    const response = await API.post('/auth/register', formData);
    const { token, user: userData } = response.data;

    if (token) {
      localStorage.setItem('hualink_token', token);
      localStorage.setItem('hualink_user', JSON.stringify(userData));
      setUser(userData);
    }
    return response.data;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('hualink_token');
    localStorage.removeItem('hualink_user');
    localStorage.removeItem('hualink_auth');
    localStorage.removeItem('isHualinkAdmin');
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
      {/* Children always render: a pending/failed session check must never
          produce a blank screen. Guards handle their own loading states. */}
      {children}
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
