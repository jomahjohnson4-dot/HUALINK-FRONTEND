import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  FileText,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import API from '../api/axios';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Reusable API call handler using useCallback
  const fetchOrders = useCallback(async (isMounted = true) => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/orders');
      const orderData = response.data?.data || response.data || [];
      if (isMounted) {
        setOrders(orderData);
        if (orderData.length > 0) {
          setSelectedOrder(orderData[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      if (isMounted) {
        setError(
          err.response?.data?.message || 'Failed to load order history from the server.'
        );
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Call the inner execution to avoid ESLint trigger
    const initFetch = async () => {
      await fetchOrders(isMounted);
    };

    initFetch();

    return () => {
      isMounted = false;
    };
  }, [fetchOrders]);

  // Filter orders dynamically based on search query
  const filteredOrders = orders.filter(
    (order) =>
      String(order.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(order.paymentMethod || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper function to build display steps for tracking status
  const getTimelineSteps = (status = 'PENDING', createdAt) => {
    const isPaid = ['PAID', 'COMPLETED', 'DELIVERED'].includes(status.toUpperCase());
    const isTransit = status.toUpperCase() === 'IN_TRANSIT';

    return [
      {
        title: 'Order Confirmed & Placed',
        time: createdAt ? new Date(createdAt).toLocaleString() : 'N/A',
        completed: true,
      },
      {
        title: 'Dispatched from Central Hub',
        time: isPaid || isTransit ? 'Processed' : 'Pending Verification',
        completed: isPaid || isTransit,
        current: !isPaid && !isTransit,
      },
      {
        title: 'In Transit to Regional Depot',
        time: isPaid ? 'Completed' : 'En Route',
        completed: isPaid,
        current: isTransit,
      },
      {
        title: 'Delivered & Customer Verification',
        time: isPaid ? 'Verified' : 'Pending',
        completed: isPaid,
      },
    ];
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 font-sans text-slate-900">
        <RefreshCw className="animate-spin text-red-600" size={32} />
        <p className="text-xs font-bold text-slate-500">Retrieving regional order history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Package className="text-red-600" size={32} />
              <span>Order Tracking & Distribution</span>
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Track active regional dispatch orders and verify real-time receipts.
            </p>
          </div>

          {/* Search Box & Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Order ID or Payment Method..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-red-600 transition-all shadow-xs"
              />
            </div>
            <button
              onClick={() => fetchOrders(true)}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
              title="Refresh Orders"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Content Section */}
        {orders.length === 0 ? (
          /* Empty Database State */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xl shadow-slate-200/50 max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
              <Package size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900">No Orders Placed Yet</h3>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
              Your regional dispatch profile currently has no purchase records. Browse our depot catalog to place your first order.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-red-600/20"
            >
              <span>Explore Marketplace</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty Search State */
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 max-w-md mx-auto space-y-3">
            <p className="text-sm font-bold text-slate-800">No matching orders found</p>
            <p className="text-xs text-slate-500">Try searching with a different order ID or payment method.</p>
          </div>
        ) : (
          /* Dashboard Layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Orders List */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider px-1">
                Recent Dispatches ({filteredOrders.length})
              </h2>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredOrders.map((order) => {
                  const isActive = selectedOrder?.id === order.id;
                  const status = order.paymentStatus || order.status || 'PENDING';

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
                        isActive
                          ? 'border-red-600 shadow-lg shadow-red-600/10 ring-1 ring-red-600'
                          : 'border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-slate-900 text-sm">#{order.id}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            ['PAID', 'COMPLETED', 'DELIVERED'].includes(status.toUpperCase())
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : 'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="text-xs font-medium text-slate-500 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate">{order.paymentMethod || 'Direct Payment'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-bold text-slate-700">
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          <span className="text-red-600 font-extrabold">
                            {Number(order.totalAmount).toLocaleString()} TZS
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Tracking Details */}
            <div className="lg:col-span-2">
              {selectedOrder && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xl shadow-slate-200/60 space-y-8">
                  
                  {/* Order Overview Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black text-slate-900">Order #{selectedOrder.id}</h2>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 mt-1">
                        Payment Method:{' '}
                        <span className="text-slate-900 font-bold">{selectedOrder.paymentMethod}</span>
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Order Date</div>
                      <div className="text-sm font-black text-slate-900">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Dispatch Timeline */}
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <Truck size={16} className="text-red-600" />
                      <span>Dispatch & Fulfill Progress</span>
                    </h3>

                    <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-100">
                      {getTimelineSteps(
                        selectedOrder.paymentStatus || selectedOrder.status,
                        selectedOrder.createdAt
                      ).map((step, idx) => (
                        <div key={idx} className="relative flex items-start gap-4 pl-8">
                          <div
                            className={`absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              step.completed
                                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {step.completed ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                          </div>

                          <div className="flex-1 flex items-center justify-between">
                            <div>
                              <p className={`text-xs font-extrabold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                                {step.title}
                              </p>
                              <p className="text-[11px] font-semibold text-slate-400">{step.time}</p>
                            </div>
                            {step.current && (
                              <span className="px-2.5 py-0.5 bg-red-50 border border-red-200 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
                                Active Processing
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Itemized Receipt Breakdown */}
                  <div className="border-t border-slate-100 pt-6">
                    <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText size={16} className="text-red-600" />
                      <span>Itemized Dispatch Receipt</span>
                    </h3>
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={item.id || idx} className="flex items-center justify-between text-xs font-semibold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-white border border-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-600">
                              {item.quantity}x
                            </span>
                            <span>Product #{item.productId}</span>
                          </div>
                          <span className="font-extrabold text-slate-900">
                            {Number(item.unitPrice * item.quantity).toLocaleString()} TZS
                          </span>
                        </div>
                      ))}
                      <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-sm font-black text-slate-900">
                        <span>Total Paid</span>
                        <span className="text-red-600">
                          {Number(selectedOrder.totalAmount).toLocaleString()} TZS
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

        {/* Footer Guarantee Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600/20 text-red-500 rounded-2xl flex items-center justify-center border border-red-500/30 shrink-0">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h4 className="text-base font-black tracking-tight">Direct Regional Depot Delivery Guarantee</h4>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                All dispatches are verified at Hualink regional hubs in Dar es Salaam, Mbeya, Arusha, and Mwanza.
              </p>
            </div>
          </div>
          <Link
            to="/services"
            className="shrink-0 px-5 py-3 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
          >
            Regional Depots
          </Link>
        </div>

      </div>
    </div>
  );
}