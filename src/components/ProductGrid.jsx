import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Upload,
  Grid,
  List,
  Filter,
  Star,
  ShoppingCart,
} from 'lucide-react';
import { GRID_PRODUCTS } from './productsGridData';
import { uploadImage } from '../api/imageService';
import { useTranslation } from 'react-i18next';

// Hydrate custom images from sessionStorage on initial render
const initialCustomImages = {};
GRID_PRODUCTS.forEach((product) => {
  const stored = sessionStorage.getItem(`card_image_${product.id}`);
  if (stored) {
    initialCustomImages[product.id] = stored;
  }
});

const STAR_RATINGS = [4.8, 4.5, 4.9, 4.7, 4.6, 4.4, 4.9, 4.3, 4.8, 4.6, 4.7, 4.5, 4.9, 4.4, 4.6, 4.8];
const REVIEW_COUNTS = ['1.2K', '856', '2.1K', '640', '432', '1.8K', '950', '310', '1.1K', '720', '1.4K', '590', '2.3K', '870', '1.9K', '1.05K'];

export default function ProductGrid() {
  const { t } = useTranslation();

  // Map of productId -> base64 image string from sessionStorage
  const [customImages, setCustomImages] = useState(initialCustomImages);
  const [isUploading, setIsUploading] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');

  const FILTERS = [
    { id: 'all', label: 'All Categories' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'smartphones', label: 'Smartphones' },
    { id: 'tv', label: 'TVs' },
    { id: 'chargers', label: 'Chargers' },
  ];

  // Convert file to Base64, upload via API, save to sessionStorage
  const handleImageUpload = useCallback(
    async (event, productId) => {
      const file = event.target.files[0];
      if (!file) return;

      setIsUploading((prev) => ({ ...prev, [productId]: true }));

      try {
        // Upload via API service (falls back to sessionStorage if API fails)
        const imageUrl = await uploadImage(file, productId);

        setCustomImages((prev) => ({ ...prev, [productId]: imageUrl }));
      } catch (err) {
        console.error('[ProductGrid] Upload failed:', err);
      } finally {
        setIsUploading((prev) => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
      }
    },
    []
  );

  const filteredProducts = GRID_PRODUCTS.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'electronics' && /smartphone|laptop|tv|charger|tech/i.test(p.title)) return true;
    if (filter === 'smartphones' && /smartphone/i.test(p.title)) return true;
    if (filter === 'tv' && /tv/i.test(p.title)) return true;
    if (filter === 'chargers' && /charger/i.test(p.title)) return true;
    return false;
  });

  const handleAddToCart = (product) => {
    window.location.href = `/shop?add=${product.id}`;
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return (
      <span className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={12}
            className={`${
              i < full
                ? 'fill-amber-400 text-amber-400'
                : i === full && hasHalf
                ? 'fill-amber-400 text-amber-400/50'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-[10px] text-gray-600 font-medium ml-0.5">{rating}</span>
      </span>
    );
  };

  return (
    <section className="bg-white min-h-screen py-6 my-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ================= AMAZON-STYLE HEADER DIV ================= */}
        <div className="mb-6 border-b border-gray-200 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-black tracking-tight">
                {t('common.marketplace')}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Discover high-converting products from verified Hualink suppliers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View mode toggle */}
              <div className="flex items-center bg-white border border-gray-300 rounded-sm p-0.5 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-sm transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-[#E50914] text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid size={14} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-sm transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[#E50914] text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  aria-label="List view"
                >
                  <List size={14} />
                </button>
              </div>

              {/* Filter dropdown */}
              <div className="relative">
                <button
                  onClick={() => setFilter((f) => (f === 'all' ? 'electronics' : 'all'))}
                  className="flex items-center gap-2 bg-white border border-gray-300 text-xs font-medium text-gray-700 px-3 py-2 rounded-sm cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Filter size={14} className="text-gray-500" />
                  <span>{filter === 'all' ? 'All Categories' : filter}</span>
                </button>
              </div>

              <Link
                to="/shop"
                className="text-xs font-bold text-[#E50914] hover:text-[#C0040F] transition-colors"
              >
                {t('common.viewAll')} <Grid size={12} className="ml-0.5" />
              </Link>
            </div>
          </div>

          {/* Filter pills (Amazon style) */}
          <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
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

        {/* ================= AMAZON-STYLE UPLOAD PRODUCT CARDS GRID ================= */}
        <div
          className={`grid gap-3 ${
            viewMode === 'grid'
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
              : 'grid-cols-1'
          }`}
        >
          {filteredProducts.map((product, idx) => {
            const customImage = customImages[product.id];
            const rating = STAR_RATINGS[idx % STAR_RATINGS.length];
            const reviewCount = REVIEW_COUNTS[idx % REVIEW_COUNTS.length];
            const isSponsored = idx % 4 === 0; // Every 4th product is "sponsored"
            const uploading = isUploading[product.id];

            return (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-sm p-2 flex flex-col h-full group relative transition-all duration-200 hover:border-[#E50914]/50 hover:shadow-md"
              >
                {/* Sponsored badge */}
                {isSponsored && (
                  <span className="absolute top-1 left-1 z-10 bg-[#E50914] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                    Sponsored
                  </span>
                )}

                {/* Upload image container */}
                <div className="relative overflow-hidden rounded-sm bg-gray-50 border border-gray-100 flex items-center justify-center mb-2 group cursor-pointer aspect-square">
                  {customImage ? (
                    <img
                      src={customImage}
                      alt={`${product.title} (custom)`}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 p-1"
                    />
                  ) : (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 p-1"
                    />
                  )}

                  {/* Uploading overlay */}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] text-white font-bold">Uploading...</span>
                      </div>
                    </div>
                  )}

                  {/* Upload overlay button */}
                  {!uploading && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(
                          `file-upload-${product.id}`
                        )?.click();
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                      aria-label="Upload Custom Image"
                    >
                      <Upload size={14} className="text-white" />
                      <span className="text-[9px] text-white font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Upload Image
                      </span>
                    </button>
                  )}
                  <input
                    id={`file-upload-${product.id}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, product.id)}
                  />
                </div>

                {/* Prime / Verified badge row */}
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1 py-0.5 rounded border border-blue-100">
                    Prime
                  </span>
                  <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1 py-0.5 rounded border border-green-100">
                    {product.badge}
                  </span>
                </div>

                {/* Product title */}
                <Link
                  to={`/product/${product.id}`}
                  className="text-[11px] font-medium text-black line-clamp-2 mb-1 leading-tight group-hover:text-[#E50914] transition-colors cursor-pointer"
                >
                  {product.title}
                </Link>

                {/* Rating row */}
                <div className="flex items-center gap-1 mb-1">
                  {renderStars(rating)}
                  <span className="text-[10px] text-gray-600 font-medium">({reviewCount})</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-sm font-bold text-black">
                    {product.price}
                  </span>
                </div>

                {/* Delivery info */}
                <div className="flex items-center gap-1 text-[10px] text-gray-600 mb-2">
                  <span className="flex items-center gap-0.5 text-blue-600 font-medium">
                    FREE delivery
                  </span>
                  <span className="text-gray-500">Tue, Oct 20</span>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToCart(product);
                  }}
                  className="w-full bg-[#E50914] hover:bg-[#C0040F] text-white text-[11px] font-bold py-2 rounded-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-[#E50914]/30 mb-1"
                >
                  <ShoppingCart size={12} />
                  <span>Add to Cart</span>
                </button>

                {/* Buy Now button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/checkout?add=${product.id}`;
                  }}
                  className="w-full bg-white border border-gray-300 text-black text-[11px] font-bold py-2 rounded-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  Buy Now
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
