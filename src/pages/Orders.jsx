import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, RefreshCw, FileText, AlertCircle, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getMyOrders, subscribeToOrderStatus } from '../api/orderService';
import DeliveryMap from '../components/DeliveryMap';
import OrderStatusTimeline from '../components/OrderStatusTimeline';
import {
  STATUS_STEP,
  placeLabelKey,
  resolveRouteForOrder,
  stageLabelKey,
  statusTone,
} from '../data/deliveryRoutes';

/** Helper to map status string strictly to integer step */
const getStepFromStatus = (status) =>
  STATUS_STEP[String(status || 'PENDING').toUpperCase()] ?? 1;

/** Flattens a database order row into the shape the timeline renders. */
const normaliseOrder = (raw) => {
  const createdAt = raw.createdAt ? new Date(raw.createdAt) : new Date();
  const total = Number(raw.totalAmount ?? raw.total ?? 0) || 0;

  return {
    id: raw.id,
    orderNumber: raw.orderNumber || raw.id,
    status: raw.status || 'PENDING',
    location: raw.region || raw.shippingAddress || 'Dar es Salaam',
    region: raw.region || 'Dar es Salaam',
    shippingAddress: raw.shippingAddress || 'Default Address',
    paymentMethod: raw.paymentMethod || 'M-PESA',
    paymentStatus: raw.paymentStatus || 'PENDING',
    date: createdAt.toLocaleDateString(),
    fullDate: createdAt.toLocaleString(),
    amount: `${total.toLocaleString()} TZS`,
    totalAmount: total,
    items: (raw.items || []).map((item) => ({
      quantity: item.quantity,
      name: item.product?.name || item.name || 'Product',
      price: `${Number(item.unitPrice ?? item.price ?? 0).toLocaleString()} TZS`,
    })),
  };
};

