import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

export default function App() {
  // Global State for Shopping Cart & User Session
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);

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

  const handleAuthSuccess = (userData) => {
    setUser(userData);
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
            <Route path="/shop" element={<Products onAddToCart={handleAddToCart} />} />
            <Route path="/product/:id" element={<ProductDetail onAddToCart={handleAddToCart} />} />
            <Route path="/outlets" element={<Outlets />} />
            <Route path="/services" element={<Services />} />
            <Route path="/explore" element={<Explore />} />
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
            <Route path="/users" element={<Users />} />
            <Route path="/register" element={<Register onRegisterSuccess={handleAuthSuccess} />} />
            <Route path="/login" element={<Login onLoginSuccess={handleAuthSuccess} />} />
            <Route path="*" element={<div className="p-10 text-center text-slate-600 font-bold">404 - Page Not Found</div>} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}