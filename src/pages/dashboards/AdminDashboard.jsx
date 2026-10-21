import React, { useState } from 'react';
import AnalyticsDashboardImport, { AnalyticsDashboard as AnalyticsDashboardNamed } from '../../components/AnalyticsDashboard';
import AdminOrdersImport, { AdminOrders as AdminOrdersNamed } from '../../components/AdminOrders';
import ProviderChatPanelImport, { ProviderChatPanel as ProviderChatPanelNamed } from '../../components/ProviderChatPanel';
import AdminProductsPanel from '../../components/admin/AdminProductsPanel';
import AdminWholesaleOrdersPanel from '../../components/admin/AdminWholesaleOrdersPanel';
import AdminOverviewPanel from '../../components/admin/AdminOverviewPanel';
import AdminSettingsPanel from '../../components/admin/AdminSettingsPanel';
import { ToastStack } from '../../components/admin/ToastStack';
import { useToasts } from '../../components/admin/useToasts';
import { BarChart3, ShoppingBag, MessageSquare, LayoutDashboard, Package, SlidersHorizontal } from 'lucide-react';

// Dynamic Component Resolvers for Robust Export Compatibility
const AnalyticsDashboard = AnalyticsDashboardImport || AnalyticsDashboardNamed;
const AdminOrders = AdminOrdersImport || AdminOrdersNamed;
const ProviderChatPanel = ProviderChatPanelImport || ProviderChatPanelNamed;

const TABS = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'products', label: 'Products', Icon: Package },
  { id: 'wholesale', label: 'Orders', Icon: ShoppingBag },
  { id: 'analytics', label: 'Analytics Engine', Icon: BarChart3 },
  { id: 'orders', label: 'Service Orders', Icon: ShoppingBag },
  { id: 'messages', label: 'Live Chat Inbox', Icon: MessageSquare },
  { id: 'settings', label: 'Settings', Icon: SlidersHorizontal },
];

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { toasts, push, dismiss } = useToasts();

  // Fallback sample booking if none selected from orders
  const activeBookingData = selectedBooking || {
    id: "booking_default",
    serviceTitle: "General Client Inquiries",
    serviceId: "service_general"
  };

  return (
    <div className="p-6 space-y-6 bg-slate-900 text-white min-h-screen font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 pb-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-orange-500 tracking-tight">Platform Control Center</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Product catalog, wholesale orders, live metrics &amp; system settings
          </p>
          <p className="text-[11px] font-bold text-emerald-400 mt-1">
            Logged in as Hualink Admin
          </p>
        </div>

        {/* Tab Switcher Navigation */}
        <div className="flex flex-wrap gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === id
                  ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Dynamic View Rendering */}
      <div className="pt-2">
        {activeTab === 'overview' && <AdminOverviewPanel />}

        {activeTab === 'products' && <AdminProductsPanel onToast={push} />}

        {activeTab === 'wholesale' && <AdminWholesaleOrdersPanel onToast={push} />}

        {activeTab === 'settings' && <AdminSettingsPanel onToast={push} />}

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

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};

export default AdminDashboard;