import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FrequentlySearchedCard({
  subtitleKey,
  imageUrl,
  altText,
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl p-8 md:p-10 shadow-sm flex flex-col h-full border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            {t('landing.frequentlySearched')}
          </h3>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
            {t(subtitleKey)}
          </p>
        </div>
        <ChevronRight size={14} className="text-slate-400" />
      </div>

      <div className="relative overflow-hidden rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center group">
        <img
          src={imageUrl}
          alt={altText}
          className="w-full h-44 object-contain transition-transform hover:scale-105 duration-200 p-2"
        />
      </div>
    </div>
  );
}
