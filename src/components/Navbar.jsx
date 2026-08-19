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
  ShoppingBag,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CartDrawer from './CartDrawer';

export default function Navbar({ cartItems = [], onUpdateQuantity, onRemoveItem }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Calculate total item count in cart
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Brand Logo matching HUALINK logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-red-600 flex items-center justify-center font-black tracking-tighter text-base bg-white shadow-xs">
              <span className="text-red-600 italic">H</span>
              <span className="text-black italic -ml-0.5">L</span>
            </div>
            <div className="flex flex-col">
              <div className="text-xl font-black italic tracking-wide">
                <span className="text-red-600">HUA</span>
                <span className="text-black">LINK</span>
              </div>
              <span className="text-[9px] text-black font-extrabold tracking-[0.25em] uppercase">
                DISTRIBUTION
              </span>
            </div>
          </Link>

          {/* Center Navigation Links with Icons */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <NavLink 
              to="/shop" 
              className={({ isActive }) => 
                `flex items-center gap-2 py-6 border-b-2 transition-all ${
                  isActive 
                    ? "border-red-600 text-red-600 font-bold" 
                    : "border-transparent text-gray-800 hover:text-red-600"
                }`
              }
            >
              <Store size={18} />
              <span>Marketplace</span>
            </NavLink>

            <NavLink 
              to="/outlets" 
              className={({ isActive }) => 
                `flex items-center gap-2 py-6 border-b-2 transition-all ${
                  isActive 
                    ? "border-red-600 text-red-600 font-bold" 
                    : "border-transparent text-gray-800 hover:text-red-600"
                }`
              }
            >
              <Building2 size={18} />
              <span>Shops</span>
            </NavLink>

            <NavLink 
              to="/services" 
              className={({ isActive }) => 
                `flex items-center gap-2 py-6 border-b-2 transition-all ${
                  isActive 
                    ? "border-red-600 text-red-600 font-bold" 
                    : "border-transparent text-gray-800 hover:text-red-600"
                }`
              }
            >
              <Layers size={18} />
              <span>Services</span>
            </NavLink>

            <NavLink 
              to="/explore" 
              className={({ isActive }) => 
                `flex items-center gap-2 py-6 border-b-2 transition-all ${
                  isActive 
                    ? "border-red-600 text-red-600 font-bold" 
                    : "border-transparent text-gray-800 hover:text-red-600"
                }`
              }
            >
              <Compass size={18} />
              <span>Explore</span>
            </NavLink>
          </nav>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-3">

            {/* Cart Trigger Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-gray-800 hover:text-red-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer mr-1"
              aria-label="Open Order Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Language Selector */}
            <div className="hidden lg:flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-gray-300 transition-colors mr-1">
              <Globe size={16} className="text-gray-500" />
              <select className="bg-transparent focus:outline-none cursor-pointer">
                <option value="en">English</option>
                <option value="sw">Swahili</option>
              </select>
            </div>

            {/* Conditional Auth Navigation Controls */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-gray-900 font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {(user?.name || user?.email || 'U')[0]}
                  </div>
                  <span className="max-w-[100px] truncate">
                    {user?.name || user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={14} className="text-gray-500" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                    </div>
                    
                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-xs text-gray-700 hover:bg-slate-50 font-semibold"
                    >
                      My Orders
                    </Link>

                    {user?.role === 'ADMIN' && (
                      <Link
                        to="/users"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold"
                      >
                        User Management
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-bold border-t border-gray-100 cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Sign In Button */}
                <Link 
                  to="/login" 
                  className="flex items-center gap-1.5 text-gray-800 hover:text-red-600 font-bold text-xs px-3 py-2 transition-all"
                >
                  <User size={15} />
                  <span>Sign In</span>
                </Link>

                {/* Register Button */}
                <Link 
                  to="/register" 
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-full transition-all shadow-md shadow-red-600/20"
                >
                  <UserPlus size={15} />
                  <span>Register</span>
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