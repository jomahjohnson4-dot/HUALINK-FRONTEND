import api, { API_BASE_URL } from './axios';

/**
 * System-wide notification service.
 *
 * Backed by `GET/POST /api/notifications` on the Express server. Every
 * notable system activity — a new chat inquiry, a product catalogue change,
 * an order status update, a customer sign-up or an OTP verification — is
 * logged server-side and streamed back over SSE so the alert bell updates
 * live.
 */

export const NOTIFICATION_TYPES = [
  'ORDER',
  'INQUIRY',
  'PRODUCT',
  'SYSTEM',
  'SIGNUP',
  'VERIFY',
];

/** The shared bucket every administrator reads from. */
export const ADMIN_RECIPIENT = 'ADMIN';

/** Flattens a raw notification row into the shape the UI renders. */
const normaliseNotification = (raw) => ({
  id: raw.id,
  title: raw.title,
  message: raw.message,
  type: NOTIFICATION_TYPES.includes(raw.type) ? raw.type : 'SYSTEM',
  isRead: Boolean(raw.isRead),
  createdAt: raw.createdAt,
  userId: raw.userId,
});

/**
 * Fetch the notification feed for the signed-in principal.
 *
 * @param {object} [options]
 * @param {number} [options.limit]      how many rows to pull (default 50)
 * @param {boolean} [options.unreadOnly] only return unread rows
 * @param {'all'} [options.scope]        admins only — merge the shared admin
 *                                      activity bucket into the feed
 * @param {string} [options.type]        filter by notification type
 */
export const getNotifications = async ({
  limit = 50,
  unreadOnly = false,
  scope,
  type,
} = {}) => {
  const response = await api.get('/notifications', {
    params: {
      limit,
      ...(unreadOnly ? { unreadOnly: 'true' } : {}),
      ...(scope ? { scope } : {}),
      ...(type ? { type } : {}),
    },
  });

  return {
    notifications: (response.data?.data || []).map(normaliseNotification),
    unreadCount: response.data?.unreadCount || 0,
    recipient: response.data?.recipient || null,
  };
};

/**
 * Log a system event. Mostly used by internal tooling — the application
 * itself triggers notifications through the backend activity handlers.
 */
export const createNotification = async ({ userId, title, message, type = 'SYSTEM' } = {}) => {
  const response = await api.post('/notifications', {
    ...(userId ? { userId } : {}),
    title,
    message,
    type,
  });

  return normaliseNotification(response.data?.data || {});
};

/**
 * Mark a single notification as read.
 */
export const markNotificationRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return normaliseNotification(response.data?.data || {});
};

/**
 * Mark every notification in the caller's bucket as read.
 */
export const markAllNotificationsRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};

/**
 * Remove a notification from the feed.
 */
export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

/**
 * Fetch the cross-recipient audit log (admin only).
 *
 * Unlike the customer feed this spans every recipient bucket, so the Hualink
 * Admin can review every sign-up, order purchase and verification event in a
 * single chronological stream.
 *
 * @param {object} [options]
 * @param {number} [options.limit]     how many rows to pull
 * @param {string} [options.category]  SIGNUP | ORDERS | VERIFICATION | ...
 */
export const getAdminAuditLog = async ({ limit = 100, category, type } = {}) => {
  const response = await api.get('/admin/notifications', {
    params: {
      limit,
      ...(category ? { category } : {}),
      ...(type ? { type } : {}),
    },
  });

  return {
    notifications: (response.data?.data || []).map(normaliseNotification),
    verificationCodes: response.data?.verificationCodes || [],
    summary: response.data?.summary || { total: 0, byType: {}, verifications: 0 },
  };
};

/**
 * Subscribe to live notifications over SSE.
 *
 * `EventSource` cannot attach an Authorization header, so the JWT travels as
 * a query parameter and is verified by the server before the stream opens.
 *
 * @param {(notification: object) => void} onNotification
 * @param {(error: Event) => void} [onError]
 * @returns {() => void} unsubscribe
 */
export const subscribeToNotifications = (onNotification, onError) => {
  const token = localStorage.getItem('hualink_token');
  if (!token) return () => {};

  let source;
  try {
    source = new EventSource(
      `${API_BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`
    );
  } catch (error) {
    onError?.(error);
    return () => {};
  }

  source.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);

      // The handshake frame is not a notification.
      if (!payload?.id) return;

      onNotification(normaliseNotification(payload));
    } catch (error) {
      console.error('[Notifications] Failed to parse the live event:', error);
    }
  };

  source.onerror = (error) => {
    onError?.(error);
  };

  return () => {
    source.close();
  };
};
