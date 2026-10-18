import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SupplierLeaderboardCard() {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white rounded-xl p-8 md:p-10 shadow-lg border border-purple-500/30 flex flex-col h-full">
      <div className="z-10 flex items-start justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider opacity-90 bg-white/20 px-2 py-1 rounded-full inline-block mb-2">
            {t('landing.topSuppliers')}
          </span>
          <h3 className="text-lg font-black leading-tight">
            {t('landing.supplierLeaderboard')}
          </h3>
        </div>
        <ChevronRight size={16} className="text-white/60 self-start mt-1" />
      </div>

      <div className="z-10 mt-5 flex items-center justify-center gap-2 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1550684878-fd3e0b939705?auto=format&fit=crop&q=80&w=200"
          alt="Supplier product 1"
          className="w-14 h-14 object-contain opacity-95 drop-shadow-lg"
        />
        <img
          src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=200"
          alt="Supplier product 2"
          className="w-14 h-14 object-contain opacity-95 drop-shadow-lg -mt-2"
        />
        <img
          src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=200"
          alt="Supplier product 3"
          className="w-14 h-14 object-contain opacity-95 drop-shadow-lg -mt-2"
        />
        <img
          src="https://images.unsplash.com/photo-1567538096630-e0c55bd6294c?auto=format&fit=crop&q=80&w=200"
          alt="Supplier product 4"
          className="w-14 h-14 object-contain opacity-95 drop-shadow-lg -mt-2"
        />
      </div>

      <button className="z-10 mt-auto bg-white text-[#E50914] font-bold text-xs py-2 px-6 rounded-full text-center uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-lg shadow-red-600/40 w-fit mx-auto">
        {t('landing.sourceNow')}
      </button>
    </div>
  );
}
