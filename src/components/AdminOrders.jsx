import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const AdminOrders = ({ onSelectBookingForChat }) => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Manual/Re-fetch function (for refresh button and post-update calls)
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load inside useEffect with mounted safety check
  useEffect(() => {
    let isMounted = true;

    const loadInitialOrders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/orders`);
        const data = await res.json();
        if (isMounted) {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialOrders();

    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await fetch(`${API_BASE_URL}/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await fetchOrders();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Table Header Controls */}
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-orange-500 uppercase tracking-wider">
            {t('admin.orders.title')}
          </h2>
          <p className="text-xs text-gray-400">
            {t('admin.orders.subtitle')}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="bg-gray-800 p-2.5 rounded-xl hover:bg-gray-700 text-gray-300 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
          title={t('admin.orders.refreshAria')}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Orders Table Container */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        {loading && orders.length === 0 ? (
          <div className="py-12 text-center text-gray-400 flex flex-col items-center justify-center space-y-3">
            <Loader2 size={24} className="animate-spin text-orange-500" />
            <span className="text-xs font-semibold">Loading booking orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            No service orders or bookings found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-800/60 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="p-4">Client</th>
                  <th className="p-4">Service Required</th>
                  <th className="p-4">Provider</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {orders.map((order) => {
                  const orderId = order._id || order.id;
                  return (
                    <tr key={orderId} className="hover:bg-gray-800/30 transition-colors">
                      <td className="p-4 font-bold">
                        <div className="text-white">{order.clientName || 'N/A'}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{order.clientPhone || 'No contact'}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-white">{order.serviceTitle || 'General Support'}</div>
                        <div className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{order.note || 'No notes provided'}</div>
                      </td>
                      <td className="p-4 text-orange-400 font-bold">{order.provider || 'Unassigned'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                          order.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          order.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {order.status === 'Approved' && <CheckCircle2 size={10} />}
                          {order.status === 'Pending' && <Clock size={10} />}
                          {order.status === 'Cancelled' && <XCircle size={10} />}
                          <span>{order.status || 'Pending'}</span>
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {onSelectBookingForChat && (
                          <button
                            onClick={() =>
                              onSelectBookingForChat({
                                id: orderId,
                                serviceTitle: order.serviceTitle || 'General Support',
                                serviceId: order.serviceId || `service_${orderId}`
                              })
                            }
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-2.5 py-1.5 rounded-lg text-[10px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Open Chat Desk"
                          >
                            <MessageSquare size={12} />
                            <span>Chat</span>
                          </button>
                        )}
                        <button 
                          onClick={() => updateStatus(orderId, 'Approved')}
                          disabled={updatingId === orderId || order.status === 'Approved'}
                          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          {updatingId === orderId ? 'Updating...' : 'Approve & SMS'}
                        </button>
                        <button 
                          onClick={() => updateStatus(orderId, 'Cancelled')}
                          disabled={updatingId === orderId || order.status === 'Cancelled'}
                          className="bg-gray-800 hover:bg-red-600/30 hover:text-red-400 disabled:bg-gray-800 disabled:text-gray-600 text-gray-300 font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;