import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Grid, LayoutGrid } from 'lucide-react';
import ProductCard, { ProductQuickView, ViewToggle } from './ProductCard';
import { PRODUCTS, GRID_FILTERS } from './productsData';

export default function ProductGrid({ onAddToCart, onInquiry }) {
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [wishlist, setWishlist] = useState(() => new Set());
  const [quickView, setQuickView] = useState(null);
  const [feedbackId, setFeedbackId] = useState(null);
  const feedbackTimer = useRef(null);

  const filteredProducts = useMemo(() => {
    if (filter === 'all') return PRODUCTS;
    return PRODUCTS.filter((product) => product.categorySlug === filter);
  }, [filter]);

  const toggleWishlist = (product) => {
    setWishlist((current) => {
      const next = new Set(current);
      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        next.add(product.id);
      }
      return next;
    });
  };

  const handleAction = (product) => {
    if (product.action === 'inquiry') {
      onInquiry?.(product);
    } else {
      onAddToCart?.(product, 1);
    }

    setFeedbackId(product.id);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedbackId(null), 1500);
  };

  return (
    <section className="bg-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="mb-12 border-b border-gray-200 pb-6 mt-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Marketplace
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Discover high-converting products from verified Hualink suppliers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ViewToggle viewMode={viewMode} onChange={setViewMode} />

              <div className="relative">
                <button
                  onClick={() => setFilter((f) => (f === 'all' ? 'electronics' : 'all'))}
                  className="flex items-center gap-2 bg-white border border-gray-300 text-xs font-medium text-gray-700 px-3 py-2 rounded-sm cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Filter size={14} className="text-gray-500" />
                  <span>
                    {filter === 'all'
                      ? 'All Categories'
                      : GRID_FILTERS.find((f) => f.id === filter)?.label || filter}
                  </span>
                </button>
              </div>

              <Link
                to="/shop"
                className="text-xs font-bold text-[#E50914] hover:text-[#C0040F] transition-colors"
              >
                View All
                <Grid size={12} className="ml-0.5" />
              </Link>
            </div>
          </div>

          <div className="mt-6 mb-6 lg:mt-0 lg:mb-0">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <LayoutGrid size={18} className="text-[#E50914]" />
              <span>Categories</span>
            </h2>

            <div className="flex flex-wrap gap-2">
              {GRID_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border cursor-pointer ${
                    filter === f.id
                      ? 'bg-[#E50914] text-white border-[#E50914]'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-[#E50914] hover:border-[#E50914]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
              : 'grid grid-cols-1 gap-4'
          }
        >
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              index={index}
              product={product}
              layout={viewMode}
              isWishlisted={wishlist.has(product.id)}
              onToggleWishlist={toggleWishlist}
              onQuickView={setQuickView}
              onAction={handleAction}
              actionState={feedbackId === product.id ? 'done' : null}
            />
          ))}
        </div>
      </div>

      <ProductQuickView
        product={quickView}
        onClose={() => setQuickView(null)}
        onAction={handleAction}
      />
    </section>
  );
}
