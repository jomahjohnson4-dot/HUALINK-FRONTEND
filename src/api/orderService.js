// src/api/orderService.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Connect to SSE payment updates for a given order
 * @param {string} orderId 
 * @param {function} onStatusChange - Callback receiving { orderId, status }
 * @returns {function} Cleanup function to close the stream
 */
export const subscribeToPaymentStatus = (orderId, onStatusChange) => {
  if (!orderId) return () => {};

  const eventSource = new EventSource(`${API_BASE_URL}/api/orders/payments/stream/${orderId}`);

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