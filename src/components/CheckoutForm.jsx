import { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = 'http://localhost:5000/api';

/** Delivery regions offered by the checkout form. */
const REGIONS = [
  { id: 'Dar es Salaam', labelKey: 'checkout.regions.darEsSalaam' },
  { id: 'Mbeya', labelKey: 'checkout.regions.mbeya' },
  { id: 'Arusha', labelKey: 'checkout.regions.arusha' },
  { id: 'Dodoma', labelKey: 'checkout.regions.dodoma' },
  { id: 'Mwanza', labelKey: 'checkout.regions.mwanza' },
];

/** Mobile-money gateways offered by the checkout form. */
const PAYMENT_METHODS = [
  { id: 'M-PESA', labelKey: 'checkout.providers.vodacom' },
  { id: 'AZAM-PAY', labelKey: 'checkout.providers.azamPayGateway' },
  { id: 'AIRTEL-MONEY', labelKey: 'checkout.providers.airtel' },
  { id: 'HALOPESA', labelKey: 'checkout.providers.halo' },
  { id: 'MIXX-BY-YAS', labelKey: 'checkout.providers.mixx' },
];

export default function CheckoutForm({ cartItems = [], clearCart }) {
  const { t } = useTranslation();
  const [customerName, setCustomerName] = useState('Johnson John');
  const [customerPhone, setCustomerPhone] = useState('0781359770');
  const [deliveryRegion, setDeliveryRegion] = useState('Dar es Salaam');
  const [deliveryAddress, setDeliveryAddress] = useState('Mbeya, Tanzania');
  const [paymentMethod, setPaymentMethod] = useState('M-PESA');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const eventSourceRef = useRef(null);

  // Safe numeric parser to prevent NaN calculations
  const parsePrice = (item) => {
    const rawPrice = item?.price ?? item?.unitPrice ?? item?.basePrice ?? 0;
    const numeric = typeof rawPrice === 'string' ? parseFloat(rawPrice.replace(/[^0-9.]/g, '')) : Number(rawPrice);
    return isNaN(numeric) ? 0 : numeric;
  };

  const totalAmount = cartItems.reduce((sum, item) => {
    const itemPrice = parsePrice(item);
    const itemQty = Number(item.quantity) || 1;
    return sum + itemPrice * itemQty;
  }, 0);

  // Clean up SSE stream connection on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Subscribe to real-time SSE payment updates from webhook trigger
  const subscribeToPaymentUpdates = (orderId) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const sseUrl = `${API_BASE_URL}/payments/stream/${orderId}`;
    eventSourceRef.current = new EventSource(sseUrl);

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (['COMPLETED', 'PAID', 'SUCCESS'].includes((data.status || '').toUpperCase())) {
          setStatus({
            type: 'success',
            message: t('checkout.paymentSuccess'),
          });
          setLoading(false);
          if (clearCart) clearCart();
          eventSourceRef.current.close();
        } else if (['FAILED', 'CANCELLED', 'DECLINED'].includes((data.status || '').toUpperCase())) {
          setStatus({
            type: 'error',
            message: t('checkout.paymentFailed'),
          });
          setLoading(false);
          eventSourceRef.current.close();
        }
      } catch (err) {
        console.error('Error parsing SSE event data:', err);
      }
    };

    eventSourceRef.current.onerror = (err) => {
      console.error('SSE connection error:', err);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    // 1. Verify auth token existence
    const token = localStorage.getItem('token');
    if (!token) {
      setStatus({
        type: 'error',
        message: t('checkout.errorAuthRequired'),
      });
      setLoading(false);
      return;
    }

    // Standardize phone number for USSD Push (convert 0781... to 255781...)
    const digitsOnly = customerPhone.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 9) {
      setStatus({ type: 'error', message: t('checkout.errorInvalidPhone') });
      setLoading(false);
      return;
    }

    const formattedPhone = digitsOnly.startsWith('0')
      ? `255${digitsOnly.slice(1)}`
      : digitsOnly.startsWith('255')
      ? digitsOnly
      : `255${digitsOnly}`;

    // 2. Format payload to match backend schema requirements
    const payload = {
      customerName,
      customerPhone: formattedPhone,
      deliveryRegion,
      deliveryAddress,
      paymentMethod,
      totalAmount,
      items: cartItems.map((item) => ({
        productId: item.id || item.productId || item._id,
        quantity: Number(item.quantity) || 1,
        unitPrice: parsePrice(item),
      })),
    };

    try {
      // Step A: Create Order Record
      const orderRes = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (orderRes.status === 401 || orderRes.status === 403) {
        localStorage.removeItem('token');
        throw new Error(t('checkout.errorSessionExpiredOrder'));
      }

      const orderText = await orderRes.text();
      const orderResult = orderText ? JSON.parse(orderText) : {};

      if (!orderRes.ok) {
        throw new Error(orderResult.message || t('checkout.errorFailedOrder'));
      }

      const createdOrder = orderResult.data || orderResult;
      const targetOrderId = createdOrder.id || createdOrder.orderId || createdOrder.orderNumber;

      // Step B: Dispatch Mobile Money Payment Prompt
      setStatus({
        type: 'info',
        message: t('checkout.orderCreated'),
      });

      const providerCode = paymentMethod.replace('-MONEY', '').replace('-', '');
      
      try {
        await fetch(`${API_BASE_URL}/payments/initiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: targetOrderId,
            phone: formattedPhone,
            amount: totalAmount,
            provider: providerCode,
          }),
        });
      } catch (payErr) {
        console.warn('Payment dispatch warning:', payErr);
      }

      setStatus({
        type: 'info',
        message: t('checkout.promptSent'),
      });

      // Step C: Listen for Webhook status changes over SSE stream
      subscribeToPaymentUpdates(targetOrderId);
    } catch (error) {
      console.error('Checkout Form Submission Error:', error);
      setStatus({ type: 'error', message: error.message || t('checkout.serverError') });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
      <div>
        <label htmlFor="customerName" className="block text-xs uppercase font-bold text-slate-400 mb-1">
          {t('checkout.fullName')}
        </label>
        <input
          id="customerName"
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          disabled={loading}
          required
          className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 text-xs font-semibold text-white placeholder-slate-500 disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="customerPhone" className="block text-xs uppercase font-bold text-slate-400 mb-1">
          {t('checkout.phoneNumberLabel')}
        </label>
        <input
          id="customerPhone"
          type="tel"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder={t('checkout.phonePlaceholder')}
          disabled={loading}
          required
          className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 text-xs font-semibold text-white placeholder-slate-500 disabled:opacity-50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="deliveryRegion" className="block text-xs uppercase font-bold text-slate-400 mb-1">
            {t('checkout.region')}
          </label>
          <select
            id="deliveryRegion"
            value={deliveryRegion}
            onChange={(e) => setDeliveryRegion(e.target.value)}
            disabled={loading}
            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 text-xs font-semibold text-white disabled:opacity-50"
          >
            {REGIONS.map((region) => (
              <option key={region.id} value={region.id}>
                {t(region.labelKey)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="paymentMethod" className="block text-xs uppercase font-bold text-slate-400 mb-1">
            {t('checkout.paymentGateway')}
          </label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            disabled={loading}
            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 text-xs font-semibold text-white disabled:opacity-50"
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method.id} value={method.id}>
                {t(method.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="deliveryAddress" className="block text-xs uppercase font-bold text-slate-400 mb-1">
          {t('checkout.deliveryAddress')}
        </label>
        <textarea
          id="deliveryAddress"
          rows="2"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          disabled={loading}
          required
          placeholder={t('checkout.deliveryAddressPlaceholder')}
          className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 text-xs font-semibold text-white placeholder-slate-500 disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={loading || cartItems.length === 0}
        className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>{t('checkout.waitingForPin')}</span>
          </>
        ) : (
          <>
            <Lock size={14} />
            <span>{t('checkout.payAmount', { amount: totalAmount.toLocaleString() })}</span>
          </>
        )}
      </button>

      {status.message && (
        <div
          className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
            status.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300'
              : status.type === 'error'
              ? 'bg-rose-950/80 border border-rose-500 text-rose-300'
              : 'bg-blue-950/80 border border-blue-500 text-blue-300'
          }`}
        >
          {status.type === 'success' && <CheckCircle size={16} className="shrink-0 text-emerald-400" />}
          {status.type === 'error' && <AlertCircle size={16} className="shrink-0 text-rose-400" />}
          {status.type === 'info' && <Loader2 size={16} className="shrink-0 text-blue-400 animate-spin" />}
          <span>{status.message}</span>
        </div>
      )}
    </form>
  );
}