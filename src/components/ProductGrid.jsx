import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Filter, Grid, LayoutGrid } from 'lucide-react';
import ProductCard, { ViewToggle } from './ProductCard';
import { ProductQuickView } from './ProductModal';
import { PRODUCTS, GRID_FILTERS } from './productsData';

/**
 * Translation key for every shelf chip.
 *
 * The catalogue stores the raw English shelf label, so the visible text is
 * resolved through the shared `categories.*` dictionary instead.
 */
const FILTER_LABEL_KEYS = {
  all: 'categories.allCategories',
  'chargers-cables': 'categories.chargersCables',
  audio: 'categories.audioSound',
  accessories: 'categories.accessories',
  smartphones: 'categories.smartphones',
  'home-appliances': 'categories.homeAppliances',
};

export default function ProductGrid({ onInquiry }) {
  // Every heading, chip and button follows the active language.
  const { t } = useTranslation();

  const [viewMode, setViewMode] = useState('grid');
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [wishlist, setWishlist] = useState(() => new Set());
  const [quickView, setQuickView] = useState(null);
  const [feedbackId, setFeedbackId] = useState(null);
  const feedbackTimer = useRef(null);

  // The category is driven by the URL (?category=audio) so the showcase cards
  // and the product breadcrumb can deep link into a shelf and the state stays
  // shareable. An unknown slug falls back to the full catalogue.
  const categoryParam = searchParams.get('category');
  const filter = GRID_FILTERS.some((f) => f.id === categoryParam) ? categoryParam : 'all';

  // Localised label of the shelf that is currently on screen.
  const filterLabel = (id) => t(FILTER_LABEL_KEYS[id] || 'categories.allCategories');

  // Deep links such as /?category=audio#featured scroll down to the grid.
  useEffect(() => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash, categoryParam]);

  const handleFilterChange = (id) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id === 'all') next.delete('category');
        else next.set('category', id);
        return next;
      },
      { replace: true }
    );
  };

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

  // Inquiry items are routed to the sales desk; every other product is added
  // to the shared cart by the card / quick view themselves.
  const handleAction = (product) => {
    if (product.action !== 'inquiry') return;

    onInquiry?.(product);

    setFeedbackId(product.id);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedbackId(null), 1500);
  };

  return (
    <section id="featured" className="bg-white min-h-screen py-12 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="mb-12 border-b border-gray-200 pb-6 mt-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {t('common.marketplace')}
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                {t('catalog.subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ViewToggle viewMode={viewMode} onChange={setViewMode} />

              <div className="relative">
                <button
                  onClick={() => {
                    // Cycle through the available category chips so the button
                    // always lands on a shelf that actually holds products.
                    const index = GRID_FILTERS.findIndex((f) => f.id === filter);
                    const next = GRID_FILTERS[(index + 1) % GRID_FILTERS.length];
                    handleFilterChange(next.id);
                  }}
                  className="flex items-center gap-2 bg-white border border-gray-300 text-xs font-medium text-gray-700 px-3 py-2 rounded-sm cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Filter size={14} className="text-gray-500" />
                  <span>{filterLabel(filter)}</span>
                </button>
              </div>

              <Link
                to="/shop"
                className="text-xs font-bold text-[#E50914] hover:text-[#C0040F] transition-colors"
              >
                {t('common.viewAll')}
                <Grid size={12} className="ml-0.5" />
              </Link>
            </div>
          </div>

          <div className="mt-6 mb-6 lg:mt-0 lg:mb-0">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <LayoutGrid size={18} className="text-[#E50914]" />
              <span>{t('shop.categories')}</span>
            </h2>

            <div className="flex flex-wrap gap-2">
              {GRID_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleFilterChange(f.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border cursor-pointer ${
                    filter === f.id
                      ? 'bg-[#E50914] text-white border-[#E50914]'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-[#E50914] hover:border-[#E50914]'
                  }`}
                >
                  {filterLabel(f.id)}
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
