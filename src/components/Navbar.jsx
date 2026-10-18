import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Store,
  Building2,
  Layers,
  Compass,
  Globe,
  User,
  UserPlus,
  ShoppingCart,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldAlert,
  PackageCheck,
  Search,
  Scan,
  QrCode,
  Menu,
  Truck,
  Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage, LANGUAGES } from '../hooks/useLanguage';
import { useAuth } from '../context/AuthContext';
import CartDrawer from './CartDrawer';

const CATEGORY_LINKS = [
  { id: 'allCategories', labelKey: 'common.allCategories', to: '/shop' },
  { id: 'superDeals', labelKey: 'common.superDeals', to: '/shop', icon: Zap, active: true },
  { id: 'smartphones', labelKey: 'landing.smartphones', to: '/shop' },
  { id: 'chargers', labelKey: 'landing.chargersPower', to: '/shop' },
  { id: 'electronics', labelKey: 'landing.consumerElectronics', to: '/shop' },
  { id: 'printing', labelKey: 'common.printingDesign', to: '/services' },
  { id: 'suppliers', labelKey: 'common.verifiedSuppliers', to: '/outlets' },
  { id: 'services', labelKey: 'common.services', to: '/services' },
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
      {/* ================= 1. MAIN HEADER (Amazon Style) ================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-300 shadow-sm font-sans">
        <div className="max-w-7xl mx-auto px-3 h-12 flex items-center justify-between">
          {/* Left Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 border-2 border-brand-red flex items-center justify-center font-black tracking-tighter text-sm bg-white shadow-xs">
              <span className="text-brand-red italic">H</span>
              <span className="text-charcoal italic -ml-0.5">L</span>
            </div>
            <div className="flex flex-col">
              <div className="text-base font-black italic tracking-wide">
                <span className="text-brand-red">HUA</span>
                <span className="text-charcoal">LINK</span>
              </div>
              <span className="text-[8px] text-charcoal font-extrabold tracking-[0.25em] uppercase">
                DISTRIBUTION
              </span>
            </div>
          </Link>

          {/* Center Search Bar */}
          <div className="hidden md:flex flex-1 max-w-3xl mx-6">
            <div className="border border-gray-300 focus-within:border-[#E50914] rounded-none flex items-center w-full">
              {/* All dropdown filter */}
              <button
                className="bg-gray-100 hover:bg-gray-200 text-xs px-3 py-2 border-r border-gray-300 rounded-l-none font-medium text-gray-900 focus:outline-none transition-colors"
              >
                All <ChevronDown size={14} className="ml-1" />
              </button>
              {/* Text input */}
              <input
                type="text"
                placeholder={t('landing.searchPlaceholder')}
                className="flex-1 px-3 py-2 focus:outline-none w-full text-sm border-none placeholder-gray-400"
              />
              {/* Search button */}
              <button
                onClick={() => navigate('/shop')}
                className="bg-[#E50914] hover:bg-[#C0040F] text-white px-5 flex items-center justify-center rounded-r-none focus:outline-none transition-colors"
                aria-label={t('common.search')}
              >
                <Search size={14} />
              </button>
            </div>
          </div>

          {/* Right Action Utility Icons */}
          <div className="flex items-center gap-1">
            {/* QR / App Download Widget */}
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors group">
              <QrCode size={14} className="text-gray-600 group-hover:text-brand-red" />
              <span className="text-[10px] font-bold text-gray-900 hidden sm:inline">
                {t('landing.appDownload')}
              </span>
            </div>

            {/* Language / Currency Selector */}
            <div className="relative group">
              <button
                onClick={() => {
                  setIsLangMenuOpen((o) => !o);
                }}
                className="flex items-center gap-1 px-2 py-1 border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none rounded-none"
                aria-label="Language selector"
              >
                <Globe size={14} className="text-gray-500" />
                <span className="text-[10px] font-bold text-gray-900 hidden sm:inline">
                  {activeLang ? activeLang.label : 'EN'} / TZS
                </span>
                <ChevronDown size={12} className="text-gray-400" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 shadow-lg py-1 z-50 rounded-none">
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

            {/* User Account */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold text-xs px-2 py-1 transition-all border border-gray-200 cursor-pointer rounded-none"
                >
                  <div className="w-5 h-5 rounded bg-brand-red text-white flex items-center justify-center text-[10px] font-bold uppercase">
                    {(user?.name || user?.fullName || user?.email || 'U')[0]}
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline">
                    {user?.name || user?.fullName || user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={12} className="text-gray-500" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-100 shadow-xl py-2 z-50 divide-y divide-gray-100 rounded-none">
                    <div className="px-4 py-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {user?.name || user?.fullName || 'User Account'}
                        </p>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                          {userRole || 'CUSTOMER'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-800 hover:bg-gray-50 font-bold"
                      >
                        <LayoutDashboard size={15} className="text-brand-red" />
                        <span>{t('common.myDashboard')}</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 font-semibold"
                      >
                        <PackageCheck size={15} className="text-gray-500" />
                        <span>{t('common.orderHistory')}</span>
                      </Link>
                    </div>

                    {(userRole === 'SELLER' || userRole === 'ADMIN') && (
                      <div className="py-1">
                        <Link
                          to="/dashboard/seller"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-xs text-gray-800 hover:bg-gray-50 font-bold"
                        >
                          Supplier Portal
                        </Link>
                        {userRole === 'ADMIN' && (
                          <Link
                            to="/dashboard/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-2 text-xs text-brand-red hover:bg-red-50 font-bold"
                          >
                            Admin Console
                          </Link>
                        )}
                      </div>
                    )}

                    {userRole === 'ADMIN' && (
                      <div className="py-1">
                        <Link
                          to="/users"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-brand-red hover:bg-red-50 font-bold"
                        >
                          <ShieldAlert size={15} />
                          <span>User Management</span>
                        </Link>
                      </div>
                    )}

                    <div className="pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-brand-red hover:bg-red-50 font-bold cursor-pointer"
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
                  className="flex items-center gap-1 text-gray-800 hover:text-brand-red font-bold text-xs px-2 py-1 transition-all"
                >
                  <User size={14} />
                  <span className="hidden sm:inline">{t('common.signIn')}</span>
                </Link>

                <Link
                  to="/register"
                  className="flex items-center gap-1 bg-brand-red hover:bg-brand-red-dark text-white font-bold text-xs px-3 py-1.5 rounded-none transition-all shadow-md shadow-brand-red/20"
                >
                  <UserPlus size={14} />
                  <span className="hidden sm:inline">{t('common.register')}</span>
                </Link>
              </>
            )}

            {/* Shopping Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1 text-gray-900 hover:text-brand-red hover:bg-red-50 rounded-none transition-all cursor-pointer"
              aria-label="Open Order Cart"
            >
              <ShoppingCart size={16} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-brand-red text-white text-[10px] font-black w-3 h-3 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
              <span className="hidden sm:inline text-[10px] font-bold text-gray-900 mt-1">
                {t('common.cart')}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= 2. SECONDARY CATEGORY NAVBAR (Amazon Style) ================= */}
      <div className="bg-gray-50 border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-3 py-1.5">
          <div className="flex items-center gap-1">
            {/* All Categories Drawer */}
            <button className="bg-white hover:bg-gray-100 text-gray-900 font-bold px-3 py-1 border border-gray-300 rounded-none flex items-center gap-1 cursor-pointer shrink-0 text-xs">
              <Menu size={14} className="text-gray-700" />
              <span>{t('common.allCategories')}</span>
            </button>

            {/* Hualink Product Tabs */}
            <div className="flex-1 flex items-center gap-1 overflow-x-auto text-xs font-semibold text-gray-700 no-scrollbar">
              {CATEGORY_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = link.active;
                return (
                  <button
                    key={link.id}
                    onClick={() => navigate(link.to)}
                    className={`flex items-center gap-1 cursor-pointer transition-colors shrink-0 whitespace-nowrap px-3 py-1 border-b-2 border-transparent ${
                      isActive
                        ? 'text-[#E50914] font-extrabold border-[#E50914]'
                        : 'hover:text-[#E50914] hover:bg-gray-100'
                    } rounded-none`}
                  >
                    {Icon && <Icon size={14} />}
                    <span>{t(link.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. ANNOUNCEMENT SUB-BAR ================= */}
      <div className="bg-[#F9F9F9] py-1.5 text-center border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-1 px-3">
          <Truck size={12} className="text-[#E50914]" />
          <span className="text-[10px] text-gray-700 font-medium">
            {t('landing.freeDelivery')}
          </span>
        </div>
      </div>

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
