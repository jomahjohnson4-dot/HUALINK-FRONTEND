import React from 'react';
import { Store, Building2, Cog, Compass } from 'lucide-react';

export const MobileBottomNav = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'marketplace', label: 'market_place', icon: Store },
    { id: 'shops', label: 'shops', icon: Building2 },
    { id: 'services', label: 'services', icon: Cog },
    { id: 'explore', label: 'explore', icon: Compass },
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
                isActive ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;