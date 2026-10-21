import api from './axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/** The backend host without the trailing `/api` segment. */
const API_HOST = String(API_BASE_URL).trim().replace(/\/+$/, '').replace(/\/api$/, '');

/**
 * Normalise an order payload into a plain array of orders.
 */
const toOrderList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload?.data?.orders)) return payload.data.orders;
  return [];
};

/**
 * Fetch the signed-in customer's own orders (live route tracking source).
 */
export const getMyOrders = async () => {
  const response = await api.get('/orders');
  return toOrderList(response.data);
};

/**
 * Fetch every order — admin only.
 */
export const getAdminOrders = async () => {
  const response = await api.get('/admin/orders');
  return toOrderList(response.data);
};

/**
 * Fetch a single order by id.
 */
export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data?.data || response.data;
};

/**
 * Move an order to a new lifecycle stage.
 *
 * The backend accepts the friendly labels used across the UI
 * (`Pending`, `Processing`, `Dispatched`, `Delivered`) as well as the raw
 * database enum values, and broadcasts the change to every client watching
 * live route tracking.
 */
export const updateOrderStatus = async (id, status) => {
  const response = await api.patch(`/orders/${id}/status`, { status });
  return response.data?.data || response.data;
};

/**
 * Connect to SSE payment updates for a given order
 * @param {string} orderId
 * @param {function} onStatusChange - Callback receiving { orderId, status }
 * @returns {function} Cleanup function to close the stream
 */
export const subscribeToPaymentStatus = (orderId, onStatusChange) => {
  if (!orderId) return () => {};

  const eventSource = new EventSource(`${API_HOST}/api/orders/payments/stream/${orderId}`);

  eventSource.onopen = () => {
    console.log(`[SSE Connected] Listening for order status: ${orderId}`);
  };

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (onStatusChange) onStatusChange(data);

      // Auto-close connection once terminal status is reached
      if (['PAID', 'FAILED', 'CANCELLED'].includes(data.status)) {
        eventSource.close();
      }
    } catch (err) {
      console.error('[SSE Parse Error]:', err);
    }
  };

  eventSource.onerror = (err) => {
    console.error('[SSE Connection Error]:', err);
  };

  // Return unsubscribe function for useEffect cleanups
  return () => {
    console.log('[SSE Closing Connection]');
    eventSource.close();
  };
};

/**
 * Subscribe to live route tracking for an order.
 *
 * The server pushes a new payload every time an admin moves the order to a
 * different stage, so the customer view updates without a manual refresh.
 *
 * @param {string} orderId
 * @param {function} onStatusChange - Callback receiving { orderId, status, ... }
 * @returns {function} Cleanup function to close the stream
 */
export const subscribeToOrderStatus = (orderId, onStatusChange) => {
  if (!orderId) return () => {};

  const eventSource = new EventSource(`${API_HOST}/api/orders/${orderId}/stream`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      // The handshake message only confirms the connection.
      if (data.status === 'CONNECTED') return;
      if (onStatusChange) onStatusChange(data);
    } catch (err) {
      console.error('[SSE Parse Error]:', err);
    }
  };

  eventSource.onerror = () => {
    // The browser reconnects automatically; nothing to do here.
  };

  return () => eventSource.close();
};
