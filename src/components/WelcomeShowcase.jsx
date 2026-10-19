import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plug,
  Headphones,
  Smartphone,
  Zap,
  Camera,
  Target,
  Trophy,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

/**
 * Welcome showcase section of the home page.
 *
 * The section is built from three parts:
 *   1. A welcome bar with the three primary Hualink actions (quotation,
 *      ranking and fast customization).
 *   2. A "categories for you" panel that deep links into the marketplace
 *      catalogue pre-filtered on the matching category slug.
 *   3. Three high-impact showcase cards that promote the most browsed,
 *      searched and best selling shelves.
 *
 * Every image URL below was verified to return HTTP 200 and visually checked
 * to depict the product it belongs to.
 */
const HUALINK_CATEGORIES = [
  { name: 'Chargers & Cables', icon: Plug, link: '/?category=chargers-cables' },
  { name: 'Audio & Sound', icon: Headphones, link: '/?category=audio' },
  { name: 'Smartphones & Watches', icon: Smartphone, link: '/?category=smartphones' },
  { name: 'Home Appliances', icon: Zap, link: '/?category=home-appliances' },
  { name: 'Photo & Video Gear', icon: Camera, link: '/shop' },
];

const SHOWCASE_CARDS = [
  {
    titleKey: 'landing.browsingHistory',
    tag: 'Smartphones & Audio',
    price: 'TSh 1,250,000',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    link: '/?category=smartphones#featured',
  },
  {
    titleKey: 'landing.frequentlySearched',
    tag: 'Audio & Sound (JBL & AirPods)',
    price: 'TSh 55,000',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80',
    link: '/?category=audio#featured',
  },
  {
    titleKey: 'landing.trendingProducts',
    tag: 'Kettles, Pasi & Humidifiers',
    price: 'TSh 45,000',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Philips_steam_iron_model_HD_1256_A.jpg/960px-Philips_steam_iron_model_HD_1256_A.jpg',
    link: '/?category=home-appliances#featured',
  },
];

const PRIMARY_ACTIONS = [
  { key: 'landing.requestQuote', icon: Target, to: '/rfq' },
  { key: 'landing.topRanking', icon: Trophy, to: '/top-ranking' },
  { key: 'landing.fastCustomization', icon: Zap, to: '/customization' },
];

export default function WelcomeShowcase() {
  const { t } = useTranslation();

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6">
      {/* Welcome Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {t('landing.welcomeText')}
          </h1>
          <p className="text-xs font-semibold text-gray-500 mt-0.5">
            {t('landing.welcomeSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold text-gray-700">
          {PRIMARY_ACTIONS.map((action, idx) => {
            const Icon = action.icon;
            return (
              <span key={action.key} className="flex items-center gap-3 sm:gap-4">
                {idx > 0 ? <span className="text-gray-300">|</span> : null}
                <Link
                  to={action.to}
                  className="flex items-center gap-1.5 hover:text-[#E50914] transition-colors"
                >
                  <Icon size={14} className="text-[#E50914]" />
                  <span>{t(action.key)}</span>
                </Link>
              </span>
            );
          })}
        </div>
      </div>

      {/* Grid: Hualink Categories + Borderless Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Column: Hualink Categories */}
        <div className="md:col-span-3 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-black text-gray-400 tracking-wider uppercase mb-4">
              {t('common.categoriesForYou')}
            </h2>
            <ul className="space-y-3">
              {HUALINK_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <li key={cat.name}>
                    <Link
                      to={cat.link}
                      className="flex items-center justify-between text-xs font-extrabold text-gray-800 hover:text-[#E50914] cursor-pointer group transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon size={16} className="text-gray-400 group-hover:text-[#E50914] transition-colors" />
                        <span>{cat.name}</span>
                      </span>
                      <ChevronRight
                        size={14}
                        className="text-gray-400 group-hover:translate-x-1 transition-transform"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-100 mt-4 text-[11px] text-gray-500 font-semibold flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#E50914]" />
            <span>{t('landing.certifiedWholesaleStock')}</span>
          </div>
        </div>

        {/* Middle/Right Columns: Showcase Cards with Titles ON TOP & Borderless Full Images */}
        {SHOWCASE_CARDS.map((card, idx) => (
          <Link
            key={card.titleKey}
            to={card.link}
            className="md:col-span-3 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group animate-fade-in-up"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {/* Title block sits on top of the card */}
            <div className="px-4 pt-4 pb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                {t(card.titleKey)}
              </span>
              <p className="text-xs font-bold text-gray-700 mt-1">{card.tag}</p>
            </div>

            {/* Completely borderless image: no frame, no padding, full card width */}
            <div className="relative w-full flex-1 min-h-[190px] overflow-hidden bg-gray-50">
              <img
                src={card.image}
                alt={card.tag}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Price row */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100">
              <span className="text-sm font-black text-gray-900">{card.price}</span>
              <ChevronRight
                size={16}
                className="text-gray-300 group-hover:text-[#E50914] transition-colors"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
