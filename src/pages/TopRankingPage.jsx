import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Trophy, Wrench } from 'lucide-react';

export default function TopRankingPage() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubFilter, setActiveSubFilter] = useState('Hot Selling');

  const CATEGORY_FILTERS = [
    { key: 'All', labelKey: 'ranking.filterAll' },
    { key: 'Consumer Electronics', labelKey: 'ranking.filterConsumerElectronics' },
    { key: 'Smartphones & Accessories', labelKey: 'ranking.filterSmartphones' },
    { key: 'Chargers & Power Supplies', labelKey: 'ranking.filterChargers' },
    { key: 'Printing & Branding Services', labelKey: 'ranking.filterPrinting' },
    { key: 'Bulk Hardware', labelKey: 'ranking.filterBulkHardware' },
  ];

  const SUB_FILTERS = [
    { key: 'Hot Selling', labelKey: 'ranking.hotSelling' },
    { key: 'Most Popular', labelKey: 'ranking.mostPopular' },
    { key: 'Best Reviewed', labelKey: 'ranking.bestReviewed' },
  ];

  const RANKED_PRODUCTS = [
    {
      categoryKey: 'ranking.categorySmartphones',
      category: 'Smartphones & Devices',
      items: [
        {
          rank: 1,
          titleKey: 'ranking.productNote30',
          price: 'TSh 177,332',
          moq: '1',
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400',
          badge: 'Gold',
        },
        {
          rank: 2,
          titleKey: 'ranking.productGalaxy',
          price: 'TSh 277,456',
          moq: '1',
          image: 'https://images.unsplash.com/photo-1510557880182-7e24a831c424?auto=format&fit=crop&q=80&w=400',
          badge: 'Silver',
        },
        {
          rank: 3,
          titleKey: 'ranking.productBudgetPhone',
          price: 'TSh 109,100',
          moq: '2',
          image: 'https://images.unsplash.com/photo-1510557880182-7e24a831c424?auto=format&fit=crop&q=80&w=400',
          badge: 'Bronze',
        },
      ],
    },
    {
      categoryKey: 'ranking.categoryChargers',
      category: 'Chargers & Fast Power',
      items: [
        {
          rank: 1,
          titleKey: 'ranking.productCharger65W',
          price: 'TSh 18,500',
          moq: '5',
          image: 'https://images.unsplash.com/photo-1603746380946-1a67c3e28115?auto=format&fit=crop&q=80&w=400',
          badge: 'Gold',
        },
        {
          rank: 2,
          titleKey: 'ranking.productPowerBank',
          price: 'TSh 35,000',
          moq: '2',
          image: 'https://images.unsplash.com/photo-1603746380946-1a67c3e28115?auto=format&fit=crop&q=80&w=400',
          badge: 'Silver',
        },
        {
          rank: 3,
          titleKey: 'ranking.productCablePack',
          price: 'TSh 4,500',
          moq: '10',
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400',
          badge: 'Bronze',
        },
      ],
    },
    {
      categoryKey: 'ranking.categoryPrinting',
      category: 'Hualink Printing & Customization Services',
      items: [
        {
          rank: 1,
          titleKey: 'ranking.productPackaging',
          price: 'TSh 2,456',
          moq: '50',
          image: 'https://images.unsplash.com/photo-1492074373747-9997039802ca?auto=format&fit=crop&q=80&w=400',
          badge: 'Gold',
        },
        {
          rank: 2,
          titleKey: 'ranking.productApparel',
          price: 'TSh 12,000',
          moq: '10',
          image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=400',
          badge: 'Silver',
        },
        {
          rank: 3,
          titleKey: 'ranking.productBanner',
          price: 'TSh 15,000',
          moq: '1',
          image: 'https://images.unsplash.com/photo-1593358292147-4eb18bcf2333?auto=format&fit=crop&q=80&w=400',
          badge: 'Bronze',
        },
      ],
    },
  ];

  const RANK_BADGES = {
    1: 'bg-amber-400 text-black font-extrabold px-2 py-0.5 rounded-br-lg text-xs absolute top-0 left-0 z-10',
    2: 'bg-gray-300 text-black font-extrabold px-2 py-0.5 rounded-br-lg text-xs absolute top-0 left-0 z-10',
    3: 'bg-amber-600 text-white font-extrabold px-2 py-0.5 rounded-br-lg text-xs absolute top-0 left-0 z-10',
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-slate-900 py-8 px-4 md:px-12 space-y-8">
      {/* ================= HERO BANNER ================= */}
      <section className="max-w-7xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            {t('ranking.title')}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative">
              <button className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2 font-semibold text-sm cursor-pointer hover:bg-gray-50 transition-colors">
                <span>{t('ranking.globalRankings')}</span>
                <ChevronDown size={14} className="text-gray-500" />
              </button>
            </div>
            <div className="relative">
              <button className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2 font-semibold text-sm cursor-pointer hover:bg-gray-50 transition-colors">
                <span>{t('ranking.allCategories')}</span>
                <ChevronDown size={14} className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* ================= CATEGORY FILTER TABS STRIP ================= */}
        <div className="bg-white border-b border-gray-200 rounded-xl p-1 shadow-sm mb-6">
          <div className="flex overflow-x-auto no-scrollbar gap-2 px-2 pb-2">
            {CATEGORY_FILTERS.map((cat) => {
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors shrink-0 ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {t(cat.labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= SUB-FILTER PILLS ================= */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 px-2 py-4">
          {SUB_FILTERS.map((filter) => {
            const isActive = activeSubFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveSubFilter(filter)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors shrink-0 ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </section>

      {/* ================= RANKED PRODUCT CARDS GRID ================= */}
      <section className="max-w-7xl mx-auto space-y-8">
        {RANKED_PRODUCTS.map((categoryBlock) => {
          const isVisible =
            activeCategory === 'All' || categoryBlock.category === activeCategory;
          if (!isVisible) return null;

          return (
            <section key={categoryBlock.category} className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-4">
                {t(categoryBlock.categoryKey || categoryBlock.category)}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {categoryBlock.items.map((item) => (
                  <Link
                    key={item.title}
                    to="/product/ranked"
                    className="group relative block"
                  >
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col h-full">
                      {/* Rank Badge */}
                      <span className={RANK_BADGES[item.rank]}>#{item.rank}</span>

                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden bg-gray-100 border-b border-gray-100 flex items-center justify-center group">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="text-lg font-black text-gray-900 leading-tight mb-2 group-hover:text-[#E50914] transition-colors">
                          {t(item.titleKey || item.title)}
                        </h3>
                        <div className="flex items-baseline gap-1 mb-2">
                          <span className="text-base font-extrabold text-gray-900">
                            {item.price}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {t('ranking.moq')} {item.moq}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                          <span>{t('ranking.freeDelivery')}</span>
                          <span>TZ</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </section>
    </div>
  );
}
