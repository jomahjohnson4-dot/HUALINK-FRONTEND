import { useEffect, useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Filter,
  RefreshCw,
  ShieldCheck,
  WifiOff,
} from 'lucide-react';
import API from '../api/axios';
import { productsCatalog } from '../data/productsCatalog';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { ProductQuickView } from '../components/ProductModal';
import HorizontalProductShowcase from '../components/HorizontalProductShowcase';

/** Category pills — they mirror the catalogue's category values exactly. */
const CATEGORIES = [
  'All Categories',
  'Chargers & Cables',
  'Audio & Sound',
  'Smartphones',
  'Home Appliances',
  'Accessories',
];

export default function Marketplace() {
  // The signed-in shopper is passed to the chat widget so inquiries carry a
  // real name instead of a generic guest label.
  const { user } = useAuth();

  // The verified local catalogue is the guaranteed default state, so the
  // marketplace renders every inventory item immediately.
  const [products, setProducts] = useState(() => productsCatalog);
  const [feedOffline, setFeedOffline] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState(() => new Set());
  const [quickView, setQuickView] = useState(null);

  // Enhance the local catalogue with the live feed when the Express server is
  // reachable. Failures only flag the feed — the grid never empties.
  const loadProducts = () =>
    API.get('/products', { timeout: 5000 })
      .then((response) => {
        const data = response.data?.products || response.data?.data || response.data;
        if (Array.isArray(data) && data.length > 0) {
          setProducts((previous) => {
            const known = new Set(previous.map((item) => String(item.id)));
            const extras = data.filter(
              (item) => !known.has(String(item.id ?? item.productId ?? item._id))
            );
            return extras.length ? [...previous, ...extras] : previous;
          });
        }
        setFeedOffline(false);
      })
      .catch((err) => {
        console.warn('[Marketplace] Live feed unreachable — using local catalogue:', err.message);
        setFeedOffline(true);
      });

  useEffect(() => {
    loadProducts();
  }, []);

  const toggleWishlist = (product) => {
    setWishlist((current) => {
      const next = new Set(current);
      if (next.has(product.id)) next.delete(product.id);
      else next.add(product.id);
      return next;
    });
  };

  // Inquiry items are the only ones that need a page-level handler — cart
  // actions go through the shared cart context.
  const handleQuickAction = (product) => {
    if (product.action === 'inquiry') {
      setQuickView(null);
    }
  };

  // Category + search filtering: "All Categories" always shows everything.
  const filteredProducts = products.filter((product) => {
    const categoryName = String(product.category || '').toLowerCase().trim();
    const categorySlug = String(product.categorySlug || '').toLowerCase().trim();

    const matchesCategory =
      selectedCategory === 'All Categories' ||
      categoryName === selectedCategory.toLowerCase().trim() ||
      categorySlug === selectedCategory.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

    if (!matchesCategory) return false;

    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    return [product.name, product.title, product.description, product.category].some((field) =>
      String(field || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 pt-6 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Distribution Banner */}
        <div className="bg-gradient-to-r from-red-600 to-black rounded-3xl p-6 sm:p-10 mb-8 border border-red-900/40 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-black/50 border border-red-500/30 rounded-full px-3 py-1 text-xs font-bold text-red-400 mb-4 uppercase tracking-wider">
              <span>Direct Wholesale & Retail Inventory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tight text-white uppercase">
              Hualink Supply Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 font-medium">
              Verified product distribution directly from regional depots & trusted supply channels
              across Tanzania.
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
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/10 transition-colors"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-4 px-2">
                <Filter size={14} className="text-[#E50914]" />
                <span>Categories</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === category
                        ? 'bg-[#E50914] text-white shadow-md shadow-[#E50914]/25'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Distribution Verification Badge Box */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-[#E50914] shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900 uppercase">
                    Guaranteed Quality
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Every batch item listed on Hualink is quality checked at local hubs before
                    dispatch.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Product Grid */}
          <div className="lg:col-span-3">
            {/* Header bar for product list */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Showing{' '}
                <span className="text-gray-900 font-extrabold">{filteredProducts.length}</span>{' '}
                Products
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <SlidersHorizontal size={14} />
                <span>Default Sort: Direct Supply First</span>
              </div>
            </div>

            {/* Offline live-feed notice (the local catalogue keeps rendering) */}
            {feedOffline && (
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 mb-5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <WifiOff size={15} className="text-amber-500 shrink-0" />
                  <span>Live inventory feed offline — showing the full local catalogue.</span>
                </div>
                <button
                  type="button"
                  onClick={loadProducts}
                  className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#E50914] hover:underline cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                <p className="text-gray-700 font-bold text-sm">No inventory items found.</p>
                <p className="text-xs text-gray-500 mt-1">
                  Try searching for a different item or switching categories.
                </p>
              </div>
            )}

            {/* Product Grid */}
            {filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id || product._id || `item-${index}`}
                    index={index}
                    product={product}
                    isWishlisted={wishlist.has(product.id)}
                    onToggleWishlist={toggleWishlist}
                    onQuickView={setQuickView}
                    onAction={handleQuickAction}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Carousels: "All Product Items" & "Bestseller Products" */}
        <HorizontalProductShowcase />
      </div>

      <ProductQuickView
        product={quickView}
        onClose={() => setQuickView(null)}
        onAction={handleQuickAction}
        currentUser={user}
      />
    </div>
  );
}
