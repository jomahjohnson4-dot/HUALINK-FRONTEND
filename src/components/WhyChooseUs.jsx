import { useEffect, useState } from 'react';
import { ShieldCheck, Truck, Warehouse, Lock, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getFaqs } from '../api/faqService';

/**
 * Icon + accent tone per highlight. The order matches the
 * `whyChoose.features` array in the locale files.
 *
 * Each badge carries a tinted fill, border and outer glow so the icon reads as
 * a softly lit token rather than a flat glyph.
 */
const FEATURES = [
  {
    Icon: ShieldCheck,
    icon: 'text-emerald-400',
    badge: 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_18px_-2px] shadow-emerald-500/40',
    glow: 'from-emerald-500/20',
    ring: 'group-hover:border-emerald-500/40',
  },
  {
    Icon: Truck,
    icon: 'text-amber-400',
    badge: 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_18px_-2px] shadow-amber-500/40',
    glow: 'from-amber-500/20',
    ring: 'group-hover:border-amber-500/40',
  },
  {
    Icon: Warehouse,
    icon: 'text-indigo-400',
    badge: 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_18px_-2px] shadow-indigo-500/40',
    glow: 'from-indigo-500/20',
    ring: 'group-hover:border-indigo-500/40',
  },
  {
    Icon: Lock,
    icon: 'text-teal-400',
    badge: 'bg-teal-500/10 border-teal-500/30 shadow-[0_0_18px_-2px] shadow-teal-500/40',
    glow: 'from-teal-500/20',
    ring: 'group-hover:border-teal-500/40',
  },
];

export default function WhyChooseUs() {
  const { t, i18n } = useTranslation();
  const features = t('whyChoose.features', { returnObjects: true });
  const localeFaqs = t('faq.items', { returnObjects: true });
  const [dbFaqs, setDbFaqs] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);

  /**
   * FAQ copy is owned by the admin settings panel and lives in the database.
   * The locale files stay as the fallback for when the API cannot be reached.
   */
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const lang = String(i18n.language || 'en').split('-')[0];
        const list = await getFaqs({ lang });
        if (isMounted && Array.isArray(list) && list.length) {
          setDbFaqs(
            list.map((faq) => ({ question: faq.question, answer: faq.answer || '' }))
          );
        }
      } catch (error) {
        console.error('Failed to load FAQs from the API:', error);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [i18n.language]);

  const faqs = Array.isArray(dbFaqs) && dbFaqs.length ? dbFaqs : localeFaqs;

  const toggleFaq = (index) => {
    setOpenFaq((current) => (current === index ? null : index));
  };

  return (
    <>
      {/* ================= WHY CHOOSE HUALINK ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 my-6">
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t('whyChoose.title')}{' '}
              <span className="text-brand-red italic">{t('whyChoose.titleBrand')}</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.isArray(features) &&
              features.map((feature, idx) => {
                const { Icon, icon, badge, glow, ring } = FEATURES[idx] || FEATURES[0];
                return (
                  <div
                    key={feature.title || idx}
                    className={`group relative bg-[#1a1a1a]/90 border border-gray-800 rounded-2xl p-5 flex items-start gap-4 hover:border-gray-700 hover:-translate-y-1 transition-all duration-300 overflow-hidden ${ring}`}
                  >
                    {/* Subtle glow behind the icon */}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute -top-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-br ${glow} to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    />

                    <span
                      className={`relative shrink-0 mt-0.5 flex h-11 w-11 items-center justify-center rounded-xl border ${badge} ${icon} transition-transform duration-300 group-hover:scale-105`}
                    >
                      <Icon size={20} strokeWidth={2.2} />
                    </span>

                    <div className="relative">
                      <h3 className="text-sm font-extrabold text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* ================= FREQUENTLY ASKED QUESTIONS ================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 my-6">
        <div className="text-center max-w-xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-brand-red">
            {t('faq.eyebrow')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('faq.title')}{' '}
            <span className="text-brand-red">{t('faq.titleHighlight')}</span>
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500">{t('faq.subtitle')}</p>
        </div>

        <div className="space-y-3">
          {Array.isArray(faqs) &&
            faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.question || idx}
                  className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isOpen ? 'border-gray-300 shadow-md' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${idx}`}
                    className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 sm:px-6 sm:py-5 cursor-pointer"
                  >
                    <span className="text-sm font-extrabold text-slate-900 leading-snug">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-slate-500 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-brand-red' : ''
                      }`}
                    />
                  </button>

                  {/* Smooth expand/collapse via grid-rows trick */}
                  <div
                    id={`faq-panel-${idx}`}
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>
    </>
  );
}
