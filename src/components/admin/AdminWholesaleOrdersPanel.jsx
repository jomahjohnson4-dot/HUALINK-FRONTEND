import { useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  RefreshCw,
  Search,
  Truck,
  AlertCircle,
  Package,
  Inbox,
} from 'lucide-react';
import { getAdminOrders, updateOrderStatus } from '../../api/orderService';

/** Wholesale lifecycle. Order matters — it drives the progress steps. */
const STATUSES = ['Pending', 'Processing', 'Dispatched', 'Delivered'];

const STATUS_STYLES = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  processing: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  dispatched: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  delivered: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

/**
 * Maps the database status enum onto the lifecycle labels used by the panel.
 */
const DB_STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Dispatched',
  OUT_FOR_DELIVERY: 'Dispatched',
  DELIVERED: 'Delivered',
  PAID: 'Delivered',
  CANCELLED: 'Cancelled',
  FAILED: 'Cancelled',
};

function normalizeStatus(raw) {
  const value = String(raw || 'PENDING').toUpperCase();
  return DB_STATUS_LABELS[value] || 'Pending';
}

/** Counts every unit on the order, whatever shape the payload uses. */
function countItems(raw) {
  if (Array.isArray(raw.items)) {
    return raw.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }
  const direct = Number(raw.quantity ?? raw.itemCount ?? 0);
  return direct > 0 ? direct : 1;
}

function normalizeOrder(raw, index) {
  const total =
    raw.total ??
    raw.totalAmount ??
    raw.amount ??
    Number(raw.price || 0) * Number(raw.quantity || 1);
  return {
    id: raw.id || raw._id || raw.orderId || `ORD-${1000 + index}`,
    clientName: raw.customerName || raw.clientName || raw.name || 'Walk-in client',
    destination:
      raw.region || raw.destination || raw.location || raw.warehouseLocation || 'Dar es Salaam Hub',
    items: countItems(raw),
    total: Number(total) || 0,
    status: normalizeStatus(raw.status),
  };
}

export default function AdminWholesaleOrdersPanel({ onToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await getAdminOrders();
      setOrders(list.map(normalizeOrder));
    } catch (err) {
      console.error('Failed to load wholesale orders:', err);
      setOrders([]);
      setLoadError('Could not reach the order service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /**
   * Persists the new stage to the database. The backend broadcasts the change
   * to every client watching live route tracking, so the buyer's view updates
   * straight away.
   */
  const updateStatus = async (order, status) => {
    setBusyId(order.id);
    try {
      const saved = await updateOrderStatus(order.id, status);
      setOrders((current) =>
        current.map((item) =>
          item.id === order.id ? { ...item, status: normalizeStatus(saved?.status || status) } : item
        )
      );
      onToast?.(`Order ${order.id} marked ${status}.`);
    } catch (err) {
      console.error('Order status update failed:', err);
      onToast?.(
        err?.response?.data?.message || 'Could not update the order status. Please try again.',
        'error'
      );
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(term) ||
        order.clientName.toLowerCase().includes(term) ||
        order.destination.toLowerCase().includes(term)
    );
  }, [orders, search]);

  const summaryStatuses = useMemo(() => {
    const extra = orders.some((order) => order.status === 'Cancelled') ? ['Cancelled'] : [];
    return [...STATUSES, ...extra];
  }, [orders]);

  const counts = useMemo(
    () =>
      summaryStatuses.reduce((acc, status) => {
        acc[status] = orders.filter((order) => order.status === status).length;
        return acc;
      }, {}),
    [orders, summaryStatuses]
  );

  return (
    <div className="space-y-6">
      {/* Status summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryStatuses.map((status) => (
          <div
            key={status}
            className="bg-slate-800/60 border border-slate-700/60 rounded-2xl px-4 py-3"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {status}
            </p>
            <p className="text-xl font-black text-white mt-0.5">{counts[status] || 0}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders by ID, client or destination..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          title="Refresh orders"
          className="flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span className="text-xs font-bold">Refresh</span>
        </button>
      </div>

      {loadError ? (
        <p className="flex items-center gap-2 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5">
          <AlertCircle size={14} />
          {loadError}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
          <Loader2 size={22} className="animate-spin text-orange-500" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading orders...</span>
        </div>
      ) : !filtered.length ? (
        <div className="flex flex-col items-center gap-2 py-16 text-slate-400">
          <Inbox size={26} />
          <p className="text-xs font-bold">No wholesale orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-700/60">
          <table className="w-full min-w-[780px] text-left">
            <thead className="bg-slate-800/80">
              <tr className="text-[10px] uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3 font-bold">Order</th>
                <th className="px-4 py-3 font-bold">Client</th>
                <th className="px-4 py-3 font-bold">Destination</th>
                <th className="px-4 py-3 font-bold">Total</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold text-right">Update</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-slate-700/50 hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-slate-500 shrink-0" />
                      <span className="text-xs font-bold text-white">{order.id}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{order.items} items</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-200 font-semibold">
                    {order.clientName}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Truck size={12} className="text-slate-500" />
                      {order.destination}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-white">
                    TSh {order.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded border ${
                        STATUS_STYLES[order.status.toLowerCase()]
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {STATUSES.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateStatus(order, status)}
                          disabled={busyId === order.id || order.status === status}
                          aria-label={`Mark ${order.id} as ${status}`}
                          title={status}
                          className={`h-7 px-2 rounded-lg border text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-40 ${
                            order.status === status
                              ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                              : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-orange-500 hover:text-white'
                          }`}
                        >
                          {status[0]}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] text-slate-400 font-medium">
        Updating a status feeds the client&apos;s live route tracking link, so the
        buyer sees the same stage you set here.
      </p>
    </div>
  );
}
