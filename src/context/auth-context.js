import { createContext } from 'react';

/**
 * Auth context.
 *
 * Kept in its own module so AuthContext.jsx can export only components
 * (required for React Fast Refresh) while the context value stays shareable
 * with consumers and tests.
 */
export const AuthContext = createContext(null);

export default AuthContext;
