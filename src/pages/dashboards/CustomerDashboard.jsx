import React from 'react';
import OrdersImport, { Orders as OrdersNamed } from '../Orders';

// Dynamic Component Resolver for Export Compatibility
const Orders = OrdersImport || OrdersNamed;

export const CustomerDashboard = () => {
  return (
    <div className="p-6 space-y-6 bg-slate-900 text-white min-h-screen font-sans">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-orange-500">My Account</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
          Track shipments, receipts, and order statuses
        </p>
      </header>

      {/* Customer Order History */}
      {Orders ? (
        <Orders />
      ) : (
        <div className="p-6 bg-slate-800/50 border border-slate-700/60 rounded-2xl text-slate-400 text-xs text-center font-semibold">
          Order history module unavailable.
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;