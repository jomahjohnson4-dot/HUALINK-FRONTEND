import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  User,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import API from '../api/axios';

export default function Checkout({ cartItems = [], user, onClearCart }) {
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const [shippingData, setShippingData] = useState({
    fullName: user?.fullName || 'Johnson John',
    phone: user?.phone || '',
    region: user?.region || 'Dar es Salaam',
    address: '',
    paymentMethod: 'M-PESA',
  });

  // Calculate subtotal with price fallbacks
  const subtotal = cartItems.reduce((sum, item) => {
    const rawPrice = item.price ?? item.unitPrice ?? item.basePrice ?? 10000;
    const itemPrice = Number(rawPrice) > 0 ? Number(rawPrice) : 10000;
    const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
    return sum + itemPrice * quantity;
  }, 0);

  const shippingFee = cartItems.length > 0 ? 15000 : 0;
  const grandTotal = subtotal + shippingFee;

  const handleChange = (e) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
  };

  const saveOrderToLocalStorage = (newOrder) => {
    try {
      const existingOrders = JSON.parse(localStorage.getItem('hualink_orders')) || [];
      const updatedOrders = [newOrder, ...existingOrders];
      localStorage.setItem('hualink_orders', JSON.stringify(updatedOrders));
    } catch (err) {
      console.error('Failed to sync order to localStorage:', err);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Format phone to international standard (255XXXXXXXXX)
    const cleanedPhone = shippingData.phone.trim().replace(/\s+/g, '');
    const formattedPhone = cleanedPhone.startsWith('0')
      ? `255${cleanedPhone.slice(1)}`
      : cleanedPhone.replace(/^\+/, '');

    const finalAmount = grandTotal > 0 ? grandTotal : subtotal;
    setConfirmedTotal(finalAmount);

    const formattedItems = cartItems.map((item) => {
      const rawPrice = item.price ?? item.unitPrice ?? item.basePrice ?? 10000;
      const unitPrice = Number(rawPrice) > 0 ? Number(rawPrice) : 10000;
      const qty = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
      return {
        productId: item.id || item._id || item.productId,
        name: item.name || item.title || item.productName || 'Product Item',
        quantity: qty,
        unitPrice: unitPrice,
        price: `${(unitPrice * qty).toLocaleString()} TZS`
      };
    });

    const orderPayload = {
      customerPhone: formattedPhone,
      customerName: shippingData.fullName,
      paymentMethod: shippingData.paymentMethod,
      totalAmount: finalAmount,
      items: formattedItems,
      shippingAddress: shippingData.address,
      region: shippingData.region,
      shippingDetails: {
        fullName: shippingData.fullName,
        region: shippingData.region,
        address: shippingData.address,
      },
    };

    const now = new Date();
    const currentDateStr = now.toLocaleDateString('en-US');
    const currentFullDateStr = now.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    let displayOrderNumber = `HL-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // API Attempt
      const orderResponse = await API.post('/orders', orderPayload);
      const responseBody = orderResponse.data;
      const resultData = responseBody?.data;

      const createdOrderId = resultData?.id || resultData?._id;
      if (resultData?.orderNumber || createdOrderId) {
        displayOrderNumber = resultData?.orderNumber || createdOrderId;
      }

      if (responseBody?.paymentWarning) {
        setErrorMsg(`Order was placed successfully, but the USSD prompt failed to send: ${responseBody.paymentWarning}`);
      }

    } catch (err) {
      console.error('Checkout API error, storing locally as fallback:', err);
      const backendMessage =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        err.message ||
        'Server connection failed. Order created locally.';
       
      setErrorMsg(backendMessage);
    } finally {
      // Construct standardized local order object
      const localOrderObj = {
        id: displayOrderNumber,
        location: shippingData.region,
        paymentMethod: shippingData.paymentMethod.replace('-MONEY', '').replace('-PAY', ''),
        date: currentDateStr,
        fullDate: currentFullDateStr,
        status: 'PENDING',
        step: 1,
        amount: `${finalAmount.toLocaleString()} TZS`,
        items: formattedItems.length > 0 ? formattedItems : [
          { name: 'Bulk Order Item', quantity: 1, price: `${finalAmount.toLocaleString()} TZS` },
          { name: 'Standard Delivery Fee', quantity: 1, price: '15,000 TZS' }
        ]
      };

      // Save order to LocalStorage so /orders syncs instantly
      saveOrderToLocalStorage(localOrderObj);

      setOrderId(displayOrderNumber);
      setOrderComplete(true);
      if (onClearCart) onClearCart();
      setLoading(false);
    }
  };

  // Order Confirmation Screen
  if (orderComplete) {
    return (
      <div className="bg-slate-50 min-h-[80vh] flex items-center justify-center py-12 px-6 font-sans">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/80 p-8 md:p-10 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 block">
              Order Placed Successfully
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Thank You for Your Order!
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Reference Number: <span className="font-extrabold text-slate-900">{orderId}</span>
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-start gap-2 text-left">
              <AlertCircle size={16} className="shrink-0 text-amber-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left space-y-2 text-xs">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Delivery To:</span>
              <span className="font-bold text-slate-900">{shippingData.fullName}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Destination Region:</span>
              <span className="font-bold text-slate-900">{shippingData.region}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Payment Option:</span>
              <span className="font-bold text-slate-900">{shippingData.paymentMethod}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-700 border-t border-slate-200 pt-2">
              <span>Total Amount:</span>
              <span className="font-black text-red-600">{Number(confirmedTotal).toLocaleString()} TZS</span>
            </div>
          </div>

          {!errorMsg && (
            <p className="text-[11px] text-slate-500">
              A payment push request has been dispatched to <strong className="text-slate-800">{shippingData.phone}</strong>. Please complete the USSD popup on your phone.
            </p>
          )}

          <div className="pt-2 space-y-3">
            <Link
              to="/orders"
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all"
            >
              <span>View Order Status</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/shop"
              className="block text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty Cart View
  if (cartItems.length === 0 && !orderComplete) {
    return (
      <div className="bg-slate-50 min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-6 text-center font-sans">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-400">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm">
          Add items from our inventory catalog before proceeding to checkout.
        </p>
        <Link
          to="/shop"
          className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all"
        >
          <ArrowLeft size={16} />
          <span>Return to Marketplace</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Shopping</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
            <ShieldCheck size={16} className="text-red-600" />
            <span>Secure Direct Checkout</span>
          </div>
        </div>

        {errorMsg && !orderComplete && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Shipping Form Details */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <Truck size={20} className="text-red-600" />
                <h2 className="text-base font-black text-slate-900">1. Delivery & Contact Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 text-slate-400" size={18} />
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={shippingData.fullName}
                      onChange={handleChange}
                      placeholder="Johnson John"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-red-600 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                    Phone Number (M-Pesa / Mobile)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 text-slate-400" size={18} />
                    <input
                      type="tel"
                      name="phone"
                      required
                      pattern="^[0-9+]{10,13}$"
                      value={shippingData.phone}
                      onChange={handleChange}
                      placeholder="0781359770"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-red-600 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                    Destination Region
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 text-slate-400" size={18} />
                    <select
                      name="region"
                      value={shippingData.region}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-red-600 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="Dar es Salaam">Dar es Salaam</option>
                      <option value="Mbeya">Mbeya</option>
                      <option value="Arusha">Arusha</option>
                      <option value="Mwanza">Mwanza</option>
                      <option value="Dodoma">Dodoma</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                    Street Address / Landmark
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={shippingData.address}
                    onChange={handleChange}
                    placeholder="Building, Street, Office"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-red-600 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <CreditCard size={20} className="text-red-600" />
                <h2 className="text-base font-black text-slate-900">2. Select Payment Provider</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`border p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  shippingData.paymentMethod === 'M-PESA' ? 'border-red-600 bg-red-50/40 text-red-600' : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="M-PESA"
                    checked={shippingData.paymentMethod === 'M-PESA'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-xs font-extrabold text-slate-900">Vodacom M-Pesa</span>
                  <span className="text-[10px] text-slate-500 font-medium">USSD Push</span>
                </label>

                <label className={`border p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  shippingData.paymentMethod === 'AZAM-PAY' ? 'border-red-600 bg-red-50/40 text-red-600' : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="AZAM-PAY"
                    checked={shippingData.paymentMethod === 'AZAM-PAY'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-xs font-extrabold text-slate-900">AzamPay</span>
                  <span className="text-[10px] text-slate-500 font-medium">Digital Gateway</span>
                </label>

                <label className={`border p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  shippingData.paymentMethod === 'AIRTEL-MONEY' ? 'border-red-600 bg-red-50/40 text-red-600' : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="AIRTEL-MONEY"
                    checked={shippingData.paymentMethod === 'AIRTEL-MONEY'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-xs font-extrabold text-slate-900">Airtel Money</span>
                  <span className="text-[10px] text-slate-500 font-medium">USSD Push</span>
                </label>
              </div>
            </div>

          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 sticky top-28">
              <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-4">
                Order Summary ({cartItems.length} items)
              </h2>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const itemPrice = Number(item.price ?? item.unitPrice ?? item.basePrice ?? 10000) || 10000;
                  const itemQty = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
                  const itemTitle = item.name || item.title || item.productName || 'Product Item';

                  return (
                    <div key={item.id || item.productId || item._id} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img src={item.image} alt={itemTitle} className="w-12 h-12 rounded-xl object-cover bg-slate-100" />
                        )}
                        <div>
                          <h4 className="font-bold text-slate-900 line-clamp-1">{itemTitle}</h4>
                          <span className="text-slate-500 text-[11px]">Qty: {itemQty}</span>
                        </div>
                      </div>
                      <span className="font-black text-slate-900 shrink-0">
                        {Number(itemPrice * itemQty).toLocaleString()} TZS
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">{Number(subtotal).toLocaleString()} TZS</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Regional Shipping Fee</span>
                  <span className="font-bold text-slate-900">{Number(shippingFee).toLocaleString()} TZS</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-black text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-red-600">{Number(grandTotal).toLocaleString()} TZS</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all cursor-pointer"
              >
                <span>{loading ? 'Sending Request...' : 'Confirm & Place Order'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}