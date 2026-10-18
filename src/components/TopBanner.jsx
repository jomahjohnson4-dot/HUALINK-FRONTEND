import { useTranslation } from 'react-i18next';

export default function TopBanner() {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-orange-500 via-red-600 to-amber-500 text-white text-xs py-1.5 px-4 flex justify-between items-center">
      <span className="font-medium">{t('landing.topBanner')}</span>
      <button className="bg-white/20 hover:bg-white/30 text-white px-3 py-0.5 rounded-full text-xs font-semibold transition-colors">
        {t('landing.topBannerButton')}
      </button>
    </div>
  );
}
