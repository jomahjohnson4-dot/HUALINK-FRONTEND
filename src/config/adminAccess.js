/**
 * Secure admin access configuration.
 *
 * The public "LOGIN AS ADMIN" demo button has been removed. Admin entry now
 * happens through ONE of two secure paths:
 *
 *   1. The standard sign-in form, using the protected admin mailbox
 *      (`admin@hualink.co.tz`) together with the designated master password.
 *      A successful attempt routes straight to `/admin`.
 *   2. The dedicated secure route `/admin/login`, which only ever asks for the
 *      master password. It is reachable from the login screen through a
 *      discreet trigger and the `Ctrl+Shift+A` keyboard shortcut.
 *
 * SECURITY NOTE
 * -------------
 * Any value configured through a `VITE_*` environment variable is inlined
 * into the client bundle and is therefore *not* a secret. The constants below
 * are therefore treated as an additional layer on top of the backend, never as
 * a replacement for it:
 *
 *   - The backend `/auth/login` endpoint stays the source of truth. Whenever
 *     it is reachable, the returned profile decides the role and the session.
 *   - The local master password only grants access when the backend cannot be
 *     reached at all (offline / demo deployment), mirroring the existing
 *     offline-fallback behaviour of the login form.
 *
 * Deployments that need a genuinely secret master password must validate it
 * server-side and issue the admin JWT from the API.
 */

/** Protected admin mailbox. */
export const ADMIN_EMAIL = (
  import.meta.env?.VITE_ADMIN_EMAIL || 'admin@hualink.co.tz'
).trim().toLowerCase();

/** Designated master admin password (overridable per deployment). */
export const ADMIN_MASTER_PASSWORD =
  import.meta.env?.VITE_ADMIN_MASTER_PASSWORD || 'hualink2026';

/** localStorage key that flags an unlocked admin session. */
export const ADMIN_FLAG_KEY = 'isHualinkAdmin';

/**
 * Case-insensitive comparison of the supplied address against the protected
 * admin mailbox.
 */
export const isAdminEmail = (email) =>
  String(email || '').trim().toLowerCase() === ADMIN_EMAIL;

/**
 * Verifies the master password. A constant-time-ish comparison is not
 * meaningful for a value that ships in the bundle, but the check is still
 * strict about whitespace so a stray space never grants access.
 */
export const verifyAdminMasterPassword = (password) => {
  const supplied = String(password ?? '');
  if (!supplied) return false;
  return supplied === ADMIN_MASTER_PASSWORD;
};

/**
 * True when the supplied pair is the protected admin mailbox + master
 * password. This is the only combination that unlocks the admin surface
 * without a successful backend round-trip.
 */
export const isAdminMasterCredential = (email, password) =>
  isAdminEmail(email) && verifyAdminMasterPassword(password);

/**
 * Builds the admin profile used for the offline / backend-less admin
 * session. The `admin: true` marker lets the auth layer recognise a local
 * session that the API cannot validate.
 */
export const buildAdminUser = () => ({
  id: 'admin_master',
  name: 'HUALINK Admin',
  email: ADMIN_EMAIL,
  role: 'admin',
  isLoggedIn: true,
  admin: true,
  signedInAt: new Date().toISOString(),
});

/**
 * Normalises any profile into the shape the role guards expect. Regular
 * users always receive standard customer permissions, never admin rights.
 */
export const normalizeUserRole = (user) => {
  const role = String(user?.role || '').trim().toUpperCase();
  if (role === 'ADMIN' || role === 'SELLER' || role === 'CUSTOMER') {
    return { ...user, role: role.toLowerCase() };
  }
  return { ...user, role: 'customer' };
};

/** True when the profile carries administrative rights. */
export const isAdminUser = (user) =>
  String(user?.role || '').trim().toUpperCase() === 'ADMIN' || user?.admin === true;

export default {
  ADMIN_EMAIL,
  ADMIN_MASTER_PASSWORD,
  ADMIN_FLAG_KEY,
  isAdminEmail,
  verifyAdminMasterPassword,
  isAdminMasterCredential,
  buildAdminUser,
  normalizeUserRole,
  isAdminUser,
};
