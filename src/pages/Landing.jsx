import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, UserCheck, Search, PackageCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import TopBanner from '../components/TopBanner';
import SearchHero from '../components/SearchHero';
import CategoryDrawer from '../components/CategoryDrawer';
import BrowsingHistoryCard from '../components/BrowsingHistoryCard';
import FrequentlySearchedCard from '../components/FrequentlySearchedCard';
import SupplierLeaderboardCard from '../components/SupplierLeaderboardCard';
import FloatingToolbar from '../components/FloatingToolbar';
import ProductGrid from '../components/ProductGrid';

const STEP_ICONS = {
  step1: UserCheck,
  step2: Search,
  step3: PackageCheck,
};

const FEATURE_ICONS = [
  <span className="text-[24px]" key="f0">✅</span>,
  <span className="text-[24px]" key="f1">📍</span>,
  <span className="text-[24px]" key="f2">🏭</span>,
  <span className="text-[24px]" key="f3">🔒</span>,
];

const STEPS = ['step1', 'step2', 'step3'];

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="bg-[#F5F5F5] min-h-screen font-sans text-slate-900">
      {/* ================= 1. TOP ANNOUNCEMENT BANNER ================= */}
      <TopBanner className="my-6" />

      {/* ================= 2. SEARCH HERO ================= */}
      <SearchHero className="my-6" />

      {/* ================= 3. MAIN 5-CARD HORIZONTAL GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-7xl mx-auto px-4 mb-6">
        {/* Col 1: Category Drawer */}
        <CategoryDrawer />

        {/* Col 2: Browsing History */}
        <BrowsingHistoryCard />

        {/* Col 3: Frequently Searched - Vehicles & Machinery */}
        <FrequentlySearchedCard
          subtitleKey="landing.vehiclesMachinery"
          imageUrl="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600"
          altText="Electric vehicle machinery"
        />

        {/* Col 4: Frequently Searched - Electronics & Gear */}
        <FrequentlySearchedCard
          subtitleKey="landing.electronicsGear"
          imageUrl="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600"
          altText="Camera electronics gadget"
        />

        {/* Col 5: Supplier Leaderboard Promo Card */}
        <SupplierLeaderboardCard />
      </div>

      {/* ================= 4. BOTTOM PRODUCT GRID (Alibaba 6-Column Grid) ================= */}
      <ProductGrid />

      {/* ================= 5. HOW IT WORKS ================= */}
      <section className="py-20 bg-white my-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-brand-red">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {t('steps.title')} <span className="text-brand-red">{t('steps.titleHighlight')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {t('steps.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {STEPS.map((key) => {
              const IconComponent = STEP_ICONS[key];
              return (
                <div
                  key={key}
                  className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-brand-red/30 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-brand-red text-white font-black text-sm flex items-center justify-center shadow-md shadow-brand-red/20">
                        {key === 'step1' ? '01' : key === 'step2' ? '02' : '03'}
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 text-slate-600 group-hover:text-brand-red group-hover:bg-brand-red/50 transition-colors">
                        <IconComponent size={22} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-brand-red transition-colors">
                        {t(`steps.${key}.title`)}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        {t(`steps.${key}.description`)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-gray-100">
                    <Link
                      to={t(`steps.${key}.linkUrl`)}
                      className="text-xs font-bold text-brand-red hover:text-brand-red-dark inline-flex items-center gap-1.5 transition-all group-hover:gap-2"
                    >
                      <span>{t(`steps.${key}.linkText`)}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 5. WHY CHOOSE HUALINK ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 my-6">
        <div className="bg-charcoal text-white rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t('whyChoose.title')} <span className="text-brand-red italic">{t('whyChoose.titleBrand')}</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {t('whyChoose.features', { returnObjects: true }).map((feature, idx) => (
              <div
                key={idx}
                className="bg-[#1a1a1a]/90 border border-gray-800 rounded-2xl p-5 flex items-start gap-4 hover:border-gray-700 transition-colors"
              >
                <div className="text-brand-red shrink-0 mt-0.5">{FEATURE_ICONS[idx]}</div>
                <div>
                  <h3 className="text-sm font-extrabold text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating right-side toolbar */}
      <FloatingToolbar onCartClick={() => navigate('/cart')} />
    </div>
  );
}
