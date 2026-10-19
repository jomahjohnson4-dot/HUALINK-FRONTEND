import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';

import i18n from './i18n';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';

import Landing from './pages/Landing';
import Products from './pages/Products';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Outlets from './pages/Outlets';
import Services from './pages/Services';
import Explore from './pages/Explore';
import TopRankingPage from './pages/TopRankingPage';
import ShopsPage from './pages/ShopsPage';
import ServicesPage from './pages/ServicesPage';
import AISearchMode from './pages/AISearchMode';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout'; 
import Documentation from './pages/Documentation';
import HelpCenter from './pages/HelpCenter';

// Dashboard Views with fallback resolvers for default & named exports
import AdminDashboardImport, { AdminDashboard as AdminDashboardNamed } from './pages/dashboards/AdminDashboard';
import SellerDashboardImport, { SellerDashboard as SellerDashboardNamed } from './pages/dashboards/SellerDashboard';
import CustomerDashboardImport, { CustomerDashboard as CustomerDashboardNamed } from './pages/dashboards/CustomerDashboard';

import ProviderChatPanel from './components/ProviderChatPanel';

const AdminDashboard = AdminDashboardImport || AdminDashboardNamed;
const SellerDashboard = SellerDashboardImport || SellerDashboardNamed;
const CustomerDashboard = CustomerDashboardImport || CustomerDashboardNamed;

// Role-Based Protected Route Guard Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="p-10 text-center font-bold text-slate-400 bg-slate-900 min-h-screen flex items-center justify-center">
        Loading system profile...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role?.toUpperCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Auto-Redirect Router based on Database User Role
const DashboardRedirect = () => {
  const { user } = useAuth();
  const role = user?.role?.toUpperCase();

  if (role === 'ADMIN') return <Navigate to="/dashboard/admin" replace />;
  if (role === 'SELLER') return <Navigate to="/dashboard/seller" replace />;
  return <Navigate to="/dashboard/customer" replace />;
};

// Unauthorized Access View Component
const UnauthorizedView = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center font-sans">
    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center font-black text-2xl mb-4">
      !
    </div>
    <h1 className="text-2xl font-black text-slate-900">Access Restricted</h1>
    <p className="text-xs text-slate-500 max-w-md mt-2 mb-6 font-semibold">
      Your account role does not have permission to access this dashboard view.
    </p>
    <Link
      to="/dashboard"
      className="px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-all"
    >
      Return to My Dashboard
    </Link>
  </div>
);

// Dynamic Live Chat Page Wrapper for Branch Support & Customer Inquiries
const ProviderChatPage = ({ user }) => {
  const location = useLocation();
  const branchData = location.state || {};

  const bookingDetails = {
    id: branchData.branchId ? `branch_${branchData.branchId}` : 'general_inquiry',
    serviceTitle: branchData.branchName || 'Live Support & Branch Inquiries',
    serviceId: branchData.phone ? `Phone: ${branchData.phone}` : 'service_general',
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-white flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-2xl mb-4">
        <h1 className="text-2xl font-bold text-orange-500">Branch & Service Communications Desk</h1>
        <p className="text-xs text-slate-400">
          Inquire about depot inventory, services, and active branch operations in real time.
        </p>
      </div>
      <ProviderChatPanel
        providerId={user?.id || user?._id || 'hualink_admin'}
        selectedBooking={bookingDetails}
      />
    </div>
  );
};

