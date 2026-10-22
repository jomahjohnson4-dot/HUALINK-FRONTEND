import { Link } from 'react-router-dom';
import { Search, ShieldCheck, TrendingUp, Send, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ICONS = {
  electronics: Search,
  apparel: Search,
  furniture: Search,
  printing: Search,
  hardware: Search,
};

// Unsplash fallback thumbnail images for Alibaba-style quick cards
const THUMBS = {
  electronics: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400',
  apparel: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=400',
  furniture: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=400',
  printing: 'https://images.unsplash.com/photo-1492074373747-9997039802ca?auto=format&fit=crop&q=80&w=400',
  hardware: 'https://images.unsplash.com/photo-1509388746237-5fa4620067f0?auto=format&fit=crop&q=80&w=400',
};

const SUPPLIER_THUMBS = [
  'https://images.unsplash.com/photo-1499750310107-5fef28a66669?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1556740734-b9687578d2b2?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400',
];

const TECH_THUMBS = [
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1541802084-cdca82e50a9f?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1553022697-b77d5e89527b?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1509388746237-5fa4620067f0?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1531296468471-8958067b679f?auto=format&fit=crop&q=80&w=400',
];

export default function QuickCards() {
  const { t } = useTranslation();

  const searchItems = [
    {
      key: 'electronics',
      thumb: THUMBS.electronics,
      label: t('quickCards.frequentlySearched.item1', 'Electronics'),
    },
    {
      key: 'apparel',
      thumb: THUMBS.apparel,
      label: t('quickCards.frequentlySearched.item2', 'Apparel'),
    },
    {
      key: 'furniture',
      thumb: THUMBS.furniture,
      label: t('quickCards.frequentlySearched.item3', 'Furniture'),
    },
    {
      key: 'printing',
      thumb: THUMBS.printing,
      label: t('quickCards.frequentlySearched.item4', 'Printing Services'),
    },
    {
      key: 'hardware',
      thumb: THUMBS.hardware,
      label: t('quickCards.frequentlySearched.item5', 'Hardware Stock'),
    },
  ];

  const suppliers = [
    {
      label: t('quickCards.verifiedSuppliers.item1'),
      thumb: SUPPLIER_THUMBS[0],
    },
    {
      label: t('quickCards.verifiedSuppliers.item2'),
      thumb: SUPPLIER_THUMBS[1],
    },
    {
      label: t('quickCards.verifiedSuppliers.item3'),
      thumb: SUPPLIER_THUMBS[2],
    },
    {
      label: t('quickCards.verifiedSuppliers.item4'),
      thumb: SUPPLIER_THUMBS[3],
    },
  ];

  const techItems = [
    {
      key: 'laptops',
      thumb: TECH_THUMBS[0],
      label: t('quickCards.trendingTech.item1', 'Laptops'),
    },
    {
      key: 'networking',
      thumb: TECH_THUMBS[1],
      label: t('quickCards.trendingTech.item2', 'Networking Gear'),
    },
    {
      key: 'pos',
      thumb: TECH_THUMBS[2],
      label: t('quickCards.trendingTech.item3', 'POS Systems'),
    },
    {
      key: 'solar',
      thumb: TECH_THUMBS[3],
      label: t('quickCards.trendingTech.item4', 'Solar Kits'),
    },
    {
      key: 'cctv',
      thumb: TECH_THUMBS[4],
      label: t('quickCards.trendingTech.item5', 'CCTV Cameras'),
    },
  ];

  return (
    <aside className="hidden lg:block w-72 flex flex-col gap-4 shrink-0">
      {/* Frequently Searched */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
          <Search size={16} className="text-brand-red" />
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            {t('common.frequentlySearched')}
          </h3>
        </div>
        <ul className="divide-y divide-gray-100">
          {searchItems.map((item) => {
            const Icon = ICONS[item.key];
            return (
              <li key={item.key} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer group relative">
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                  <img
                    src={item.thumb}
                    alt={item.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Icon size={14} className="text-slate-400 group-hover:text-brand-red absolute left-3 top-3" />
                <span className="text-sm text-slate-700 font-medium group-hover:text-slate-900 min-w-0 truncate">
                  {item.label}
                </span>
                <ChevronRight size={12} className="ml-auto text-slate-400 shrink-0" />
              </li>
            );
          })}
        </ul>
      </div>

      {/* Verified Suppliers */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
          <ShieldCheck size={16} className="text-brand-red" />
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            {t('common.verifiedSuppliers')}
          </h3>
        </div>
        <ul className="divide-y divide-gray-100">
          {suppliers.map((supplier, i) => (
            <li key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors relative">
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                <img
                  src={supplier.thumb}
                  alt={supplier.label}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-8 h-8 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red font-bold text-[10px] absolute left-3 top-3">
                {String.fromCharCode(65 + i)}
              </div>
              <span className="text-sm text-slate-700 font-medium min-w-0 truncate">
                {supplier.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Trending Tech */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-brand-red" />
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            {t('common.trendingTech')}
          </h3>
        </div>
        <ul className="divide-y divide-gray-100">
          {techItems.map((item) => (
            <li key={item.key} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors relative">
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                <img src={item.thumb} alt={item.label} className="w-full h-full object-cover" />
              </div>
              <span className="w-2 h-2 rounded-full bg-slate-400 absolute left-3 top-3 shrink-0" />
              <span className="text-sm text-slate-700 font-medium min-w-0 truncate">
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* RFQ Widget */}
      <div className="bg-brand-red text-white rounded-2xl shadow-lg shadow-brand-red/20 overflow-hidden">
        <div className="p-5">
          <h3 className="text-sm font-black uppercase tracking-wider mb-3">
            {t('common.requestQuote')}
          </h3>
          <p className="text-sm text-red-100 mb-4 leading-relaxed">
            {t('common.requestQuoteDesc')}
          </p>
          <button className="w-full bg-white text-brand-red font-bold text-xs py-3 rounded-xl uppercase tracking-wider hover:bg-gray-100 transition-all shadow-md cursor-pointer">
            {t('quickCards.sendRfq')}
            <Send size={14} className="ml-1.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
