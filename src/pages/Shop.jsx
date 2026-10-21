import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Eye, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { getProducts } from '../api/productService';
import { useCart } from '../context/CartContext';

export default function Shop() {
  const { addToCart, openCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedId, setAddedId] = useState(null);

  // Categories aligned with Hualink & TeKeL offerings
  const categories = [
    'All',
    'Electronics',
    'Networking Maintenance',
    'Office Furniture',
    'TeKeL Branding & Print'
  ];

  /**
   * Fetch live inventory straight from the backend. Category and search are
   * pushed to the server so the results always reflect the database.
   */
  const fetchProducts = useCallback(async (category, search) => {
    setLoading(true);
    setError(null);

    try {
      const { products: list } = await getProducts({
        category: category && category !== 'All' ? category : undefined,
        search: search?.trim() || undefined,
        availableOnly: true,
        limit: 200,
      });
      setProducts(list);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
      setError('Could not reach the inventory service. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts(selectedCategory, searchQuery);
  }, [fetchProducts, selectedCategory, searchQuery]);

  // Handle Add To Cart with button feedback
  const handleAddClick = (product) => {
    addToCart(product, 1);
    openCart();
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 py-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Page Header */}
        <div className="mb-8 space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-red-600">
            Hualink Distribution
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Product Catalog & Regional Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Browse verified hardware stock, networking maintenance components, and corporate branding solutions.
          </p>
        </div>

        {/* Filter & Search Bar Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-red-600 transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <Filter size={16} className="text-slate-400 shrink-0 hidden sm:block mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Products Grid / Loading State */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <RefreshCw size={28} className="animate-spin text-red-600" />
            <p className="text-xs font-bold text-slate-500">Loading inventory from server...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <AlertCircle size={32} className="mx-auto text-rose-500" />
            <p className="text-sm font-bold text-slate-700">{error}</p>
            <button
              type="button"
              onClick={() => fetchProducts(selectedCategory, searchQuery)}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Retry</span>
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
            <p className="text-sm font-bold text-slate-600">No products found matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div 
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-red-500/30 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Product Image: clean borderless canvas, subject isolated */}
                  <div className="relative h-52 bg-white overflow-hidden flex items-center justify-center p-3">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {product.category}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-5 space-y-2">
                    <h3 className="font-extrabold text-slate-900 text-base line-clamp-1 group-hover:text-red-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="p-5 pt-0 space-y-3">
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Price</span>
                      <span className="text-base font-black text-slate-900">
                        {Number(product.price || 0).toLocaleString()} TZS
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      product.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/product/${product.id}`}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all"
                    >
                      <Eye size={14} />
                      <span>Details</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleAddClick(product)}
                      disabled={product.stock <= 0}
                      className={`w-full py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all shadow-md cursor-pointer ${
                        addedId === product.id
                          ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                          : product.stock <= 0
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                          : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                      }`}
                    >
                      {addedId === product.id ? (
                        <>
                          <Check size={14} />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={14} />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
