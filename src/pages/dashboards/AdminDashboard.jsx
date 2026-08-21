import React from 'react';
import { AnalyticsDashboard } from '../../components/AnalyticsDashboard';

export const AdminDashboard = () => {
  return (
    <div className="p-6 space-y-6 bg-slate-900 text-white min-h-screen">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold text-orange-500">Platform Control Center</h1>
        <p className="text-slate-400">System-wide platform performance and live metrics</p>
      </header>

      {/* Embedded Centralized Analytics Engine */}
      <AnalyticsDashboard />
    </div>
  );
};