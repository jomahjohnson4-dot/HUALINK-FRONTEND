import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid,
  List,
  Filter,
  Star,
} from 'lucide-react';
import { GRID_PRODUCTS } from './productsGridData';

const STAR_RATINGS = [4.8, 4.5, 4.9, 4.7, 4.6, 4.4, 4.9, 4.3, 4.8, 4.6, 4.7, 4.5, 4.9, 4.4, 4.6, 4.8];
const REVIEW_COUNTS = ['1.2K', '856', '2.1K', '640', '432', '1.8K', '950', '310', '1.1K', '720', '1.4K', '590', '2.3K', '870', '1.9K', '1.05K'];

const DISCOUNT_BADGES = [undefined, '-30%', undefined, '-20%', undefined, '-50%', undefined, '-25%', undefined, '-35%', undefined, '-40%', undefined, undefined, undefined, undefined];

export default function ProductGrid() {
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');

  const FILTERS = [
    { id: 'all', label: 'All Categories' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'smartphones', label: 'Smartphones' },
    { id: 'tv', label: 'TVs' },
    { id: 'chargers', label: 'Chargers' },
  ];

  const filteredProducts = GRID_PRODUCTS.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'electronics' && /smartphone|laptop|tv|charger|tech/i.test(p.title)) return true;
    if (filter === 'smartphones' && /smartphone/i.test(p.title)) return true;
    if (filter === 'tv' && /tv/i.test(p.title)) return true;
    if (filter === 'chargers' && /charger/i.test(p.title)) return true;
    return false;
  });

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return (
      <span className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={10}
            className={`${
              i < full
                ? 'fill-amber-400 text-amber-400'
                : i === full && hasHalf
                ? 'fill-amber-400 text-amber-400/50'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-[10px] text-gray-600 font-bold ml-0.5">{rating}</span>
      </span>
    );
  };

  return (
    <section className="bg-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="mb-12 border-b border-gray-200 pb-6 mt-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Marketplace
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Discover high-converting products from verified Hualink suppliers.
              </p>
            </div>

            <div className="flex items-center gap-3">
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
                View All
                <Grid size={12} className="ml-0.5" />
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-6 mb-6 lg:mt-0 lg:mb-0">
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

        <div
          className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6'
              : 'grid-cols-1'
          }`}
        >
          {filteredProducts.map((product, idx) => {
            const rating = STAR_RATINGS[idx % STAR_RATINGS.length];
            const reviewCount = REVIEW_COUNTS[idx % REVIEW_COUNTS.length];
            const discountBadge = DISCOUNT_BADGES[idx % DISCOUNT_BADGES.length];

            return (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="block"
              >
                <div className="bg-white p-3 rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer group flex flex-col justify-between border border-gray-100">
                  <div className="relative w-full h-40 flex items-center justify-center p-2 overflow-hidden bg-white group">
                    {discountBadge && (
                      <span className="absolute top-2 left-2 z-10 bg-[#E50914] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {discountBadge}
                      </span>
                    )}
                    <img
                      src={product.image}
                      alt={product.title}
                      className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 mt-2 group-hover:text-[#E50914] transition-colors">
                    {product.title}
                  </h3>

                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-sm font-extrabold text-[#E50914]">
                      {product.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1.5">
                    {renderStars(rating)}
                    <span className="text-[10px] text-[#10b981] font-bold flex items-center gap-1">
                      ({reviewCount})
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}