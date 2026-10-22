import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  BarChart3, 
  ShieldAlert,
  Settings,
  LogOut,
  ChevronRight,
  ArrowRight,
  Search,
  PackageCheck,
  Truck,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

const ADMIN_NAV_ITEMS = [
  { to: '/dashboard/admin', labelKey: 'admin.nav.overview', icon: LayoutDashboard },
  { to: '/dashboard/admin/products', labelKey: 'admin.nav.products', icon: Package },
  { to: '/dashboard/admin/orders', labelKey: 'admin.nav.orders', icon: ShoppingBag },
  { to: '/dashboard/admin/customers', labelKey: 'admin.nav.customers', icon: Users },
  { to: '/dashboard/admin/analytics', labelKey: 'admin.nav.analytics', icon: BarChart3 },
];

export default function AdminLayout({ children }) {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900">
      {/* Mobile sidebar overlay */}
      {!isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden" 
          onClick={() => setIsSidebarOpen(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy-900 border-r border-navy-800 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:border-r-0 md:shadow-none`}
        aria-label="Admin navigation"
      >
        <div className="flex items-center justify-between h-16 px-4 bg-navy-900 border-b border-navy-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-black tracking-tighter text-xs shadow-sm">
              <span className="text-blue-300 italic">H</span>
              <span className="text-white italic -ml-0.5">L</span>
            </div>
            <span className="text-sm font-black italic tracking-wide text-white hidden md:inline">
              HUALINK
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded hover:bg-navy-800"
            aria-label={t('admin.nav.closeSidebar')}
          >
            <XIcon size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          <div className="px-3 mb-6">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Search size={14} className="text-slate-500" />
              <span>{t('admin.nav.panel')}</span>
            </div>
          </div>

          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{t(item.labelKey)}</span>
              </Link>
            );
          })}

          <div className="mt-8 pt-6 border-t border-navy-800">
            <div className="px-3 mb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t('admin.nav.account')}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-300 hover:bg-navy-800 hover:text-white transition-all cursor-pointer"
            >
              <LogOut size={16} />
              <span>{t('common.signOut')}</span>
            </button>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-navy-800">
          <div className="flex items-center gap-3 p-3 bg-navy-800 rounded-xl border border-navy-700">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold">
              {(user?.name || user?.fullName || user?.email || 'A')[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-navy-100 truncate">
                {user?.name || user?.fullName || t('admin.nav.administrator')}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.role || 'ADMIN'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`md:pl-64 ${isSidebarOpen ? 'md:pl-64' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function XIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