// Main App Layout Wrapper
const AppLayout = ({ cartItems, handleUpdateQuantity, handleRemoveItem, handleClearCart, handleAddToCart, user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Active tab state helper for MobileBottomNav matching current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/shop') || path.includes('/marketplace')) return 'marketplace';
    if (path.includes('/outlets')) return 'shops';
    if (path.includes('/services')) return 'services';
    if (path.includes('/explore')) return 'explore';
    return 'marketplace';
  };

  const handleTabChange = (tabId) => {
    switch (tabId) {
      case 'marketplace':
        navigate('/shop');
        break;
      case 'shops':
        navigate('/outlets');
        break;
      case 'services':
        navigate('/services');
        break;
      case 'explore':
        navigate('/explore');
        break;
      default:
        navigate('/shop');
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between pb-16 md:pb-0 relative font-sans">
      <div>
        {/* Hide the full navigation bar on auth pages so only the clean minimal auth header remains */}
        {location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/forgot-password' && (
          <Navbar 
            cartItems={cartItems} 
            onUpdateQuantity={handleUpdateQuantity} 
            onRemoveItem={handleRemoveItem}
            user={user}
          />
        )}
        <Routes>
          <Route path="/" element={<Landing />} />
          
          {/* Products & Marketplace Routes */}
          <Route path="/shop" element={<Products onAddToCart={handleAddToCart} />} />
          <Route path="/marketplace" element={<Marketplace onAddToCart={handleAddToCart} />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/top-ranking" element={<TopRankingPage />} />
          <Route path="/shops" element={<ShopsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/ai-mode" element={<AISearchMode />} />

          {/* Quotation & Customization Requests (home page welcome actions) */}
          <Route path="/rfq" element={<ServicesPage />} />
          <Route path="/customization" element={<ServicesPage />} />
          
          {/* Network & Service Routes */}
          <Route path="/outlets" element={<Outlets />} />
          <Route path="/services" element={<Services />} />
          <Route path="/explore" element={<Explore />} />
          
          {/* Public Live Support Chat Route */}
          <Route path="/chat" element={<ProviderChatPage user={user} />} />
          
          {/* Orders & Checkout Routes */}
          <Route path="/orders" element={<Orders cartItems={cartItems} user={user} />} />
          <Route path="/cart" element={<Orders cartItems={cartItems} user={user} />} />
          <Route 
            path="/checkout" 
            element={
              <Checkout 
                cartItems={cartItems} 
                user={user} 
                onClearCart={handleClearCart} 
              />
            } 
          />

          {/* Knowledgebase & Documentation Routes */}
          <Route path="/docs" element={<Documentation />} />
          <Route path="/docs/help" element={<HelpCenter />} />
          <Route path="/help" element={<HelpCenter />} />

          {/* Auth & Access Control Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized" element={<UnauthorizedView />} />

          {/* Central Dashboard Redirect Router */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            } 
          />

          {/* Customer Dashboard View */}
          <Route 
            path="/dashboard/customer" 
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'SELLER', 'ADMIN']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Seller / Vendor Dashboard View */}
          <Route 
            path="/dashboard/seller" 
            element={
              <ProtectedRoute allowedRoles={['SELLER', 'ADMIN']}>
                <SellerDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Admin System Management Dashboard View */}
          <Route 
            path="/dashboard/admin" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Internal Provider Live Chat View */}
          <Route 
            path="/dashboard/chat" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SELLER']}>
                <ProviderChatPage user={user} />
              </ProtectedRoute>
            } 
          />

          {/* System Account Management */}
          <Route 
            path="/users" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Users />
              </ProtectedRoute>
            } 
          />

          {/* Fallback 404 Route */}
          <Route 
            path="*" 
            element={
              <div className="p-12 text-center text-slate-500 font-bold min-h-[50vh] flex items-center justify-center">
                404 - Page Not Found
              </div>
            } 
          />
        </Routes>
      </div>

      {/* Desktop Footer */}
      <Footer />

      {/* Mobile Navigation Bar */}
      <MobileBottomNav activeTab={getActiveTab()} setActiveTab={handleTabChange} />
    </div>
  );
};

// Root Content Container with Persistent Global Cart State
function AppContent() {
  const { user } = useAuth();

  // Lazy-initialize cart items from localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('hualink_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (err) {
      console.error('Failed to parse cart items from local storage:', err);
      return [];
    }
  });

  // Sync state changes with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hualink_cart', JSON.stringify(cartItems));
    } catch (err) {
      console.error('Failed to save cart to local storage:', err);
    }
  }, [cartItems]);

  const handleAddToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const prodId = product.id || product._id;
      const existingIndex = prevItems.findIndex((item) => (item.id || item._id) === prodId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prevItems, { ...product, id: prodId, quantity }];
    });
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => ((item.id || item._id) === id ? { ...item, quantity: newQuantity } : item))
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => (item.id || item._id) !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
    localStorage.removeItem('hualink_cart');
  };

  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <AppLayout 
        cartItems={cartItems}
        handleUpdateQuantity={handleUpdateQuantity}
        handleRemoveItem={handleRemoveItem}
        handleClearCart={handleClearCart}
        handleAddToCart={handleAddToCart}
        user={user}
      />
      </Router>
    </I18nextProvider>
  );
}

// Export Root Wrapped in AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}