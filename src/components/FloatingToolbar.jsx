import { useState, useEffect } from 'react';
import { ShoppingBag, MessageSquare, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TOOLBAR_ITEMS = [
  {
    id: 'cart',
    labelKey: 'common.quickCart',
    icon: ShoppingBag,
    color: 'text-brand-red',
    hoverBg: 'bg-brand-red/10',
  },
  {
    id: 'chat',
    labelKey: 'common.liveChat',
    icon: MessageSquare,
    color: 'text-slate-600',
    hoverBg: 'bg-slate-50',
  },
  {
    id: 'top',
    labelKey: 'common.backToTop',
    icon: ChevronUp,
    color: 'text-slate-600',
    hoverBg: 'bg-slate-50',
  },
];

export default function FloatingToolbar({ onCartClick }) {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 hidden sm:flex">
      {TOOLBAR_ITEMS.map((item) => {
        const Icon = item.icon;
        const showLabel = item.id === 'top' ? scrolled : false;
        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'cart') onCartClick?.();
              if (item.id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`p-2.5 rounded-full bg-white border border-gray-200 shadow-md ${item.color} ${item.hoverBg} hover:bg-brand-red hover:text-white transition-all duration-200 flex items-center justify-center w-10 h-10`}
            aria-label={t(item.labelKey)}
          >
            <Icon size={16} />
            {showLabel && (
              <span className="absolute -right-8 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-1 bg-slate-900 text-white text-[10px] rounded shadow-sm pointer-events-none">
                {t(item.labelKey)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
