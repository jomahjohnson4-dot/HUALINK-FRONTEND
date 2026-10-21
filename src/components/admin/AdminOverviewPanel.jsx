import { useEffect, useMemo, useState } from 'react';
import {
  Package,
  ShoppingBag,
  Warehouse,
  TrendingUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { productsCatalog } from '../../data/productsCatalog';
import API from '../../api/axios';

const HUBS = ['Mbeya Hub', 'Dar es Salaam Hub'];

export default function AdminOverviewPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const response = await API.get('/admin/orders');
        const data = response.data?.orders || response.data?.data || response.data;
        const list = Array.isArray(data) ? data : [];
        if (isMounted) {
          setOrders(list);
          setUsingFallback(list.length === 0);
        }
      } catch {
        if (isMounted) setUsingFallback(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  /** Order count and revenue are derived from the fetched orders. */
  const { orderCount, revenue } = useMemo(() => {
    // Without live orders, estimate from catalogue pricing so the cards are not
    // misleadingly empty during development.
    if (!orders.length) {
      const estimate = productsCatalog.reduce((sum, product) => {
        const price = Number(String(product.price ?? '').replace(/[^0-9]/g, '')) || 0;
        return sum + price * 10;
      }, 0);
      return { orderCount: 0, revenue: estimate };
    }

    return orders.reduce(
      (acc, order) => {
        const total =
          Number(order.total ?? order.totalAmount ?? order.amount ?? 0) || 0;
        return { orderCount: acc.orderCount + 1, revenue: acc.revenue + total };
      },
      { orderCount: 0, revenue: 0 }
    );
  }, [orders]);

  /** Product distribution across categories, for the bar visualiser. */
  const distribution = useMemo(() => {
    const groups = productsCatalog.reduce((acc, product) => {
      const key = product.category || 'Uncategorised';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const max = Math.max(1, ...Object.values(groups));
    return Object.entries(groups)
      .map(([category, count]) => ({
        category,
        count,
        percent: Math.round((count / max) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const metrics = [
    {
      label: 'Total Products',
      value: productsCatalog.length.toLocaleString(),
      Icon: Package,
      accent: 'text-blue-400',
      badge: 'bg-blue-500/10 border-blue-500/30',
    },
    {
      label: 'Total Wholesale Orders',
      value: orderCount.toLocaleString(),
      Icon: ShoppingBag,
      accent: 'text-orange-400',
      badge: 'bg-orange-500/10 border-orange-500/30',
    },
    {
      label: 'Active Stock Hubs',
      value: String(HUBS.length),
      Icon: Warehouse,
      accent: 'text-indigo-400',
      badge: 'bg-indigo-500/10 border-indigo-500/30',
    },
    {
      label: 'Estimated Revenue',
      value: `TSh ${revenue.toLocaleString()}`,
      Icon: TrendingUp,
      accent: 'text-emerald-400',
      badge: 'bg-emerald-500/10 border-emerald-500/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ label, value, Icon, accent, badge }) => (
          <div
            key={label}
            className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 hover:border-slate-600 hover:-translate-y-0.5 transition-all duration-300"
          >
            <span
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${badge} ${accent} mb-3`}
            >
              <Icon size={18} strokeWidth={2.2} />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {label}
            </p>
            <p className="text-xl font-black text-white mt-1 break-words">{value}</p>
          </div>
        ))}
      </div>

      {usingFallback ? (
        <p className="flex items-center gap-2 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5">
          <AlertCircle size={14} />
          {loading
            ? 'Loading order data...'
            : 'Revenue is estimated from catalogue pricing — no live orders returned by the server.'}
        </p>
      ) : null}

      {/* Category distribution chart */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-extrabold text-white">Product Distribution by Category</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {productsCatalog.length} catalog items across {distribution.length} categories
            </p>
          </div>
          {loading ? <Loader2 size={16} className="animate-spin text-orange-500" /> : null}
        </div>

        <div className="space-y-4">
          {distribution.map(({ category, count, percent }) => (
            <div key={category}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-200">{category}</span>
                <span className="text-[11px] font-bold text-slate-400">
                  {count} {count === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-900/70 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stock hubs */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 sm:p-6">
        <h3 className="text-sm font-extrabold text-white mb-4">Active Stock Hubs</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {HUBS.map((hub) => (
            <div
              key={hub}
              className="flex items-center gap-3 bg-slate-900/50 border border-slate-700/60 rounded-xl px-4 py-3"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_2px] shadow-emerald-400/50" />
              <div>
                <p className="text-xs font-bold text-white">{hub}</p>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Operational
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
