import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Truck, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SLIDES_KEYS = ['slide1', 'slide2', 'slide3'];

const SLIDE_IMAGES = [
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=1600',
];

export default function HeroSlider() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = (key) => ({
    title: t(`hero.${key}.title`),
    subtitle: t(`hero.${key}.subtitle`),
    description: t(`hero.${key}.description`),
    buttonText: t(`hero.${key}.buttonText`),
  });

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES_KEYS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = slide(SLIDES_KEYS[currentSlide]);
  const buttonLinks = { slide1: '/shop', slide2: '/services', slide3: '/docs/help' };

  return (
    <section
      className="relative bg-slate-900 overflow-hidden"
      style={{ height: 400 }}
    >
      <div className="absolute inset-0 flex h-full">
        {/* Horizontal slide track: contained within this section (grid column 2) */}
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {SLIDES_KEYS.map((key, index) => (
            <div
              key={key}
              className="w-full shrink-0 relative"
              style={{ width: '100%' }}
            >
              <img
                src={SLIDE_IMAGES[index]}
                alt={current.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay contained within the slide */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 via-45% to-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* Hero text content: overlays within column 2, bounded by grid cell width */}
      <div className="absolute inset-0 z-10 flex h-full items-center justify-center pointer-events-none">
        <div className="w-full px-6 py-12 lg:px-8 lg:py-20 max-w-full pointer-events-auto">
          <div className="max-w-lg space-y-5">
            <div className="inline-block border-l-4 border-brand-red pl-3">
              <span className="text-xs font-black uppercase tracking-widest text-brand-red">
                {current.subtitle}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-slate-900">
              {current.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-800 font-semibold leading-relaxed max-w-md">
              {current.description}
            </p>

            <div className="pt-2">
              <Link
                to={buttonLinks[SLIDES_KEYS[currentSlide]] || '/shop'}
                className="bg-brand-red hover:bg-brand-red-dark text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full transition-all inline-flex items-center gap-2 shadow-lg shadow-brand-red/30 cursor-pointer"
              >
                <span>{current.buttonText}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom feature bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-3 grid grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="p-2.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
              <ShieldCheck size={18} />
            </div>
            <div>
              <span className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                {t('common.verified')}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Quality Checked</span>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3 border-x border-slate-200 px-4">
            <div className="p-2.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
              <Truck size={18} />
            </div>
            <div>
              <span className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Direct Dispatch
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">All Tanzania Regions</span>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="p-2.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
              <Layers size={18} />
            </div>
            <div>
              <span className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                TeKeL Services
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Branding & Tech</span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual arrows */}
      <div className="absolute bottom-8 right-6 z-30 hidden md:flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? SLIDES_KEYS.length - 1 : prev - 1))}
          className="p-2.5 rounded-full bg-white/80 border border-slate-300 hover:border-brand-red text-slate-800 transition-all cursor-pointer shadow-md"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES_KEYS.length)}
          className="p-2.5 rounded-full bg-white/80 border border-slate-300 hover:border-brand-red text-slate-800 transition-all cursor-pointer shadow-md"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}
