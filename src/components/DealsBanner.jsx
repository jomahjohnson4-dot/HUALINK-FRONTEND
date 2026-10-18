import { Star, Link as LinkIcon, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { DEALS } from './dealsData';

const stars = (rating) => {
  const filled = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={10}
          className={`${
            i < filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-[10px] font-bold text-gray-600">{rating}</span>
    </span>
  );
};

export default function DealsBanner() {
  const { t } = useTranslation();

  return (
    <section className="py-12 lg:py-16 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-brand-red">
              {t('common.todayDeals')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Limited Time Offers
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold text-brand-red hover:text-brand-red-dark inline-flex items-center gap-1.5 transition-colors"
          >
            {t('common.viewAll')} <LinkIcon size={14} />
          </Link>
        </div>

        {/* Dual-card layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DEALS.map((deal) => (
            <a
              key={deal.id}
              href={deal.link}
              className="block relative group"
            >
              <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-white/90 backdrop-blur text-brand-red font-black text-xs px-2 py-1 rounded-full border border-brand-red/20">
                      {t('common.discount', { percent: deal.discount })}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-slate-900/90 text-white font-black text-[10px] px-2 py-1 rounded-full uppercase tracking-tighter">
                      {deal.sold} {t('common.soldCountShort').replace('1,000+', '')}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight group-hover:text-brand-red transition-colors">
                      {deal.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Zap size={12} className="text-amber-500" />
                      <span className="text-[10px] font-black text-amber-600 uppercase">
                        Flash Deal
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm sm:text-base font-black text-slate-900">{deal.price}</span>
                    <span className="text-xs text-gray-400 line-through">{deal.originalPrice}</span>
                    <span className="text-xs font-bold text-brand-red bg-red-50 px-2 py-0.5 rounded border border-red-100">
                      {t('common.discount', { percent: deal.discount })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    {stars(deal.rating)}
                    <span className="text-[10px] text-gray-500 font-medium">
                      {t('common.soldCount', { count: deal.sold })}
                    </span>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 bg-brand-red text-white font-bold text-xs py-3 rounded-xl hover:bg-brand-red-dark transition-all shadow-md shadow-brand-red/20 cursor-pointer">
                    {t('common.search')} <LinkIcon size={13} />
                  </button>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
