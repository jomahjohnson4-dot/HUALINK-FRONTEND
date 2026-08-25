import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, AlertCircle, X, ShieldCheck, CheckCircle2, PhoneCall } from 'lucide-react';

const API_BASE_URL = import.meta.env?.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5000/api';

const PAYMENT_PROVIDERS = [
  { id: 'M-PESA', label: 'Vodacom M-Pesa', badge: 'M-PESA', color: 'border-red-500/40 text-red-400' },
  { id: 'AIRTEL-MONEY', label: 'Airtel Money', badge: 'AIRTEL', color: 'border-rose-500/40 text-rose-400' },
  { id: 'HALOPESA', label: 'HaloPesa', badge: 'HALOPESA', color: 'border-orange-500/40 text-orange-400' },
  { id: 'AZAMPAY', label: 'AzamPay Wallet', badge: 'AZAMPAY', color: 'border-sky-500/40 text-sky-400' },
  { id: 'MIXX-BY-YAS', label: 'Mixx by Yas (Tigo)', badge: 'TIGO', color: 'border-blue-500/40 text-blue-400' },
];

export const CheckoutModal = ({ cartItems = [], totalAmount = 0, isOpen, onClose, onOrderSuccess }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    shippingAddress: '',
    region: 'Dar es Salaam',
    paymentMethod: 'M-PESA',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeOrder, setActiveOrder] = useState(null);
  const [paymentState, setPaymentState] = useState('FORM'); // 'FORM' | 'WAITING_PIN' | 'SUCCESS'

  // Standardize target order ID extraction
  const orderIdToStream = activeOrder?.id || activeOrder?.orderId;

  // Real-time SSE listener for payment webhook callbacks
  useEffect(() => {
    if (!orderIdToStream || paymentState !== 'WAITING_PIN') return;

    console.log(`[SSE] Subscribing to stream for order ID: ${orderIdToStream}`);
    const eventSource = new EventSource(`${API_BASE_URL}/orders/payments/stream/${orderIdToStream}`);

    eventSource.onopen = () => {
      console.log(`[SSE Connected] Active listening for payment on order #${orderIdToStream}`);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE Event Payload]:', data);

        if (data.status === 'PAID') {
          setPaymentState('SUCCESS');
          setLoading(false);
          eventSource.close();
          if (onOrderSuccess) onOrderSuccess(activeOrder);
        } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
          setErrorMessage('Payment request was declined or timed out. Please try again.');
          setPaymentState('FORM');
          setLoading(false);
          eventSource.close();
        }
      } catch (err) {
        console.error('[SSE Parse Error]:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('[SSE Connection Error]:', err);
      eventSource.close();
    };

    return () => {
      console.log(`[SSE Cleanup] Closing stream for order #${orderIdToStream}`);
      eventSource.close();
    };
  }, [orderIdToStream, paymentState, activeOrder, onOrderSuccess]);

  if (!isOpen) return null;

  const parsePrice = (item) => {
    const rawPrice = item?.price ?? item?.unitPrice ?? 0;
    const numeric = typeof rawPrice === 'string' ? parseFloat(rawPrice.replace(/[^0-9.]/g, '')) : Number(rawPrice);
    return isNaN(numeric) ? 0 : numeric;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('Authentication required. Please sign in to place an order.');
      setLoading(false);
      return;
    }

    const cleanPhone = formData.customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid phone number (e.g., 0781359770).');
      setLoading(false);
      return;
    }

    const payload = {
      customerName: formData.customerName,
      customerPhone: cleanPhone,
      deliveryRegion: formData.region,
      deliveryAddress: formData.shippingAddress,
      paymentMethod: formData.paymentMethod,
      totalAmount: totalAmount,
      items: cartItems.map((item) => ({
        productId: item.id || item.productId,
        quantity: Number(item.quantity) || 1,
        unitPrice: parsePrice(item),
      })),
    };

    try {
      const orderResponse = await axios.post(`${API_BASE_URL}/orders`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const createdOrder = orderResponse.data?.data || orderResponse.data;
      setActiveOrder(createdOrder);
      setPaymentState('WAITING_PIN');
    } catch (error) {
      console.error('Checkout Modal Error:', error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        setErrorMessage('Your session has expired. Please sign in again.');
      } else {
        const msg = error.response?.data?.message || 'Failed to place order. Please try again.';
        setErrorMessage(msg);
      }
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setPaymentState('FORM');
    setActiveOrder(null);
    setLoading(false);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 transition-all">
      <div className="bg-slate-900 text-slate-100 rounded-t-3xl sm:rounded-2xl max-w-lg md:max-w-xl w-full p-5 sm:p-6 border border-slate-800 shadow-2xl relative max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-orange-500" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">Express Mobile Checkout</h2>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Body Content */}
        <div className="overflow-y-auto py-3 space-y-4 pr-1">

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle size={16} className="shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STATE 1: WAITING FOR USSD PIN */}
          {paymentState === 'WAITING_PIN' && (
            <div className="py-8 text-center space-y-5">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin"></div>
                <PhoneCall size={28} className="text-orange-400 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Check Your Mobile Phone</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  A USSD push prompt was sent to <span className="text-orange-400 font-mono font-bold">{formData.customerPhone}</span>. Please enter your PIN to authorize payment of:
                </p>
                <div className="text-xl font-bold font-mono text-emerald-400 pt-1">
                  TZS {Number(totalAmount).toLocaleString()}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-center gap-3">
                <button
                  onClick={() => setPaymentState('FORM')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition cursor-pointer"
                >
                  Edit Number / Details
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: SUCCESS VIEW */}
          {paymentState === 'SUCCESS' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-3xl">
                <CheckCircle2 size={40} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-emerald-400">Payment Completed!</h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                Order <span className="text-white font-mono font-bold">#{activeOrder?.orderNumber || activeOrder?.id}</span> is paid and currently processing.
              </p>
              <button
                onClick={resetAndClose}
                className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded-xl text-white transition shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                Done & View Order
              </button>
            </div>
          )}

          {/* STATE 3: CHECKOUT FORM */}
          {paymentState === 'FORM' && (
            <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
              
              {/* Responsive Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.customerName}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    Mobile Money Phone
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    required
                    placeholder="e.g. 0781359770"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-medium focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    Destination Region
                  </label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="Dar es Salaam">Dar es Salaam</option>
                    <option value="Mbeya">Mbeya</option>
                    <option value="Arusha">Arusha</option>
                    <option value="Dodoma">Dodoma</option>
                    <option value="Mwanza">Mwanza</option>
                    <option value="Songwe">Songwe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    Payment Gateway Provider
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    {PAYMENT_PROVIDERS.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Street / Delivery Address
                </label>
                <textarea
                  name="shippingAddress"
                  required
                  rows="2"
                  placeholder="Building name, street, or house location"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-orange-500 transition-colors"
                ></textarea>
              </div>

              {/* Total Price Card */}
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex justify-between items-center font-bold">
                <span className="text-slate-400">Total Amount:</span>
                <span className="text-base font-mono text-emerald-400">
                  TZS {Number(totalAmount).toLocaleString()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 shrink-0">
                <button
                  type="button"
                  onClick={resetAndClose}
                  disabled={loading}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || cartItems.length === 0}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2 text-xs shadow-lg shadow-orange-600/20"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Initiating USSD...</span>
                    </>
                  ) : (
                    <span>Pay Now</span>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;