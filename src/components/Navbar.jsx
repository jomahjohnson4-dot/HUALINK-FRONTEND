import { useEffect, useRef, useState } from 'react';
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
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import CategoryMegaMenu from './CategoryMegaMenu';
import NotificationBell from './NotificationBell';
import Logo from './Logo';
import { hualinkCategories } from '../data/categories';

// Top sub-links under the logo (Alibaba style)
const SUB_LINKS = [
  { id: 'allCategories', labelKey: 'common.allCategories', to: '/shop', icon: Store },
  { id: 'verifiedManufacturers', labelKey: 'common.verifiedManufacturers', to: '/shop' },
  { id: 'hualinkServices', labelKey: 'common.hualinkServices', to: '/services' },
];

export default function Navbar({ user: userProp }) {
  const { t } = useTranslation();
  const { currentLang, changeLanguage } = useLanguage();
  const { user: authUser, isAuthenticated, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const navigate = useNavigate();

  const user = userProp ?? authUser;

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // ---- "All Categories" hover mega-flyout ----
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [megaDepartment, setMegaDepartment] = useState(hualinkCategories[0].id);
  const megaCloseTimer = useRef(null);

  // Clear any pending close timer when the header unmounts.
  useEffect(() => () => clearTimeout(megaCloseTimer.current), []);

  // Open immediately on hover (and cancel a scheduled close while at it).
  const openMegaMenu = () => {
    clearTimeout(megaCloseTimer.current);
    setIsMegaOpen(true);
  };

  // Leaving the trigger/menu schedules the close so the cursor can cross the
  // small gap under the button without the menu flickering shut.
  const scheduleMegaClose = () => {
    clearTimeout(megaCloseTimer.current);
    megaCloseTimer.current = setTimeout(() => setIsMegaOpen(false), 200);
  };

  // Click toggles the same menu for touch/keyboard users.
  const toggleMegaMenu = () => {
    clearTimeout(megaCloseTimer.current);
    setIsMegaOpen((open) => !open);
  };

  // Sub-category pick: close the menu, then deep-link into the marketplace
  // with the live filter applied (/shop?category=<slug>).
  const handleMegaSubcategory = (subcategory) => {
    clearTimeout(megaCloseTimer.current);
    setIsMegaOpen(false);
    navigate(`/shop?category=${encodeURIComponent(subcategory.slug)}`);
  };

  // Calculate total item count in cart — every unit counts, not every line.
  const cartCount = totalItems;

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

                // "All Categories" owns the floating mega-flyout menu.
                if (link.id === 'allCategories') {
                  return (
                    <div
                      key={link.id}
                      className="relative"
                      onMouseEnter={openMegaMenu}
                      onMouseLeave={scheduleMegaClose}
                    >
                      <button
                        type="button"
                        onClick={toggleMegaMenu}
                        aria-haspopup="menu"
                        aria-expanded={isMegaOpen}
                        className={`flex items-center gap-1.5 px-4 py-1.5 border rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                          isMegaOpen
                            ? 'border-[#E50914] bg-red-50 text-[#E50914]'
                            : 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {Icon && <Icon size={14} />}
                        <span>{t(link.labelKey)}</span>
                        <ChevronDown
                          size={12}
                          className={`text-gray-400 transition-transform ${
                            isMegaOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isMegaOpen && (
                        <CategoryMegaMenu
                          activeDepartmentId={megaDepartment}
                          onDepartmentChange={setMegaDepartment}
                          onActivateDepartment={setMegaDepartment}
                          onSubcategorySelect={handleMegaSubcategory}
                        />
                      )}
                    </div>
                  );
                }

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
                aria-label={t('common.languageSelector')}
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
              onClick={openCart}
              className="relative w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 text-gray-900 hover:text-brand-red hover:bg-red-50 transition-all cursor-pointer"
              aria-label={t('common.openCart')}
            >
              <ShoppingCart size={17} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-brand-red text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs tabular-nums">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* System Activity Bell — live alerts for orders, inquiries, catalogue */}
            <NotificationBell />

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
                          {user?.name || user?.fullName || t('common.userAccount')}
                        </p>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                          {userRole || t('common.roleCustomer')}
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
                          {t('common.supplierPortal')}
                        </Link>
                        {userRole === 'ADMIN' && (
                          <Link
                            to="/dashboard/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-2.5 text-xs text-brand-red hover:bg-red-50 font-bold"
                          >
                            {t('common.adminConsole')}
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
                          <span>{t('common.userManagement')}</span>
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
      <CartDrawer />
    </>
  );
}
