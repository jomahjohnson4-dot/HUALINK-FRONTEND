import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  Globe,
  User,
  UserPlus,
  ShoppingCart,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldAlert,
  PackageCheck,
  Menu,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage, LANGUAGES } from '../hooks/useLanguage';
import { useAuth } from '../context/AuthContext';
import CartDrawer from './CartDrawer';
import Logo from './Logo';

// Top sub-links under the logo (Alibaba style)
const SUB_LINKS = [
  { id: 'allCategories', labelKey: 'common.allCategories', to: '/shop', icon: Store },
  { id: 'verifiedManufacturers', labelKey: 'common.verifiedManufacturers', to: '/shop' },
  { id: 'hualinkServices', labelKey: 'common.hualinkServices', to: '/services' },
];

export default function Navbar({ cartItems = [], onUpdateQuantity, onRemoveItem }) {
  const { t } = useTranslation();
  const { currentLang, changeLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Calculate total item count in cart
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Normalize user role
  const userRole = user?.role?.toUpperCase();

  // Helper for direct dashboard target link
  const getDashboardPath = () => {
    if (userRole === 'ADMIN') return '/dashboard/admin';
    if (userRole === 'SELLER') return '/dashboard/seller';
    return '/dashboard/customer';
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  const activeLang = LANGUAGES.find((l) => l.code === currentLang);

  return (
    <>
      {/* ================= 1. ALIBABA-STYLE HEADER ROW ================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm font-sans">
        <div className="max-w-7xl mx-auto px-6 py-4 w-full flex items-center justify-between">
          {/* LEFT SIDE: Logo + Category Sub-links */}
          <div className="flex items-center gap-6 shrink-0">
            <Logo />

            {/* Category Sub-links Row */}
            <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
              {SUB_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.id}
                    onClick={() => navigate(link.to)}
                    className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 rounded-full bg-gray-100 text-xs font-semibold hover:bg-gray-50 transition-all cursor-pointer shrink-0"
                  >
                    {Icon && <Icon size={14} />}
                    <span>{t(link.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDE: Utility Controls */}
          <div className="flex items-center gap-5 text-sm font-medium text-gray-700 shrink-0">
            {/* Deliver to: 🇹🇿 TZ */}
            <div className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 bg-gray-50 rounded-full text-xs font-semibold cursor-pointer hover:bg-gray-100 transition-colors group">
              <span className="font-bold text-gray-900">
                {t('common.deliverTo')}
              </span>
              <span className="font-bold text-brand-red">🇹🇿 TZ</span>
            </div>

            {/* Language / Currency Selector */}
            <div className="relative group">
              <button
                onClick={() => {
                  setIsLangMenuOpen((o) => !o);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 bg-gray-50 rounded-full text-xs font-semibold cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none"
                aria-label="Language selector"
              >
                <Globe size={14} className="text-gray-500" />
                <span className="font-bold text-gray-900">
                  {activeLang ? activeLang.label : 'EN'} / TZS
                </span>
                <ChevronDown size={12} className="text-gray-400" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 shadow-lg py-2 z-50 rounded-lg">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 ${
                        lang.code === currentLang
                          ? 'bg-brand-red/10 text-brand-red font-bold'
                          : 'text-charcoal hover:bg-gray-50'
                      } font-medium`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 text-gray-900 hover:text-brand-red hover:bg-red-50 transition-all cursor-pointer"
              aria-label="Open Order Cart"
            >
              <ShoppingCart size={17} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-brand-red text-white text-[10px] font-black w-3 h-3 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Sign In / Register */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 rounded-full bg-gray-50 text-gray-900 font-bold text-xs cursor-pointer hover:bg-gray-100 transition-all"
                >
                  <div className="w-6 h-6 rounded bg-brand-red text-white flex items-center justify-center text-[10px] font-bold uppercase">
                    {(user?.name || user?.fullName || user?.email || 'U')[0]}
                  </div>
                  <span className="max-w-[120px] truncate hidden sm:inline">
                    {user?.name || user?.fullName || user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={12} className="text-gray-500" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 shadow-xl py-2.5 z-50 divide-y divide-gray-100 rounded-lg">
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {user?.name || user?.fullName || 'User Account'}
                        </p>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                          {userRole || 'CUSTOMER'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 truncate mt-1">{user?.email}</p>
                    </div>

                    <div className="py-1.5">
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-800 hover:bg-gray-50 font-bold"
                      >
                        <LayoutDashboard size={15} className="text-brand-red" />
                        <span>{t('common.myDashboard')}</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 font-semibold"
                      >
                        <PackageCheck size={15} className="text-gray-500" />
                        <span>{t('common.orderHistory')}</span>
                      </Link>
                    </div>

                    {(userRole === 'SELLER' || userRole === 'ADMIN') && (
                      <div className="py-1.5">
                        <Link
                          to="/dashboard/seller"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-xs text-gray-800 hover:bg-gray-50 font-bold"
                        >
                          Supplier Portal
                        </Link>
                        {userRole === 'ADMIN' && (
                          <Link
                            to="/dashboard/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-2.5 text-xs text-brand-red hover:bg-red-50 font-bold"
                          >
                            Admin Console
                          </Link>
                        )}
                      </div>
                    )}

                    {userRole === 'ADMIN' && (
                      <div className="py-1.5">
                        <Link
                          to="/users"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs text-brand-red hover:bg-red-50 font-bold"
                        >
                          <ShieldAlert size={15} />
                          <span>User Management</span>
                        </Link>
                      </div>
                    )}

                    <div className="pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-xs text-brand-red hover:bg-red-50 font-bold cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>{t('common.signOut')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 rounded-full bg-gray-50 text-gray-800 hover:bg-gray-100 hover:text-brand-red font-bold text-xs cursor-pointer transition-all"
                >
                  <User size={14} />
                  <span className="hidden sm:inline">{t('common.signIn')}</span>
                </Link>

                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#E50914] hover:bg-[#C0040F] text-white font-bold text-xs rounded-full transition-all shadow-sm"
                >
                  <UserPlus size={14} />
                  <span className="hidden sm:inline">{t('common.createAccount')}</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Slide-over Cart Drawer Component */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
      />
    </>
  );
}
