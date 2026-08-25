import React, { useState } from 'react';
import AnalyticsDashboardImport, { AnalyticsDashboard as AnalyticsDashboardNamed } from '../../components/AnalyticsDashboard';
import AdminOrdersImport, { AdminOrders as AdminOrdersNamed } from '../../components/AdminOrders';
import ProviderChatPanelImport, { ProviderChatPanel as ProviderChatPanelNamed } from '../../components/ProviderChatPanel';
import { BarChart3, ShoppingBag, MessageSquare } from 'lucide-react';

// Dynamic Component Resolvers for Robust Export Compatibility
const AnalyticsDashboard = AnalyticsDashboardImport || AnalyticsDashboardNamed;
const AdminOrders = AdminOrdersImport || AdminOrdersNamed;
const ProviderChatPanel = ProviderChatPanelImport || ProviderChatPanelNamed;

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Fallback sample booking if none selected from orders
  const activeBookingData = selectedBooking || {
    id: "booking_default",
    serviceTitle: "General Client Inquiries",
    serviceId: "service_general"
  };

  return (
    <div className="p-6 space-y-6 bg-slate-900 text-white min-h-screen font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-orange-500 tracking-tight">Platform Control Center</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            System-wide platform performance, live metrics & service requests
          </p>
        </div>

        {/* Tab Switcher Navigation */}
        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <BarChart3 size={15} />
            <span>Analytics Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ShoppingBag size={15} />
            <span>Service Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <MessageSquare size={15} />
            <span>Live Chat Inbox</span>
          </button>
        </div>
      </header>

      {/* Dynamic View Rendering */}
      <div className="pt-2">
        {activeTab === 'analytics' && AnalyticsDashboard && <AnalyticsDashboard />}

        {activeTab === 'orders' && AdminOrders && (
          <AdminOrders 
            onSelectBookingForChat={(booking) => {
              setSelectedBooking(booking);
              setActiveTab('messages');
            }}
          />
        )}

        {activeTab === 'messages' && ProviderChatPanel && (
          <div className="flex justify-center items-center py-4">
            <ProviderChatPanel 
              providerId="hualink_admin" 
              selectedBooking={activeBookingData} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;