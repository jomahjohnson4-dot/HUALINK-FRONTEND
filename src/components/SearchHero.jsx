import { useTranslation } from 'react-i18next';
import { FileText, Trophy, Zap } from 'lucide-react';

export default function SearchHero() {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 bg-white border border-gray-200/80 rounded-xl px-6 py-3.5 shadow-sm">
      <div className="flex justify-between items-center">
        <span className="text-gray-900 font-bold text-base">
          {t('landing.welcomeText')}
        </span>
        <div className="flex gap-4 text-sm">
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-[#E50914] cursor-pointer transition-colors">
            <FileText className="w-4 h-4 text-[#E50914]" />
            {t('landing.requestQuote')}
          </button>
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-[#E50914] cursor-pointer transition-colors">
            <Trophy className="w-4 h-4 text-amber-500" />
            {t('landing.topRanking')}
          </button>
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-[#E50914] cursor-pointer transition-colors">
            <Zap className="w-4 h-4 text-amber-500" />
            {t('landing.fastCustomization')}
          </button>
        </div>
      </div>
    </div>
  );
}
