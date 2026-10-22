import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  FileText,
  Gauge,
  MapPin,
  Package,
  Radio,
  RefreshCw,
  Route as RouteIcon,
  Truck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DeliveryMap from '../components/DeliveryMap';
import OrderStatusTimeline from '../components/OrderStatusTimeline';
import { getMyOrders, getOrderById, subscribeToOrderStatus } from '../api/orderService';
import {
  placeLabelKey,
  resolveRouteForOrder,
  routeDistance,
  stageLabelKey,
  statusProgress,
  statusTone,
} from '../data/deliveryRoutes';
import { relativeTime } from '../utils/time';

/** The average road speed of a loaded Hualink truck, in km/h. */
const AVERAGE_SPEED_KMH = 65;

/**
 * Flattens a database order row into the shape the tracking page renders.
 */
const normaliseOrder = (raw) => {
  const createdAt = raw?.createdAt ? new Date(raw.createdAt) : new Date();
  const total = Number(raw?.totalAmount ?? raw?.total ?? 0) || 0;

  return {
    id: raw?.id,
    orderNumber: raw?.orderNumber || raw?.id || '—',
    status: String(raw?.status || 'PENDING').toUpperCase(),
    paymentStatus: raw?.paymentStatus || 'PENDING',
    paymentMethod: raw?.paymentMethod || 'M-PESA',
    region: raw?.region || 'Dar es Salaam',
    shippingAddress: raw?.shippingAddress || 'Default Address',
    customerName: raw?.customerName || '—',
    customerPhone: raw?.customerPhone || '—',
    createdAt: raw?.createdAt || createdAt.toISOString(),
    date: createdAt.toLocaleDateString(),
    fullDate: createdAt.toLocaleString(),
    amount: `${total.toLocaleString()} TZS`,
    totalAmount: total,
    items: (raw?.items || []).map((item) => ({
      id: item.id || item.productId,
      quantity: item.quantity || 1,
      name: item.product?.name || item.name || 'Product',
      sku: item.product?.sku || '',
      price: `${Number(item.unitPrice ?? item.price ?? 0).toLocaleString()} TZS`,
    })),
  };
};

/**
 * The dedicated live order tracking page.
 *
 * Desktop shows a split view — the dispatch timeline on the left and the
 * interactive Mapbox corridor on the right. On mobile the map stacks above
 * the timeline and the itemised receipt.
 */
