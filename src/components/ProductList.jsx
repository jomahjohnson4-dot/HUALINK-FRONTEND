import { useEffect, useMemo, useRef, useState } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';
import { getProducts } from '../api/productService';
import ProductCard, { ViewToggle } from './ProductCard';
import { ProductQuickView } from './ProductModal';
import { PRODUCTS, normalizeProduct } from './productsData';

/**
 * Product list surface.
 *
 * Data is resolved in this order:
 *   1. `products` prop  — dynamic injection from a parent component
 *   2. `productService` — live GET /products from the Express backend
 *   3. `productsData`   — bundled Hualink catalogue used as the offline fallback
 *
 * Both the grid and the list view render the same ProductCard, so the hover
 * scale animation and the #E50914 brand accents survive a view toggle.
 */
export default function ProductList({ products: productsProp, onInquiry }) {
  const [remoteProducts, setRemoteProducts] = useState([]);
  const [remoteStatus, setRemoteStatus] = useState(productsProp ? 'ready' : 'loading');
  const [remoteError, setRemoteError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [wishlist, setWishlist] = useState(() => new Set());
  const [quickView, setQuickView] = useState(null);
  const [feedbackId, setFeedbackId] = useState(null);
  const feedbackTimer = useRef(null);

  // The spinner only shows while we are actually waiting on the API.
  const loading = !productsProp && remoteStatus === 'loading';

  useEffect(() => {
    if (productsProp) return undefined;

    let cancelled = false;

    getProducts()
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : [];
        setRemoteProducts(list);
        setRemoteError(null);
        setRemoteStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setRemoteError(err.response?.data?.message || 'Failed to fetch products');
        setRemoteProducts([]);
        setRemoteStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [productsProp]);

  const products = useMemo(() => {
    const source = productsProp ?? (remoteProducts.length ? remoteProducts : PRODUCTS);
    return source.map((raw, index) => normalizeProduct(raw, index));
  }, [productsProp, remoteProducts]);

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

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
        <RefreshCw size={28} className="animate-spin text-[#E50914]" />
        <p className="text-xs font-bold text-gray-500">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Products</h2>
          <p className="text-sm text-gray-600 mt-1">
            {products.length} item{products.length === 1 ? '' : 's'} from verified Hualink suppliers.
          </p>
        </div>

        <ViewToggle viewMode={viewMode} onChange={setViewMode} />
      </div>

      {remoteError ? (
        <div className="flex items-center gap-2 mb-5 bg-[#E50914]/5 border border-[#E50914]/20 text-[#E50914] text-xs font-bold px-3 py-2.5 rounded-xl">
          <WifiOff size={14} />
          <span>
            Live catalogue unavailable — showing the bundled Hualink catalogue instead.
          </span>
        </div>
      ) : null}

      {products.length === 0 ? (
        <p className="text-sm font-bold text-gray-600 py-10 text-center">
          No products found matching your search criteria.
        </p>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
              : 'grid grid-cols-1 gap-4'
          }
        >
          {products.map((product, index) => (
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
      )}

      <ProductQuickView
        product={quickView}
        onClose={() => setQuickView(null)}
        onAction={handleAction}
      />
    </div>
  );
}
