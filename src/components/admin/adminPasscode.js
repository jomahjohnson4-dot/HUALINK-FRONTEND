/**
 * Admin passcode helpers.
 *
 * Kept out of AdminPasscodeGate.jsx so that file only exports a component,
 * which the react-refresh lint rule requires.
 */
export const ADMIN_PASSCODE = 'hualink2026';
export const ADMIN_FLAG_KEY = 'isHualinkAdmin';

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
