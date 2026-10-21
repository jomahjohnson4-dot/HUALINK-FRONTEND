import React from 'react';
import DeliveryMap from '../components/DeliveryMap';
import OrderStatusTimeline from '../components/OrderStatusTimeline';
import { resolveRouteForOrder } from '../data/deliveryRoutes';

/**
 * TEMPORARY preview harness used to verify the delivery map visually.
 * Removed once the screenshots have been captured.
 */
export default function MapPreview() {
  const order = {
    id: 'preview',
    orderNumber: 'HL-PREVIEW',
    status: 'OUT_FOR_DELIVERY',
    region: 'Mbeya',
    shippingAddress: 'Nyerere Road, Mbeya',
    paymentMethod: 'M-PESA',
    paymentStatus: 'PENDING',
    createdAt: new Date().toISOString(),
    fullDate: new Date().toLocaleString(),
    date: new Date().toLocaleDateString(),
    amount: '450,000 TZS',
    items: [{ id: '1', quantity: 2, name: 'Fast Charger 65W GaN', price: '90,000 TZS' }],
  };

  const route = resolveRouteForOrder(order);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans bg-slate-50 min-h-screen">
      <h1 className="text-xl font-black text-slate-900 mb-4">Delivery map preview</h1>
      <DeliveryMap order={order} route={route} height="420px" />
      <div className="bg-white border border-slate-200 rounded-3xl p-6 mt-6">
        <OrderStatusTimeline
          status={order.status}
          orderDate={order.fullDate}
          route={route}
        />
      </div>
    </div>
  );
}
