import React, { useState } from 'react';
import axios from 'axios';
import { Loader2, AlertCircle, X, ShieldCheck } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export const CheckoutModal = ({ cartItems = [], totalAmount = 0, isOpen, onClose, onOrderSuccess }) => {
  const [formData, setFormData] = useState({
    customerName: 'Johnson John',
    customerPhone: '0781359770',
    shippingAddress: 'Mbeya, Tanzania',
    region: 'Dar es Salaam',
    paymentMethod: 'M-PESA',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Safe numeric price parser
  const parsePrice = (item) => {
    const rawPrice = item?.price ?? item?.unitPrice ?? 0;
    const numeric = typeof rawPrice === 'string' ? parseFloat(rawPrice.replace(/[^0-9.]/g, '')) : Number(rawPrice);
    return isNaN(numeric) ? 0 : numeric;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    // 1. Verify Authentication Token
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('Authentication required. Please sign in to place an order.');
      setLoading(false);
      return;
    }

    // Clean phone number
    const cleanPhone = formData.customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid phone number (e.g., 0781359770).');
      setLoading(false);
      return;
    }

    // 2. Format payload matching backend orderController schema
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

      if (onOrderSuccess) {
        onOrderSuccess(createdOrder);
      }
      onClose();
    } catch (error) {
      console.error('Checkout Modal Error:', error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        setErrorMessage('Your session has expired. Please sign in again.');
      } else {
        const msg = error.response?.data?.message || 'Failed to place order. Please try again.';
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-md w-full p-6 border border-slate-800 shadow-2xl relative space-y-4">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-orange-500" />
            <h2 className="text-lg font-bold text-white">Express Checkout</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Checkout Form */}
        <form onSubmit={handleCheckoutSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="customerName"
              required
              value={formData.customerName}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Phone Number (Mobile Money)
            </label>
            <input
              type="tel"
              name="customerPhone"
              required
              placeholder="e.g. 0781359770"
              value={formData.customerPhone}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Destination Region
            </label>
            <select
              name="region"
              value={formData.region}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-orange-500"
            >
              <option value="Dar es Salaam">Dar es Salaam</option>
              <option value="Mbeya">Mbeya</option>
              <option value="Arusha">Arusha</option>
              <option value="Dodoma">Dodoma</option>
              <option value="Mwanza">Mwanza</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Street / Delivery Address
            </label>
            <textarea
              name="shippingAddress"
              required
              rows="2"
              placeholder="Enter building or street location"
              value={formData.shippingAddress}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-orange-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Payment Gateway
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-orange-500"
            >
              <option value="M-PESA">Vodacom M-Pesa</option>
              <option value="AZAM-PAY">AzamPay</option>
              <option value="AIRTEL-MONEY">Airtel Money</option>
              <option value="HALOPESA">HaloPesa</option>
              <option value="MIXX-BY-YAS">Mixx by Yas (Tigo Pesa)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-between items-center font-bold">
            <span className="text-slate-400">Total Amount:</span>
            <span className="text-base text-emerald-400">
              TZS {Number(totalAmount).toLocaleString()}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || cartItems.length === 0}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Place Order</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;