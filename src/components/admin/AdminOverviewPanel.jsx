import { useEffect, useMemo, useState } from 'react';
import {
  Package,
  ShoppingBag,
  Warehouse,
  TrendingUp,
  Loader2,
  AlertCircle,
  MessageSquare,
  Inbox,
  CheckCheck,
  CircleCheck,
} from 'lucide-react';
import { getProducts } from '../../api/productService';
import { getAdminOrders } from '../../api/orderService';
import { getInquiries, updateInquiryStatus } from '../../api/inquiryService';
import AdminActivityStream from './AdminActivityStream';

const HUBS = ['Mbeya Hub', 'Dar es Salaam Hub'];

const INQUIRY_STATUS_STYLES = {
  NEW: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  REPLIED: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  RESOLVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

export default function AdminOverviewPanel() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        // Orders and live inquiries power the dashboard cards.
        const [orderList, productData, inquiryData] = await Promise.all([
          getAdminOrders(),
          getProducts({ includeUnavailable: true, limit: 200 }).catch(() => ({ products: [] })),
          getInquiries().catch(() => ({ inquiries: [] })),
        ]);

        if (isMounted) {
          setOrders(Array.isArray(orderList) ? orderList : []);
          setProducts(productData.products || []);
          setInquiries(inquiryData.inquiries || []);
          setUsingFallback(!orderList?.length);
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
    if (!orders.length) {
      return { orderCount: 0, revenue: 0 };
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
    const groups = products.reduce((acc, product) => {
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
  }, [products]);

  const openInquiryCount = useMemo(
    () => inquiries.filter((inquiry) => inquiry.status === 'NEW').length,
    [inquiries]
  );

  /**
   * Moves an inquiry through its lifecycle and refreshes the row from the
   * server response so the feed always mirrors the database.
   */
  const markInquiry = async (inquiry, status) => {
    setBusyId(inquiry.id);
    try {
      const saved = await updateInquiryStatus(inquiry.id, status);
      setInquiries((current) =>
        current.map((item) =>
          item.id === inquiry.id ? { ...item, ...(saved || { status }) } : item
        )
      );
    } catch (err) {
      console.error('Inquiry status update failed:', err);
    } finally {
      setBusyId(null);
    }
  };

  const metrics = [
    {
      label: 'Total Products',
      value: products.length.toLocaleString(),
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
      label: 'Open Inquiries',
      value: openInquiryCount.toLocaleString(),
      Icon: MessageSquare,
      accent: 'text-amber-400',
      badge: 'bg-amber-500/10 border-amber-500/30',
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
            : 'No live orders returned by the server yet.'}
        </p>
      ) : null}

      {/* Live system activity — every inquiry, catalogue change and status update */}
      <AdminActivityStream />

      {/* Live client inquiries feed */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <MessageSquare size={16} className="text-orange-500" />
              Incoming Client Inquiries
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {inquiries.length} live message{inquiries.length === 1 ? '' : 's'} from the in-app chat
            </p>
          </div>
          {loading ? <Loader2 size={16} className="animate-spin text-orange-500" /> : null}
        </div>

        {!inquiries.length ? (
          <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
            <Inbox size={24} />
            <p className="text-xs font-bold">No client inquiries yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="bg-slate-900/50 border border-slate-700/60 rounded-xl px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-white">{inquiry.customerName}</p>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {inquiry.customerContact}
                      </span>
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${
                          INQUIRY_STATUS_STYLES[inquiry.status] || INQUIRY_STATUS_STYLES.NEW
                        }`}
                      >
                        {inquiry.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-orange-400 font-bold mt-1">
                      {inquiry.productOrService}
                    </p>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      {inquiry.message}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {new Date(inquiry.timestamp || inquiry.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => markInquiry(inquiry, 'Replied')}
                      disabled={busyId === inquiry.id || inquiry.status === 'REPLIED'}
                      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:border-blue-500 hover:text-white text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <MessageSquare size={11} />
                      <span>Replied</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => markInquiry(inquiry, 'Resolved')}
                      disabled={busyId === inquiry.id || inquiry.status === 'RESOLVED'}
                      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:border-emerald-500 hover:text-white text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <CheckCheck size={11} />
                      <span>Resolve</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category distribution chart */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-extrabold text-white">Product Distribution by Category</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {products.length} catalog items across {distribution.length} categories
            </p>
          </div>
          {loading ? <Loader2 size={16} className="animate-spin text-orange-500" /> : null}
        </div>

        {distribution.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
            <CircleCheck size={24} />
            <p className="text-xs font-bold">No products in the catalog yet.</p>
          </div>
        ) : (
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
        )}
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
