import api from './axios';

/**
 * Verification Code (OTP / PIN) client.
 *
 * Two flows are supported:
 *
 *  - `SIGNUP` — a 6-digit code sent by email/SMS while the customer creates
 *    their account. The account is only created once the code is confirmed.
 *  - `ORDER`  — a 4-digit PIN confirming a high-value wholesale purchase
 *    request before the order is written to the database.
 *
 * The backend persists every issued and verified code, so the admin console
 * can audit the whole trail.
 */

/** The demo codes surfaced by the UI autofill helper. */
export const DEMO_CODES = {
  SIGNUP: '123456',
  ORDER: '1234',
};

/**
 * Requests the 6-digit sign-up verification code.
 *
 * @param {object} params
 * @param {string} params.email
 * @param {string} [params.phone]
 */
export const requestSignupOtp = async ({ email, phone } = {}) => {
  const response = await api.post('/auth/request-signup-otp', { email, phone });

  return {
    verificationId: response.data?.data?.verificationId || null,
    length: response.data?.data?.length || 6,
    expiresAt: response.data?.data?.expiresAt || null,
    channel: response.data?.data?.channel || [],
    // Only populated in demo mode — the UI offers a one-click autofill.
    demoCode: response.data?.data?.demoCode || null,
    isDemo: Boolean(response.data?.data?.isDemo),
    message: response.data?.message || 'A verification code has been sent.',
  };
};

/**
 * Confirms a verification code.
 *
 * The backend stores the verified status in PostgreSQL and answers with the
 * id of the verification record, which the sign-up flow hands back when it
 * creates the account.
 *
 * @param {object} params
 * @param {string} params.code
 * @param {'SIGNUP'|'ORDER'} [params.purpose]
 * @param {string} [params.email]
 * @param {string} [params.phone]
 */
export const verifyOtp = async ({ code, purpose = 'SIGNUP', email, phone } = {}) => {
  const response = await api.post('/auth/verify-otp', {
    code,
    purpose,
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
  });

  return {
    success: Boolean(response.data?.success),
    verificationId: response.data?.data?.verificationId || null,
    purpose: response.data?.data?.purpose || purpose,
    status: response.data?.data?.status || 'VERIFIED',
    verifiedAt: response.data?.data?.verifiedAt || null,
    message: response.data?.message || 'Verification successful.',
  };
};

/**
 * Requests the 4-digit PIN that confirms a wholesale order request.
 *
 * @param {object} params
 * @param {number} [params.amount] the order value being authorised
 */
export const requestOrderPin = async ({ amount } = {}) => {
  const response = await api.post('/orders/request-pin', {
    ...(amount === undefined || amount === null ? {} : { amount }),
  });

  return {
    verificationId: response.data?.data?.verificationId || null,
    length: response.data?.data?.length || 4,
    expiresAt: response.data?.data?.expiresAt || null,
    channel: response.data?.data?.channel || [],
    // Only populated in demo mode — the UI offers a one-click autofill.
    demoCode: response.data?.data?.demoCode || null,
    isDemo: Boolean(response.data?.data?.isDemo),
    message: response.data?.message || 'A confirmation PIN has been sent.',
  };
};

/**
 * Confirms the 4-digit order PIN.
 *
 * @param {object} params
 * @param {string} params.code
 * @param {number} [params.amount]
 */
export const verifyOrderPin = async ({ code, amount } = {}) => {
  const response = await api.post('/orders/verify-pin', {
    code,
    ...(amount === undefined || amount === null ? {} : { amount }),
  });

  return {
    success: Boolean(response.data?.success),
    verificationId: response.data?.data?.verificationId || null,
    status: response.data?.data?.status || 'VERIFIED',
    verifiedAt: response.data?.data?.verifiedAt || null,
    message: response.data?.message || 'Order request confirmed.',
  };
};
