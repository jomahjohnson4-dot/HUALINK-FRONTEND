import { useState } from 'react';
import { CheckCircle2, MessageCircle, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ServiceContactModal from '../components/modals/ServiceContactModal';
import {
  HUALINK_SERVICES,
  HUALINK_WHATSAPP,
  SERVICE_IMAGE_FALLBACK,
  buildWhatsAppUrl,
} from '../data/servicesCatalog';

/**
 * Banner image with graceful fallback: a failed Unsplash request swaps to the
 * branded inline-SVG placeholder, and a failure of that placeholder degrades
 * to a neutral gradient — a card never renders a broken image.
 */
function ServiceBanner({ src, alt }) {
  const [imageSrc, setImageSrc] = useState(src);

  const handleError = () => {
    setImageSrc((prev) => (prev === SERVICE_IMAGE_FALLBACK ? '' : SERVICE_IMAGE_FALLBACK));
  };

  if (!imageSrc) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"
      />
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      loading="lazy"
      onError={handleError}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
  );
}

export default function ServicesPage() {
  const { t } = useTranslation();
  // Active in-app chat widget: { booking, initialMessage } for one service.
  const [activeChat, setActiveChat] = useState(null);

  const titleFor = (key) => t(`services.items.${key}.title`);

  const featuresFor = (key) => {
    const features = t(`services.items.${key}.features`, { returnObjects: true });
    return Array.isArray(features) ? features : [];
  };

  const openWhatsApp = (service) => {
    const message = t('services.whatsappMessage', { title: titleFor(service.key) });
    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  };

  const openInAppChat = (service) => {
    const title = titleFor(service.key);
    setActiveChat({
      booking: {
        id: `SVC-${service.key.toUpperCase()}`,
        serviceTitle: title,
        userId: 'guest-visitor',
      },
      initialMessage: t('services.chatContext', { title }),
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-slate-900 py-8 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-[#E50914] mb-3">
            {t('services.eyebrow')}
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
            {t('services.title')}
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto">
            {t('services.subtitle')}
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-3">
            {t('services.availableCount', { count: HUALINK_SERVICES.length })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HUALINK_SERVICES.map((service) => {
            const title = titleFor(service.key);
            const subtitle = t(`services.items.${service.key}.subtitle`);
            const features = featuresFor(service.key);

            return (
              <article
                key={service.key}
                className="group bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-200"
              >
                {/* Reliable banner image container */}
                <div className="relative h-52 bg-gray-100 overflow-hidden">
                  <ServiceBanner src={service.image} alt={title} />
                  <span className="absolute top-3 right-3 z-10 bg-[#E50914] text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shadow-sm">
                    {t(`services.badge.${service.badge}`)}
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-black text-gray-900 leading-tight mb-2">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mb-4 leading-relaxed">
                    {subtitle}
                  </p>

                  <ul className="space-y-2 mb-4">
                    {features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-xs text-gray-700 font-medium"
                      >
                        <CheckCircle2 size={12} className="shrink-0 text-[#E50914]" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Dual inquiry actions: WhatsApp + in-app chat */}
                  <div className="mt-auto flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => openWhatsApp(service)}
                      className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5B] text-white rounded-full px-4 py-2.5 text-xs font-bold transition-colors shadow-sm cursor-pointer"
                    >
                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white/25">
                        <MessageCircle size={12} />
                      </span>
                      {t('services.whatsapp')}
                    </button>
                    <button
                      type="button"
                      onClick={() => openInAppChat(service)}
                      className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full px-4 py-2.5 text-xs font-bold transition-colors shadow-sm cursor-pointer"
                    >
                      <MessageSquare size={13} />
                      {t('services.chatInApp')}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* In-app live chat widget, pre-loaded with the selected service context */}
      {activeChat && (
        <ServiceContactModal
          booking={activeChat.booking}
          providerPhone={HUALINK_WHATSAPP}
          currentUser={{ id: 'guest-visitor', name: 'Guest' }}
          initialMessage={activeChat.initialMessage}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}