/** Orders cached locally by the checkout flow — used when the API is unreachable. */
const readLocalOrders = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('hualink_orders')) || [];
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export const Orders = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [dispatches, setDispatches] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveError, setLiveError] = useState(null);

  /**
   * Loads the customer's orders from the database.
   *
   * Guests (or an unreachable API) fall back to the locally cached orders so
   * the page still renders.
   */
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getMyOrders();
      const normalised = list.map(normaliseOrder);
      setDispatches(normalised);
      setLiveError(null);

      setSelectedOrder((prev) => {
        if (!normalised.length) return null;
        if (!prev) return normalised[0];
        return normalised.find((order) => order.id === prev.id) || normalised[0];
      });
    } catch (err) {
      console.error('Failed to load orders:', err);
      setLiveError(
        err?.response?.status === 401
          ? t('orders.signInToTrack')
          : t('orders.unavailableShowingSaved')
      );

      const local = readLocalOrders().map((ord) => ({
        ...ord,
        id: ord.id,
        step: getStepFromStatus(ord.status),
      }));
      setDispatches(local);
      setSelectedOrder((prev) => (prev ? prev : local[0] ?? null));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  /**
   * Live route tracking: the server pushes a new payload every time an admin
   * moves the order to a different stage, so the timeline updates instantly.
   */
  useEffect(() => {
    const orderId = selectedOrder?.id;
    if (!orderId) return undefined;

    const unsubscribe = subscribeToOrderStatus(orderId, (payload) => {
      if (!payload?.status) return;

      setDispatches((current) =>
        current.map((order) =>
          order.id === payload.orderId || order.id === orderId
            ? { ...order, status: payload.status }
            : order
        )
      );
      setSelectedOrder((current) =>
        current && (current.id === payload.orderId || current.id === orderId)
          ? { ...current, status: payload.status }
          : current
      );
    });

    return unsubscribe;
  }, [selectedOrder?.id]);

  const handleRefresh = () => {
    loadOrders();
  };

  /** The localized name of a place (hub/stop/region). */
  const placeLabel = (value) => {
    const placeKey = placeLabelKey(value);
    return placeKey ? t(placeKey) : value;
  };

  /** Localizes a status label. */
  const getStatusLabel = (status) => {
    const key = stageLabelKey(String(status || '').toUpperCase());
    return key ? t(key) : String(status || '').replace(/_/g, ' ');
  };

  const filteredDispatches = dispatches.filter((item) =>
    [item.orderNumber, item.id, item.location, item.paymentMethod]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // The corridor this shipment travels along — drives the live map.
  const activeRoute = resolveRouteForOrder(selectedOrder || {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans text-slate-900 bg-slate-50/50 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-bold">
              <Package size={18} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t('orders.pageTitle')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('orders.pageSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={t('orders.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-red-500 shadow-sm"
            />
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-red-600 shadow-sm transition-colors cursor-pointer"
            aria-label={t('orders.refreshAria')}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {liveError ? (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">
          <AlertCircle size={14} />
          {liveError}
        </div>
      ) : null}

      {loading && dispatches.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <RefreshCw size={32} className="mx-auto animate-spin text-red-500" />
          <p className="text-xs font-bold text-slate-500">{t('orders.loadingOrders')}</p>
        </div>
      ) : filteredDispatches.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <Package size={48} className="mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">{t('orders.noOrdersTitle')}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t('orders.noOrdersHint')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Side: Orders List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex justify-between items-center px-1 mb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Recent Dispatches ({filteredDispatches.length})
              </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredDispatches.map((item) => {
                const isSelected = selectedOrder?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedOrder(item)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                      isSelected
                        ? 'bg-white border-red-500 ring-2 ring-red-500/10'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-black text-slate-900">
                        {item.orderNumber || item.id}
                      </h3>
                      <span
                        className={`px-2 py-0.5 border rounded text-[9px] font-bold ${statusTone(
                          item.status
                        )}`}
                      >
                        {stageLabelFor(item.status)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                      <span>📍</span> {item.location}
                    </p>

                    <div className="flex justify-between items-end text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                      <span>{item.date}</span>
                      <span className="text-xs font-black text-red-600">{item.amount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: live map + timeline computed per selected order */}
          {selectedOrder && (
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* The interactive route map — stacks above the timeline on mobile */}
              <div className="order-first lg:order-none">
                <DeliveryMap
                  order={selectedOrder}
                  route={activeRoute}
                  height="380px"
                />
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-6 gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Order {selectedOrder.orderNumber || selectedOrder.id}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      Payment Method:{' '}
                      <span className="text-slate-700 font-bold">
                        {selectedOrder.paymentMethod}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        ORDER DATE
                      </span>
                      <p className="text-xs font-bold text-slate-700 mt-0.5">
                        {selectedOrder.fullDate || selectedOrder.date}
                      </p>
                    </div>

                    <Link
                      to={`/order/${selectedOrder.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-red-100 transition-colors"
                    >
                      <MapPin size={12} />
                      Open live route
                    </Link>
                  </div>
                </div>

                {/* Step Timeline */}
                <OrderStatusTimeline
                  status={selectedOrder.status}
                  orderDate={selectedOrder.fullDate || selectedOrder.date}
                  route={activeRoute}
                />


              {/* Receipt */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  <FileText size={16} className="text-red-500" />
                  <span>ITEMIZED DISPATCH RECEIPT</span>
                </div>

                <div className="space-y-2 bg-slate-50/70 rounded-2xl p-4 border border-slate-100">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-xs"
                      >
                        <span className="text-slate-700 font-medium">
                          <span className="font-bold text-slate-900">
                            {item.quantity || item.qty}x
                          </span>{' '}
                          {item.name}
                        </span>
                        <span className="font-bold text-slate-900">
                          {item.price || `${item.unitPrice?.toLocaleString()} TZS`}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500">Receipt details available</div>
                  )}
                  <div className="flex justify-between items-center text-xs font-black text-red-600 border-t border-slate-200 pt-3 mt-2">
                    <span>Total Paid Amount</span>
                    <span>{selectedOrder.amount}</span>
                  </div>
                </div>
              </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;