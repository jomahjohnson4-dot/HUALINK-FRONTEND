import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';

/**
 * Guard for role-restricted routes.
 *
 * Failure modes are all handled explicitly so this component can never
 * return `null` (which would render a blank screen):
 *  - still checking the session -> visible loading state
 *  - not authenticated          -> renders the login form
 *  - wrong role                 -> redirects to /unauthorized
 */
export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="text-sm font-bold text-slate-400 animate-pulse">
          Loading session...
        </div>
      </div>
    );
  }

  const authenticated = isAuthenticated || !!user;

  if (!authenticated) {
    // Auth check failed -> cleanly show the login form instead of null/blank.
    return <Login />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = String(user?.role || '').toUpperCase();
    const permitted = allowedRoles.some(
      (allowed) => String(allowed || '').toUpperCase() === role
    );
    if (!permitted) {
      // Redirect unauthorized roles to their default home/dashboard
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children ?? <Outlet />;
};

export default ProtectedRoute;
