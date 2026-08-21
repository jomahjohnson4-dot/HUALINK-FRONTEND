import React from 'react';
import Orders from '../Orders';

export const CustomerDashboard = () => {
  return (
    <div className="p-6 space-y-6 bg-slate-900 text-white min-h-screen">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold">My Account</h1>
        <p className="text-slate-400">Track shipments, receipts, and order statuses</p>
      </header>

      {/* Customer Order History */}
      <Orders />
    </div>
  );
};