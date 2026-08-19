import { useState, useEffect } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Smartphone, 
  Tv, 
  Home, 
  Shirt, 
  Boxes, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  Zap,
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import API from '../api/axios';

const CATEGORIES = [
  { id: 'all', name: 'All Inventory', icon: Boxes },
  { id: 'smartphones', name: 'Smartphones & Mobile', icon: Smartphone },
  { id: 'electronics', name: 'Electronics & Gadgets', icon: Tv },
  { id: 'home', name: 'Home & Living', icon: Home },
  { id: 'fashion', name: 'Fashion & Apparel', icon: Shirt },
];

export default function Products({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch product inventory from Express backend
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/products');
      const data = response.data?.products || response.data?.data || response.data;
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load inventory from Express server:', err);
      setError(
        err.response?.data?.message || 'Unable to connect to inventory server. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchInventory = async () => {
      setError(null);
      try {
        const response = await API.get('/products');
        const data = response.data?.products || response.data?.data || response.data;
        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load inventory from Express server:', err);
        if (isMounted) {
          setError(
            err.response?.data?.message || 'Unable to connect to inventory server. Please try again.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInventory();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products by category and search query
  const filteredProducts = products.filter((product) => {
    const productCategory = product.category ? product.category.toLowerCase() : '';
    const matchesCategory =
      selectedCategory === 'all' || productCategory === selectedCategory.toLowerCase();

    const matchesSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-gray-900 min-h-screen text-white pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top Distribution Banner */}
        <div className="bg-gradient-to-r from-red-600 to-black rounded-3xl p-6 sm:p-10 mb-8 border border-red-900/40 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-black/50 border border-red-500/30 rounded-full px-3 py-1 text-xs font-bold text-red-400 mb-4 uppercase tracking-wider">
              <Zap size={14} />
              <span>Direct Wholesale & Retail Inventory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tight text-white uppercase">
              Hualink Supply Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 font-medium">
              Verified product distribution directly from regional depots & trusted supply channels across Tanzania.
            </p>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Search Input */}
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search inventory, SKUs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Category Navigation Panel */}
            <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4 px-2">
                <Filter size={14} className="text-red-500" />
                <span>Categories</span>
              </div>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                          : 'text-gray-300 hover:bg-gray-700/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} />
                        <span>{cat.name}</span>
                      </div>
                      <ChevronRight size={14} className={isActive ? 'text-white' : 'text-gray-500'} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Distribution Verification Badge Box */}
            <div className="bg-gray-800/50 border border-gray-700/60 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-red-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-xs font-extrabold text-white uppercase">Guaranteed Quality</h4>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Every batch item listed on Hualink is quality checked at local hubs before dispatch.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Product Grid */}
          <div className="lg:col-span-3">
            
            {/* Header bar for product list */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-800">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Showing <span className="text-white font-extrabold">{filteredProducts.length}</span> Products
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <SlidersHorizontal size={14} />
                <span>Default Sort: Direct Supply First</span>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                <Loader2 size={36} className="animate-spin text-red-500" />
                <p className="text-xs font-bold uppercase tracking-wider">Loading Live Inventory...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-gray-800/90 border border-red-900/50 rounded-2xl p-8 text-center max-w-lg mx-auto my-8">
                <AlertCircle size={36} className="text-red-500 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white uppercase mb-1">Failed to Load Products</h3>
                <p className="text-xs text-gray-400 font-medium mb-5">{error}</p>
                <button
                  onClick={loadProducts}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-red-600/30"
                >
                  <RefreshCw size={14} />
                  <span>Retry Connection</span>
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredProducts.length === 0 && (
              <div className="text-center py-20 bg-gray-800/40 rounded-2xl border border-gray-800">
                <p className="text-gray-300 font-bold text-sm">No inventory items found.</p>
                <p className="text-xs text-gray-500 mt-1">Try searching for a different item or switching categories.</p>
              </div>
            )}

            {/* Product Grid */}
            {!loading && !error && filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gray-800 border border-gray-700/70 hover:border-red-600/60 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group shadow-lg"
                  >
                    <div>
                      {/* Image Header */}
                      <div className="relative h-48 bg-gray-900 overflow-hidden">
                        {product.imageUrl || product.image ? (
                          <img
                            src={product.imageUrl || product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-black text-gray-600 uppercase tracking-widest">
                            Hualink Depot
                          </div>
                        )}
                        <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-red-500 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-red-500/30 uppercase tracking-wider">
                          {product.tag || product.category || 'Direct Supply'}
                        </span>
                      </div>

                      {/* Card Content */}
                      <div className="p-4">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1">
                          <CheckCircle2 size={13} className="text-red-500" />
                          <span>{product.location || 'Dar es Salaam Hub'}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                          {product.name}
                        </h3>

                        {/* Stock & Wholesale Info */}
                        <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-gray-400">Retail Unit:</span>
                            <span className="font-extrabold text-white">
                              {typeof product.price === 'number'
                                ? `${product.price.toLocaleString()} TSH`
                                : product.price}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-gray-400">Wholesale Tier:</span>
                            <span className="font-bold text-red-400">
                              {product.wholesalePrice || 'Bulk Rates Available'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="p-4 pt-0">
                      <button
                        onClick={() => onAddToCart && onAddToCart(product)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Order Supply</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}