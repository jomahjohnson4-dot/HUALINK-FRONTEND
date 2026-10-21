import api from './axios';

/**
 * In-app chat & inquiry service.
 *
 * Client messages land in the `inquiries` table via POST /api/inquiries and
 * are surfaced to the admin dashboard through GET /api/admin/inquiries.
 */

/**
 * Send a chat message / inquiry to the sales desk.
 *
 * @param {object} payload
 * @param {string} payload.customerName     sender display name
 * @param {string} payload.customerContact  phone number, email, or handle
 * @param {string} payload.productOrService what the client is asking about
 * @param {string} payload.message          the message body
 * @param {string} [payload.timestamp]      ISO timestamp of when it was sent
 */
export const createInquiry = async (payload) => {
  const response = await api.post('/inquiries', {
    customerName: payload.customerName,
    customerContact: payload.customerContact,
    productOrService: payload.productOrService,
    message: payload.message,
    timestamp: payload.timestamp || new Date().toISOString(),
  });

  return response.data?.data || response.data;
};

/**
 * Fetch the inquiry feed (admin only).
 *
 * @param {object} [options]
 * @param {string} [options.status] NEW | REPLIED | RESOLVED
 */
export const getInquiries = async ({ status } = {}) => {
  const response = await api.get('/admin/inquiries', {
    params: status ? { status } : undefined,
  });

  return {
    inquiries: response.data?.data || [],
    summary: response.data?.summary || null,
  };
};

/**
 * Move an inquiry through its lifecycle (admin only).
 *
 * @param {string} id
 * @param {string} status NEW | Replied | Resolved
 * @param {string} [adminNote] optional note stored alongside the inquiry
 */
export const updateInquiryStatus = async (id, status, adminNote) => {
  const response = await api.patch(`/admin/inquiries/${id}`, {
    status,
    ...(adminNote !== undefined ? { adminNote } : {}),
  });

  return response.data?.data || response.data;
};

/**
 * Delete an inquiry (admin only).
 */
export const deleteInquiry = async (id) => {
  const response = await api.delete(`/admin/inquiries/${id}`);
  return response.data;
};
