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

// Protected Route Component for Auth-Gated Pages
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="p-10 text-center font-semibold text-gray-600">Loading application...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
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

            {/* Protected Admin/Management Routes */}
            <Route 
              path="/users" 
              element={
                <ProtectedRoute>
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