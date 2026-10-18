import { ChevronRight, ShoppingBag, Laptop, Printer, Car, Box } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CATEGORIES = [
  { id: 'header', labelKey: 'categoryDrawer.header', isHeader: true },
  { id: 'apparel', labelKey: 'categoryDrawer.apparel', icon: ShoppingBag },
  { id: 'electronics', labelKey: 'categoryDrawer.consumerElectronics', icon: Laptop },
  { id: 'printing', labelKey: 'categoryDrawer.printingDesign', icon: Printer },
  { id: 'hardware', labelKey: 'categoryDrawer.hardwareTools', icon: Car },
  { id: 'packaging', labelKey: 'categoryDrawer.packaging', icon: Box },
];

export default function CategoryDrawer({ className = '' }) {
  const { t } = useTranslation();

  return (
    <div
      className={`bg-white rounded-xl p-8 md:p-10 shadow-sm border border-gray-200 ${className}`}
    >
      <div className="mb-3">
        <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
          {t('categoryDrawer.header')}
        </h2>
      </div>

      <nav className="space-y-1">
        {CATEGORIES.map((cat) => {
          if (cat.isHeader) return null;
          const Icon = cat.icon;
          return (
            <a
              key={cat.id}
              href="#"
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-red/5 hover:text-brand-red transition-colors rounded-lg"
            >
              <Icon size={16} className="text-slate-400 group-hover:text-brand-red shrink-0" />
              <span>{t(cat.labelKey)}</span>
              <ChevronRight size={14} className="ml-auto text-slate-400 shrink-0" />
            </a>
          );
        })}
      </nav>
    </div>
  );
}
