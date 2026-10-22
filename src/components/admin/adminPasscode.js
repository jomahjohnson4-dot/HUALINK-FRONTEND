/**
 * Admin passcode helpers.
 *
 * Kept out of AdminPasscodeGate.jsx so that file only exports a component,
 * which the react-refresh lint rule requires.
 *
 * The passcode IS the master admin password: the same value is used by the
 * dedicated `/admin/login` route and by the secure admin entry on the
 * standard sign-in form. The source of truth lives in
 * `src/config/adminAccess.js` so both layers can never drift apart.
 */
import { ADMIN_MASTER_PASSWORD, ADMIN_FLAG_KEY } from '../../config/adminAccess';

export const ADMIN_PASSCODE = ADMIN_MASTER_PASSWORD;
export { ADMIN_FLAG_KEY };

export function isAdminPasscodeUnlocked() {
  try {
    return localStorage.getItem(ADMIN_FLAG_KEY) === 'true';
  } catch {
    return false;
  }
}

export function unlockAdminPasscode() {
  try {
    localStorage.setItem(ADMIN_FLAG_KEY, 'true');
  } catch {
    /* storage unavailable — the in-memory unlock still applies */
  }
}

export function lockAdminPasscode() {
  try {
    localStorage.removeItem(ADMIN_FLAG_KEY);
  } catch {
    /* storage unavailable — nothing to clear */
  }
}
