import React from 'react';
import { useTranslation } from 'react-i18next';

export const SellerDashboard = () => {
  // Every label on the dashboard follows the active language.
  const { t } = useTranslation();

  return (
    <div className="p-6 space-y-6 bg-slate-900 text-white min-h-screen font-sans">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-orange-500">{t('dashboard.seller.title')}</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
          {t('dashboard.seller.subtitle')}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <h2 className="text-lg font-semibold text-emerald-400 mb-2">
            {t('dashboard.seller.activeInventory')}
          </h2>
          <p className="text-3xl font-bold">
            {t('dashboard.seller.productCount', { count: 24 })}
          </p>
        </div>
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <h2 className="text-lg font-semibold text-orange-400 mb-2">
            {t('dashboard.seller.pendingFulfillment')}
          </h2>
          <p className="text-3xl font-bold">
            {t('dashboard.seller.orderCount', { count: 8 })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