export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [lastSync, setLastSync] = useState(null);

  /**
   * Fetches the order being tracked — either the one named in the URL, or the
   * most recent active shipment when the page is opened without an id.
   *
   * The result is returned rather than written to state so the same fetch can
   * be reused by the manual refresh button.
   */
  const fetchOrder = useCallback(async () => {
    try {
      if (id) {
        const raw = await getOrderById(id);
        return { order: normaliseOrder(raw), error: null };
      }

      const list = await getMyOrders();
      const normalised = (list || []).map(normaliseOrder);
      const active =
        normalised.find(
          (orderItem) =>
            !['DELIVERED', 'PAID', 'CANCELLED', 'FAILED'].includes(
              orderItem.status
            )
        ) || normalised[0] || null;

      return {
        order: active,
        error: active ? null : t('tracking.noOrdersToTrack'),
      };
    } catch (err) {
      console.error('Failed to load the order for tracking:', err);
      return {
        order: null,
        error:
          err?.response?.status === 403
            ? t('tracking.accessDenied')
            : err?.response?.status === 404
              ? t('tracking.notFound')
              : t('tracking.unavailable'),
      };
    }
  }, [id, t]);

  /* Loads the tracked order and reloads it whenever the tracked id changes. */
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const result = await fetchOrder();
      if (cancelled) return;

      setOrder(result.order);
      setError(result.error);
      setLoading(false);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [fetchOrder]);

  /** Manual refresh — re-runs the same fetch used on mount. */
  const handleRefresh = async () => {
    setRefreshing(true);

    const result = await fetchOrder();
    setOrder(result.order);
    setError(result.error);
    setLoading(false);
    setRefreshing(false);
  };

  /**
   * Live status sync — the server pushes a new payload every time an admin
   * moves the order to a different stage, so the map marker and the timeline
   * move without a manual refresh.
   */
  useEffect(() => {
    const orderId = order?.id;
    if (!orderId) return undefined;

    const unsubscribe = subscribeToOrderStatus(orderId, (payload) => {
      if (!payload?.status) return;

      const nextStatus = String(payload.status).toUpperCase();

      setOrder((current) =>
        current ? { ...current, status: nextStatus } : current
      );

      setEvents((current) =>
        [
          {
            id: `${Date.now()}-${nextStatus}`,
            status: nextStatus,
            at: payload.updatedAt || new Date().toISOString(),
          },
          ...current,
        ].slice(0, 6)
      );

      setLastSync(new Date().toISOString());
    });

    return unsubscribe;
  }, [order?.id]);

  const route = useMemo(() => resolveRouteForOrder(order || {}), [order]);

  /** The localized name of a hub, a stop or a region. */
  const placeLabel = useCallback(
    (value) => {
      const placeKey = placeLabelKey(value);
      return placeKey ? t(placeKey) : value;
    },
    [t]
  );

  const distanceKm = useMemo(() => Math.round(routeDistance(route.waypoints)), [
    route,
  ]);

  /**
   * A rough delivery estimate based on the share of the corridor still to
   * cover at the average road speed.
   */
  const eta = useMemo(() => {
    const key = String(order?.status || 'PENDING').toUpperCase();
    if (['DELIVERED', 'PAID'].includes(key)) return t('tracking.delivered');
    if (['CANCELLED', 'FAILED'].includes(key)) return t('tracking.cancelled');

    const progress = Math.min(Math.max(statusProgress(key), 0), 1);
    const remaining = distanceKm * (1 - progress);
    const hours = Math.max(Math.round(remaining / AVERAGE_SPEED_KMH), 1);

    return t('tracking.hoursRemaining', { count: hours });
  }, [order?.status, distanceKm, t]);

  const routeLabel = route.labelKey ? t(route.labelKey) : route.label;

  /** Localizes a status label. */
  const getStatusLabel = useCallback(
    (status) => {
      const key = stageLabelKey(String(status || '').toUpperCase());
      return key ? t(key) : String(status || '').replace(/_/g, ' ');
    },
    [t]
  );

  const stageLabelFor = getStatusLabel;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans text-slate-900 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="mt-0.5 p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-red-600 hover:border-red-200 shadow-sm transition-colors cursor-pointer"
            aria-label={t('tracking.backToOrdersAria')}
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-bold">
                <Truck size={18} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {t('tracking.title')}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('tracking.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {order ? (
            <span
              className={`px-3 py-1.5 border rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                statusTone(order.status)
              }`}
            >
              {getStatusLabel(order.status)}
            </span>
          ) : null}

          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-red-600 shadow-sm transition-colors cursor-pointer"
            aria-label={t('tracking.refreshAria')}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">
          <AlertCircle size={14} />
          {error}
        </div>
      ) : null}

      {loading && !order ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <RefreshCw size={32} className="mx-auto animate-spin text-red-500" />
          <p className="text-xs font-bold text-slate-500">
            {t('tracking.loadingRoute')}
          </p>
        </div>
      ) : !order ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <Package size={48} className="mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">
            {t('tracking.nothingToTrack')}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t('tracking.nothingToTrackHint')}
          </p>
          <Link
            to="/orders"
            className="inline-block mt-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors"
          >
            {t('tracking.viewMyOrders')}
          </Link>
        </div>
      ) : (
        <>
          {/* Shipment summary strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <SummaryTile
              icon={Package}
              label={t('tracking.orderNumber')}
              value={order.orderNumber}
            />
            <SummaryTile
              icon={RouteIcon}
              label={t('tracking.corridor')}
              value={routeLabel}
            />
            <SummaryTile
              icon={Gauge}
              label={t('tracking.distance')}
              value={`${distanceKm} km`}
            />
            <SummaryTile
              icon={Truck}
              label={t('tracking.estimatedArrival')}
              value={eta}
            />
          </div>

          {/* Split view — timeline on the left, the live map on the right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Map — stacks above the timeline on mobile */}
            <div className="order-1 lg:order-2 lg:col-span-2 space-y-4">
              <DeliveryMap order={order} route={route} height="480px" />

              {/* Itemised receipt */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  <FileText size={16} className="text-red-500" />
                  <span>{t('tracking.itemizedReceipt')}</span>
                </div>

                <div className="space-y-2 bg-slate-50/70 rounded-2xl p-4 border border-slate-100">
                  {order.items.length > 0 ? (
                    order.items.map((item) => (
                      <div
                        key={item.id || item.name}
                        className="flex justify-between items-center text-xs gap-4"
                      >
                        <span className="text-slate-700 font-medium">
                          <span className="font-bold text-slate-900">
                            {item.quantity}x
                          </span>{' '}
                          {item.name}
                        </span>
                        <span className="font-bold text-slate-900 whitespace-nowrap">
                          {item.price}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500">
                      {t('tracking.receiptAvailable')}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs font-black text-red-600 border-t border-slate-200 pt-3 mt-2">
                    <span>{t('tracking.totalPaidAmount')}</span>
                    <span>{order.amount}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider">
                      {t('tracking.deliveringTo')}
                    </span>
                    <p className="font-bold text-slate-800 mt-1">
                      {placeLabel(order.shippingAddress)}
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      {placeLabel(order.region)}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider">
                      {t('tracking.payment')}
                    </span>
                    <p className="font-bold text-slate-800 mt-1">
                      {order.paymentMethod}
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      {order.paymentStatus}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider">
                      {t('tracking.dispatchedOn')}
                    </span>
                    <p className="font-bold text-slate-800 mt-1">
                      {order.fullDate}
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      {relativeTime(order.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline + live feed */}
            <div className="order-2 lg:order-1 lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-8">
              <OrderStatusTimeline
                status={order.status}
                orderDate={order.fullDate}
                route={route}
              />

              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  <Radio
                    size={16}
                    className={
                      lastSync ? 'text-emerald-500 animate-pulse' : 'text-slate-300'
                    }
                  />
                  <span>{t('tracking.liveStatusFeed')}</span>
                </div>

                {events.length === 0 ? (
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {t('tracking.liveStatusFeedHint')}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {events.map((event) => (
                      <li
                        key={event.id}
                        className="flex items-center justify-between gap-3 text-[11px] bg-slate-50 rounded-xl px-3 py-2 border border-slate-100"
                      >
                        <span className="font-bold text-slate-700">
                          {getStatusLabel(event.status)}
                        </span>
                        <span className="text-slate-400 font-semibold">
                          {relativeTime(event.at)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t border-slate-100 pt-6">
                <Link
                  to="/orders"
                  className="inline-flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                >
                  <MapPin size={13} />
                  {t('tracking.viewAllDispatches')}
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * A compact metric tile used across the shipment summary strip.
 */
function SummaryTile({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon size={13} className="text-red-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>
      <p className="text-xs font-black text-slate-900 mt-1.5 truncate">
        {value}
      </p>
    </div>
  );
}
