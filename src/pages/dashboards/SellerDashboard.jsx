import React from 'react';

export const SellerDashboard = () => {
  return (
    <div className="p-6 space-y-6 bg-slate-900 text-white min-h-screen">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold">Seller Workspace</h1>
        <p className="text-slate-400">Manage your product catalog and incoming customer orders</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <h2 className="text-lg font-semibold text-emerald-400 mb-2">Active Inventory</h2>
          <p className="text-3xl font-bold">24 Products</p>
        </div>
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <h2 className="text-lg font-semibold text-orange-400 mb-2">Pending Fulfillment</h2>
          <p className="text-3xl font-bold">8 Orders</p>
        </div>
      </div>
    </div>
  );
};