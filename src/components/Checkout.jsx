import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, CheckCircle, AlertCircle, Loader2, Lock } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Checkout({ cartItems = [], clearCart }) {
  const navigate = useNavigate();

  // User details state (Initializes from saved session data)
  const [fullName, setFullName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [region, setRegion] = useState('Dar es Salaam');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('M-PESA');

  // Order processing & SSE states
  const [loading, setLoading] = useState(false);
  const [orderState, setOrderState] = useState({ id: null, status: 'IDLE' });
  const [status, setStatus] = useState({ type: '', message: '' });

  const eventSourceRef = useRef(null);

  // Load user profile details on mount or auth change
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUserStr = localStorage.getItem('user');

    if (!token) {
      setStatus({
        type: 'error',
        message: 'No active session found. Please sign in to complete your checkout.',
      });
      return;
    }

    if (savedUserStr) {
      try {
        const user = JSON.parse(savedUserStr);
        if (user.fullName) setFullName(user.fullName);
        if (user.phone) setCustomerPhone(user.phone);
        if (user.region) setRegion(user.region);
        if (user.address) setAddress(user.address);
      } catch (err) {
        console.error('Error parsing stored user session:', err);
      }
    }
  }, []);

  // Safe numeric parser to avoid NaN issues
  const parsePrice = (item) => {
    const rawPrice = item?.price ?? item?.unitPrice ?? 0;
    const numeric = typeof rawPrice === 'string' ? parseFloat(rawPrice.replace(/[^0-9.]/g, '')) : Number(rawPrice);
    return isNaN(numeric) ? 0 : numeric;
  };

  // Pricing calculations
  const shippingFee = cartItems.length > 0 ? 15000 : 0;
  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = parsePrice(item);
    const itemQty = Number(item.quantity) || 1;
    return sum + itemPrice * itemQty;
  }, 0);
  const grandTotal = subtotal + shippingFee;

  // Cleanup SSE connection on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Listen for real-time payment SSE events from backend webhook
  const subscribeToPaymentUpdates = (orderId) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const sseUrl = `${API_BASE_URL}/payments/stream/${orderId}`;
    eventSourceRef.current = new EventSource(sseUrl);

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (['COMPLETED', 'PAID'].includes(data.status)) {
          setOrderState({ id: orderId, status: 'SUCCESS' });
          setStatus({
            type: 'success',
            message: 'Payment received successfully! Your order has been placed.',
          });
          setLoading(false);
          if (clearCart) clearCart();
          eventSourceRef.current.close();
        } else if (['FAILED', 'CANCELLED'].includes(data.status)) {
          setOrderState({ id: orderId, status: 'FAILED' });
          setStatus({
            type: 'error',
            message: 'Payment transaction was declined or timed out. Please try again.',
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
      eventSourceRef.current.close();
    };
  };

  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();

    // 1. Verify Authentication Token
    const token = localStorage.getItem('token');
    if (!token) {
      setStatus({
        type: 'error',
        message: 'You must be logged in to place an order. Redirecting to login page...',
      });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });
    setOrderState({ id: null, status: 'PROCESSING' });

    // Clean phone number input
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setStatus({ type: 'error', message: 'Enter a valid phone number (e.g., 0781359770)' });
      setLoading(false);
      setOrderState({ id: null, status: 'IDLE' });
      return;
    }

    const payload = {
      customerName: fullName,
      customerPhone: cleanPhone,
      deliveryRegion: region,
      deliveryAddress: address,
      paymentMethod,
      totalAmount: grandTotal,
      items: cartItems.map((item) => ({
        productId: item.id || item.productId,
        quantity: Number(item.quantity) || 1,
        unitPrice: parsePrice(item),
      })),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token'); // Clear invalid or expired token
        localStorage.removeItem('user');
        throw new Error('Your session has expired. Redirecting to login...');
      }

      if (!response.ok) {
        throw new Error(result.message || 'Failed to place order.');
      }

      const createdOrderId = result.data?.id || result.data?.orderId;

      setStatus({
        type: 'info',
        message: `Order #${result.data?.orderNumber || createdOrderId} created! Please check your phone (${cleanPhone}) and enter your PIN to authorize payment...`,
      });

      // Subscribe to real-time SSE payment updates
      subscribeToPaymentUpdates(createdOrderId);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
      setLoading(false);
      setOrderState({ id: null, status: 'IDLE' });
      if (error.message.includes('session has expired') || error.message.includes('Redirecting to login')) {
        setTimeout(() => navigate('/login'), 1500);
      }
    }
  };

  const paymentProviders = [
    { id: 'M-PESA', label: 'Vodacom M-Pesa', sub: 'USSD Push' },
    { id: 'AZAM-PAY', label: 'AzamPay', sub: 'Digital Gateway' },
    { id: 'AIRTEL-MONEY', label: 'Airtel Money', sub: 'USSD Push' },
    { id: 'HALOPESA', label: 'HaloPesa', sub: 'USSD Push' },
    { id: 'MIXX-BY-YAS', label: 'Mixx by Yas', sub: 'Tigo Pesa Gateway' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <Link to="/shop" className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-red-600 transition-colors">
            <ArrowLeft size={16} />
            <span>Back to Shopping</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <ShieldCheck size={16} />
            <span>Secure Direct Checkout</span>
          </div>
        </div>

        {/* Dynamic Alert Bar */}
        {status.message && (
          <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
            status.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : status.type === 'error' 
              ? 'bg-rose-50 text-rose-700 border-rose-200' 
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            <div className="flex items-center gap-3">
              {status.type === 'success' && <CheckCircle size={18} className="shrink-0 text-emerald-600" />}
              {status.type === 'error' && <AlertCircle size={18} className="shrink-0 text-rose-600" />}
              {status.type === 'info' && <Loader2 size={18} className="shrink-0 text-blue-600 animate-spin" />}
              <span>{status.message}</span>
            </div>
            {!localStorage.getItem('token') && (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-3 py-1 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-red-700 shrink-0 ml-2 cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form Area */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Delivery Details */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs flex items-center justify-center font-bold">1</span>
                <span>Delivery & Contact Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    required
                    placeholder="John Doe"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Phone Number (Mobile Money)</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    disabled={loading}
                    required
                    placeholder="0700000000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Destination Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-600 cursor-pointer"
                  >
                    <option value="Dar es Salaam">Dar es Salaam</option>
                    <option value="Mbeya">Mbeya</option>
                    <option value="Arusha">Arusha</option>
                    <option value="Mwanza">Mwanza</option>
                    <option value="Dodoma">Dodoma</option>
                    <option value="Tanga">Tanga</option>
                    <option value="Morogoro">Morogoro</option>
                    <option value="Zanzibar">Zanzibar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Street Address / Landmark</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                    required
                    placeholder="e.g. Mbeya, Tanzania"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs flex items-center justify-center font-bold">2</span>
                <span>Select Payment Provider</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {paymentProviders.map((provider) => {
                  const isSelected = paymentMethod === provider.id;
                  return (
                    <button
                      type="button"
                      key={provider.id}
                      onClick={() => setPaymentMethod(provider.id)}
                      disabled={loading}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-red-600 bg-red-50/50 ring-2 ring-red-600/20'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                      }`}
                    >
                      <p className="text-xs font-black text-slate-900">{provider.label}</p>
                      <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{provider.sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-black text-slate-900">
              Order Summary ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
            </h3>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {cartItems.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Your cart is empty.</p>
              ) : (
                cartItems.map((item) => {
                  const itemPrice = parsePrice(item);
                  const itemQty = Number(item.quantity) || 1;
                  return (
                    <div key={item.id || item.productId} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-900 truncate max-w-[200px]">{item.name || 'Cart Item'}</p>
                        <p className="text-slate-500 text-[10px]">Qty: {itemQty}</p>
                      </div>
                      <p className="font-black text-slate-900">{(itemPrice * itemQty).toLocaleString()} TZS</p>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">{subtotal.toLocaleString()} TZS</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Regional Shipping Fee</span>
                <span className="font-bold text-slate-800">{shippingFee.toLocaleString()} TZS</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-black text-slate-900">
                <span>Grand Total</span>
                <span className="text-red-600">{grandTotal.toLocaleString()} TZS</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || cartItems.length === 0}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Waiting for Phone PIN...</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>Confirm & Place Order →</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}