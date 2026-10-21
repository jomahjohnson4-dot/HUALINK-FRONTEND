import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { productsCatalog } from '../data/productsCatalog';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80';

const CATEGORIES = [
  'All',
  'Chargers & Cables',
  'Audio & Sound',
  'Smartphones',
  'Home Appliances',
  'Accessories',
];

function ShowcaseCard({ product, index }) {
  // Discount percentage: explicit catalogue value first, otherwise derived
  // from the price strings ("TSh 25,000" / "TSh 35,000").
  const currentPrice = Number(String(product.price ?? '').replace(/[^0-9]/g, ''));
  const originalPrice = Number(String(product.originalPrice ?? '').replace(/[^0-9]/g, ''));
  const derivedDiscount =
    currentPrice > 0 && originalPrice > currentPrice
      ? Math.round((1 - currentPrice / originalPrice) * 100)
      : 0;
  const explicitDiscount = Number(product.discount);
  const discountPercent =
    Number.isFinite(explicitDiscount) && explicitDiscount > 0
      ? Math.round(explicitDiscount)
      : derivedDiscount;

  return (
    <div
      className="animate-fade-in-up min-w-[260px] max-w-[280px] shrink-0 bg-white border border-gray-200 rounded-2xl p-3.5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300 ease-out cursor-pointer group relative"
      style={{ animationDelay: `${(index % 8) * 60}ms` }}
    >
      {/* Top-Left Badge: bright blue discount takes priority over brand badge */}
      {discountPercent > 0 ? (
        <span className="absolute top-5 left-5 z-10 bg-[#0070DC] text-white text-[10px] font-black px-2 py-1 rounded shadow-sm uppercase tracking-wide pointer-events-none">
          {discountPercent}% OFF
        </span>
      ) : product.badge ? (
        <span className="absolute top-5 left-5 z-10 bg-[#E50914] text-white text-[10px] font-black px-2 py-1 rounded shadow-sm uppercase tracking-wide pointer-events-none">
          {product.badge}
        </span>
      ) : null}

      {/* Clean Borderless Product Image — subject isolated on the card canvas */}
      <div className="relative h-52 bg-white rounded-xl overflow-hidden mb-3 flex items-center justify-center p-3">
        <img
          src={product.image || product.thumbnail || product.thumbnails?.[0] || FALLBACK_IMAGE}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.src = FALLBACK_IMAGE;
          }}
        />
      </div>

      {/* Product Details */}
      <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug mb-2 min-h-[2.5rem] group-hover:text-[#0070DC] transition-colors">
        {product.name}
      </h3>

      {/* Price Layout: "From TSh ..." */}
      <div className="flex items-baseline gap-1.5 mb-1.5 flex-wrap">
        <span className="text-xs font-extrabold text-gray-900 tracking-tight">
          From {product.price}
        </span>
        {product.originalPrice && (
          <span className="text-[10px] font-medium text-gray-400 line-through">
            {product.originalPrice}
          </span>
        )}
      </div>

      {/* Yellow Star Rating */}
      <div className="flex items-center gap-1 text-[11px] text-gray-500">
        <Star size={12} className="text-amber-400 fill-amber-400" />
        <span className="font-bold text-gray-800">{product.rating || '4.7'}</span>
        <span className="text-gray-400">({product.reviewsCount || '412'})</span>
      </div>
    </div>
  );
}

function CarouselGroup({ title, products, scrollRef }) {
  const scroll = (direction) => {
    scrollRef.current?.scrollBy({ left: direction * 340, behavior: 'smooth' });
  };

  return (
    <div className="relative space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">
          {title}
        </h2>
        <Link
          to="/shop"
          className="text-xs font-bold text-gray-500 hover:text-gray-900 border border-gray-300 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
          View More
        </Link>
      </div>

      {/* Carousel Side Navigation Arrows */}
      <button
        type="button"
        aria-label={`Scroll ${title} left`}
        onClick={() => scroll(-1)}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white border border-gray-200 text-gray-700 hover:bg-[#E50914] hover:text-white hover:border-[#E50914] rounded-full flex items-center justify-center shadow-md transition-all duration-200 active:scale-90 cursor-pointer"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        aria-label={`Scroll ${title} right`}
        onClick={() => scroll(1)}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white border border-gray-200 text-gray-700 hover:bg-[#E50914] hover:text-white hover:border-[#E50914] rounded-full flex items-center justify-center shadow-md transition-all duration-200 active:scale-90 cursor-pointer"
      >
        <ChevronRight size={18} />
      </button>

      {/* Horizontal Track */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 overflow-x-auto no-scrollbar py-3 px-1 scroll-smooth"
      >
        {products.length ? (
          products.map((product, idx) => (
            <ShowcaseCard key={product.id} product={product} index={idx} />
          ))
        ) : (
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider py-6">
            No products in this category yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default function HorizontalProductShowcase() {
  const [activeTab, setActiveTab] = useState('All');
  const featuredRef = useRef(null);
  const hubRef = useRef(null);

  const filteredCatalog =
    activeTab === 'All'
      ? productsCatalog
      : productsCatalog.filter((p) => p.category === activeTab);

  return (
    <section className="w-full mt-12 pt-10 border-t border-gray-200 space-y-10">
      {/* Category Tab Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-gray-200">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === cat
                ? 'bg-[#0070DC] text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GROUP 1: Featured Deals & Top Offers */}
      <CarouselGroup
        title="Featured Deals & Top Offers"
        products={filteredCatalog}
        scrollRef={featuredRef}
      />

      {/* GROUP 2: Shop the World / All Hualink Inventory */}
      <div className="pt-6 border-t border-gray-200">
        <CarouselGroup
          title="Shop the World — Hualink Wholesale Hub"
          products={[...productsCatalog].reverse()}
          scrollRef={hubRef}
        />
      </div>
    </section>
  );
}
