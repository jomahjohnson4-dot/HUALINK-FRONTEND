import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

/**
 * Translation key for every showcase tab.
 *
 * The tab values stay the raw catalogue category names (they are matched
 * against the category field of each product), while the visible text is
 * resolved through the shared `categories.*` dictionary.
 */
const CATEGORY_LABEL_KEYS = {
  All: 'categories.allCategories',
  'Chargers & Cables': 'categories.chargersCables',
  'Audio & Sound': 'categories.audioSound',
  Smartphones: 'categories.smartphones',
  'Home Appliances': 'categories.homeAppliances',
  Accessories: 'categories.accessories',
};

function ShowcaseCard({ product, index }) {
  // Every badge, price label and social proof line follows the active language.
  const { t } = useTranslation();

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
      className="animate-fade-in-up min-w-[260px] max-w-[280px] shrink-0 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300 ease-out cursor-pointer group relative flex flex-col"
      style={{ animationDelay: `${(index % 8) * 60}ms` }}
    >
      {/* Edge-to-edge image canvas: full square, zero inner padding */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-50 rounded-t-2xl">
        <img
          src={product.image || product.thumbnail || product.thumbnails?.[0] || FALLBACK_IMAGE}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          onError={(e) => {
            e.target.src = FALLBACK_IMAGE;
          }}
        />

        {/* Badges pinned over the top-left corner of the image */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 pointer-events-none">
          {discountPercent > 0 ? (
            <span className="bg-[#DC2626] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-md">
              {t('product.off', { percent: discountPercent })}
            </span>
          ) : product.badge ? (
            <span className="bg-[#0070DC] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-md">
              {product.badge}
            </span>
          ) : null}

          <span className="bg-emerald-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-md">
            {t('shop.localStock')}
          </span>
        </div>
      </div>

      {/* Card content below the image */}
      <div className="flex-1 flex flex-col justify-between p-3">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
          {product.name}
        </h3>

        <div className="mt-2">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
              {t('shop.from')}
            </span>
            <span className="text-base font-bold text-red-600">{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">{product.originalPrice}</span>
            )}
          </div>

          {/* Star rating + sold count */}
          <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="font-bold text-gray-800">{product.rating || '4.7'}</span>
            <span className="text-gray-400">
              ({product.reviewsCount
                ? t('product.soldCount', { count: product.reviewsCount })
                : t('product.soldDefault')})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CarouselGroup({ title, products, scrollRef }) {
  // The carousel heading, link and scroll controls follow the active language.
  const { t } = useTranslation();

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
          {t('shop.viewMore')}
        </Link>
      </div>

      {/* Carousel Side Navigation Arrows */}
      <button
        type="button"
        aria-label={t('catalog.scrollLeft', { title })}
        onClick={() => scroll(-1)}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white border border-gray-200 text-gray-700 hover:bg-[#E50914] hover:text-white hover:border-[#E50914] rounded-full flex items-center justify-center shadow-md transition-all duration-200 active:scale-90 cursor-pointer"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        aria-label={t('catalog.scrollRight', { title })}
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
            {t('shop.noCategoryProducts')}
          </p>
        )}
      </div>
    </div>
  );
}

export default function HorizontalProductShowcase() {
  // Every tab and carousel heading follows the active language.
  const { t } = useTranslation();

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
            {t(CATEGORY_LABEL_KEYS[cat] || 'categories.allCategories')}
          </button>
        ))}
      </div>

      {/* GROUP 1: Featured Deals & Top Offers */}
      <CarouselGroup
        title={t('shop.featuredDeals')}
        products={filteredCatalog}
        scrollRef={featuredRef}
      />

      {/* GROUP 2: Shop the World / All Hualink Inventory */}
      <div className="pt-6 border-t border-gray-200">
        <CarouselGroup
          title={t('shop.worldHub')}
          products={[...productsCatalog].reverse()}
          scrollRef={hubRef}
        />
      </div>
    </section>
  );
}
