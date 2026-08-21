import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Register from './pages/Register';
import Login from './pages/Login';
import Outlets from './pages/Outlets';
import Services from './pages/Services';
import Explore from './pages/Explore';
import Checkout from './pages/Checkout';
import Documentation from './pages/Documentation';
import HelpCenter from './pages/HelpCenter';

// Dashboard Views
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { SellerDashboard } from './pages/dashboards/SellerDashboard';
import { CustomerDashboard } from './pages/dashboards/CustomerDashboard';

// Role-Based Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="p-10 text-center font-semibold text-slate-400 bg-slate-900 min-h-screen">Loading application...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role?.toUpperCase())) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Auto-Redirect Wrapper for Central /dashboard Route
const DashboardRedirect = () => {
  const { user } = useAuth();
  const role = user?.role?.toUpperCase();

  if (role === 'ADMIN') return <Navigate to="/dashboard/admin" replace />;
  if (role === 'SELLER') return <Navigate to="/dashboard/seller" replace />;
  return <Navigate to="/dashboard/customer" replace />;
};

// Main App Layout & Routing Content
function AppContent() {
  const { user } = useAuth();

  // Global State for Shopping Cart
  const [cartItems, setCartItems] = useState([]);

  // Cart Management Handlers
  const handleAddToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prevItems, { ...product, quantity }];
    });
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <Router>
      <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between">
        <div>
          <Navbar 
            cartItems={cartItems} 
            onUpdateQuantity={handleUpdateQuantity} 
            onRemoveItem={handleRemoveItem}
            user={user}
          />
          <Routes>
            <Route path="/" element={<Landing />} />
            
            {/* Products & Marketplace Routes */}
            <Route path="/shop" element={<Products onAddToCart={handleAddToCart} />} />
            <Route path="/marketplace" element={<Products onAddToCart={handleAddToCart} />} />
            <Route path="/product/:id" element={<ProductDetail onAddToCart={handleAddToCart} />} />
            
            {/* Network & Service Routes */}
            <Route path="/outlets" element={<Outlets />} />
            <Route path="/services" element={<Services />} />
            <Route path="/explore" element={<Explore />} />
            
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

            {/* Auth Routes */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Central Dashboard Redirect Router */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              } 
            />

            {/* Customer Dashboard */}
            <Route 
              path="/dashboard/customer" 
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER', 'SELLER', 'ADMIN']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Seller Dashboard */}
            <Route 
              path="/dashboard/seller" 
              element={
                <ProtectedRoute allowedRoles={['SELLER', 'ADMIN']}>
                  <SellerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Admin Dashboard */}
            <Route 
              path="/dashboard/admin" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Protected Management Routes */}
            <Route 
              path="/users" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Users />
                </ProtectedRoute>
              } 
            />

            {/* Fallback 404 Route */}
            <Route path="*" element={<div className="p-10 text-center text-slate-600 font-bold">404 - Page Not Found</div>} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

// Root App Export wrapped in AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}