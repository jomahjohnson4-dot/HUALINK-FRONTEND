import api from './axios';

/**
 * Payment service for the Hualink storefront.
 *
 * Mirrors the gateway contract already used by the checkout flow:
 *   POST /orders          -> creates the order record
 *   POST /payments/initiate -> dispatches the mobile money prompt
 *   GET  /orders/payments/stream/:orderId -> SSE status updates
 */

/**
 * Payment provider catalogue.
 *
 * `method` is the value stored on the order, `code` is what the gateway
 * receives on /payments/initiate. Both mirror the provider codes the backend
 * already accepts from the checkout flow.
 */
export const PAYMENT_PROVIDERS = {
  MPESA: {
    id: 'MPESA',
    method: 'M-PESA',
    code: 'MPESA',
    label: 'Vodacom M-Pesa',
    shortLabel: 'M-Pesa',
    brand: '#E60000',
  },
  AIRTEL: {
    id: 'AIRTEL',
    method: 'AIRTEL-MONEY',
    code: 'AIRTEL',
    label: 'Airtel Money',
    shortLabel: 'Airtel',
    brand: '#E4002B',
  },
  HALOPESA: {
    id: 'HALOPESA',
    method: 'HALOPESA',
    code: 'HALOPESA',
    label: 'HaloPesa',
    shortLabel: 'HaloPesa',
    brand: '#F58220',
  },
  MIXX: {
    id: 'MIXX',
    method: 'MIXX-BY-YAS',
    code: 'MIXXBY-YAS',
    label: 'Mixx by Yas',
    shortLabel: 'Mixx by Yas',
    brand: '#7C3AED',
  },
  TIGO: {
    id: 'TIGO',
    method: 'MIXX-BY-YAS',
    code: 'MIXXBY-YAS',
    label: 'Tigo Pesa',
    shortLabel: 'Tigo Pesa',
    brand: '#1E40AF',
  },
  AZAMPAY: {
    id: 'AZAMPAY',
    method: 'AZAMPAY',
    code: 'AZAMPAY',
    label: 'AzamPay Wallet',
    shortLabel: 'AzamPay',
    brand: '#0EA5E9',
  },
  CASH: {
    id: 'CASH',
    method: 'CASH',
    code: 'CASH',
    label: 'Pay by Cash / Lipa kwa Cash',
    shortLabel: 'Cash',
    brand: '#F97316',
  },
};

/** Providers that dispatch a real mobile money prompt to the customer's phone. */
export const MOBILE_MONEY_PROVIDERS = [
  PAYMENT_PROVIDERS.MPESA,
  PAYMENT_PROVIDERS.AIRTEL,
  PAYMENT_PROVIDERS.MIXX,
  PAYMENT_PROVIDERS.TIGO,
  PAYMENT_PROVIDERS.HALOPESA,
];

/**
 * Convert a local phone number to the international MSISDN the gateway wants.
 * 0781359770 -> 255781359770
 */
export const normalizeMsisdn = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('255')) return digits;
  if (digits.startsWith('0')) return `255${digits.slice(1)}`;
  return `255${digits}`;
};

/** Extract a numeric amount from a display price ('TSh 520,000' -> 520000). */
export const parseAmount = (price) => {
  if (typeof price === 'number') return Number.isFinite(price) ? price : 0;
  const value = parseFloat(String(price || '').replace(/[^0-9.]/g, ''));
  return Number.isNaN(value) ? 0 : value;
};

/**
 * Create the order record that a payment prompt will be attached to.
 * @returns {object} The created order
 */
export const createOrderService = async (payload) => {
  const response = await api.post('/orders', payload);
  return response.data?.data || response.data;
};

/**
 * Dispatch a mobile money payment prompt through the backend gateway.
 *
 * @param {object}  params
 * @param {string}  params.orderId  Order the payment belongs to
 * @param {string}  params.phone     Customer MSISDN (255XXXXXXXXX)
 * @param {number}  params.amount    Amount to charge
 * @param {string}  params.provider  Gateway provider code (MPESA, AIRTEL, ...)
 */
export const initiatePaymentService = async ({ orderId, phone, amount, provider, ...rest }) => {
  const response = await api.post('/payments/initiate', {
    orderId,
    phone,
    amount,
    provider,
    ...rest,
  });
  return response.data;
};

/**
 * Listen for real-time payment status updates (webhook driven SSE).
 * @returns {function} Cleanup function that closes the stream
 */
export const subscribeToPaymentStatusService = (orderId, onStatusChange) => {
  if (!orderId) return () => {};

  const base = api.defaults.baseURL || 'http://localhost:5000/api';
  const eventSource = new EventSource(`${base}/orders/payments/stream/${orderId}`, {
    withCredentials: true,
  });

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onStatusChange?.(data);

      if (['PAID', 'FAILED', 'CANCELLED'].includes(data.status)) {
        eventSource.close();
      }
    } catch (err) {
      console.error('[Payment SSE Parse Error]:', err);
    }
  };

  eventSource.onerror = (err) => {
    console.error('[Payment SSE Error]:', err);
  };

  return () => eventSource.close();
};

export default {
  PAYMENT_PROVIDERS,
  MOBILE_MONEY_PROVIDERS,
  normalizeMsisdn,
  parseAmount,
  createOrderService,
  initiatePaymentService,
  subscribeToPaymentStatusService,
};
