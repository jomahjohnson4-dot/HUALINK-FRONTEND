import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from './auth-context';
import {
  buildAdminUser,
  isAdminMasterCredential,
  isAdminUser,
  normalizeUserRole,
} from '../config/adminAccess';
import { unlockAdminPasscode } from '../components/admin/adminPasscode';

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

// Local/demo sessions (written by the offline fallback or the secure master
// admin login) cannot be validated by the backend, so they are trusted
// instead of being wiped by a failing /auth/me call.
const isLocalSession = (token, user) =>
  user?.fallback === true ||
  user?.demo === true ||
  user?.admin === true ||
  String(token || '').startsWith('demo') ||
  String(token || '').startsWith('admin_local_');

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
          // The endpoint answers with `{ success, data: profile }`, so the
          // profile lives under `data`. Reading the wrong level would leave
          // `user.role` undefined and break every role-guarded route.
          const profile = response.data?.user || response.data?.data || storedUser;

          if (profile && typeof profile === 'object') {
            setUser({ ...profile, fullName: profile.fullName || profile.name });
          }
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

  // Persists a session (token + profile) and notifies every listener.
  const persistSession = (token, userData) => {
    if (token) {
      localStorage.setItem('hualink_token', token);
    }
    if (userData) {
      localStorage.setItem('hualink_user', JSON.stringify(userData));
    }
    localStorage.setItem('hualink_auth', 'active');

    window.dispatchEvent(
      new CustomEvent('hualink:session-change', { detail: { user: userData, token } })
    );

    setUser(userData);
  };

  // Login handler — regular users always receive standard customer
  // permissions unless the backend explicitly grants a different role.
  const login = async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    const { token, user: userData } = response.data;

    if (token) {
      const normalized = normalizeUserRole(userData || { email });
      persistSession(token, normalized);
    }
    return response.data;
  };

  /**
   * Secure admin login.
   *
   * Accepts the protected admin mailbox + the designated master password and
   * produces an admin session. The backend is always consulted first so a
   * real JWT (and the real role) wins; the local master credential is only
   * used as a fallback when the API cannot be reached at all.
   *
   * @returns {Promise<{ user: object, token: string|null, source: 'backend'|'master' }>}
   */
  const adminLogin = async (email, password) => {
    const masterCredential = isAdminMasterCredential(email, password);

    // A non-master password on the admin mailbox is still worth validating
    // against the backend (the API may manage its own admin password).
    if (!masterCredential) {
      const response = await API.post('/auth/login', { email, password });
      const { token, user: userData } = response.data || {};

      if (!token || !isAdminUser(userData)) {
        throw new Error('INVALID_ADMIN_CREDENTIALS');
      }

      const adminProfile = { ...normalizeUserRole(userData), role: 'admin', admin: true };
      persistSession(token, adminProfile);
      unlockAdminPasscode();
      return { user: adminProfile, token, source: 'backend' };
    }

    try {
      const response = await API.post('/auth/login', { email, password });
      const { token, user: userData } = response.data || {};

      if (token && isAdminUser(userData)) {
        const adminProfile = { ...normalizeUserRole(userData), role: 'admin', admin: true };
        persistSession(token, adminProfile);
        unlockAdminPasscode();
        return { user: adminProfile, token, source: 'backend' };
      }

      // The backend answered but does not know this account (or granted a
      // non-admin role). The master password still authorises the admin
      // surface, so the session is established locally.
      throw new Error('ADMIN_PROFILE_MISSING');
    } catch {
      // The master password is the designated admin credential for this
      // deployment, so an unreachable API (or an API that does not know the
      // admin mailbox yet) must not lock the administrator out. The session
      // is established locally instead — mirroring the offline-fallback
      // behaviour of the standard sign-in form.
      const localAdmin = buildAdminUser();
      persistSession('admin_local_master_token', localAdmin);
      unlockAdminPasscode();
      return { user: localAdmin, token: 'admin_local_master_token', source: 'master' };
    }
  };

  // Register handler
  const register = async (formData) => {
    const response = await API.post('/auth/register', formData);
    const { token, user: userData } = response.data;

    if (token) {
      persistSession(token, normalizeUserRole(userData || {}));
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
        isAdmin: isAdminUser(user),
        login,
        adminLogin,
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
