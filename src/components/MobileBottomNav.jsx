import React from 'react';
import { Store, Building2, Settings, Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const MobileBottomNav = ({ activeTab, setActiveTab }) => {
  const { t } = useTranslation();

  const navItems = [
    { id: 'marketplace', labelKey: 'common.marketplace', icon: Store },
    { id: 'shops', labelKey: 'common.shops', icon: Building2 },
    { id: 'services', labelKey: 'common.services', icon: Settings },
    { id: 'explore', labelKey: 'common.explore', icon: Compass },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-2 px-3 md:hidden">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab && setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-brand-red font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              aria-label={t(item.labelKey)}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium tracking-tight">
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
