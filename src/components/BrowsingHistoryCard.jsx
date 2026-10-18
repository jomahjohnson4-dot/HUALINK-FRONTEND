import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BrowsingHistoryCard() {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl p-8 md:p-10 shadow-sm flex flex-col h-full border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
          {t('landing.browsingHistory')}
        </h3>
        <ChevronRight size={14} className="text-slate-400" />
      </div>

      <div className="relative overflow-hidden rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mb-2 group">
        <img
          src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600"
          alt="Smartphone product"
          className="w-full h-44 object-contain transition-transform hover:scale-105 duration-200 p-2"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-full">
          TSh 277,456
        </span>
      </div>
    </div>
  );
}
