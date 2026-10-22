import { useState } from 'react';
import { Store, Star, RefreshCw, Truck, Package, MessageCircle, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ServiceContactModal from '../components/modals/ServiceContactModal';
import {
  VERIFIED_SUPPLIERS,
  HUALINK_WHATSAPP,
  buildSupplierWhatsAppUrl,
  buildSupplierContactMessage,
} from '../data/shopsCatalog';

/**
 * Banner image with a two-stage fallback: a failed primary URL swaps to the
 * supplier's high-quality fallback photo (electronics/warehouse), and a
 * failure of that too degrades to a neutral placeholder — never a broken img.
 */
function SupplierBanner({ src, fallbackSrc, alt }) {
  const [imageSrc, setImageSrc] = useState(src);

  const handleError = () => {
    setImageSrc((prev) => (prev === fallbackSrc ? '' : fallbackSrc));
  };

  if (!imageSrc) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200"
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

/** Picks the metric icon that best matches the supplier statistic. */
const metricIcon = (metric) => {
  if (/response/i.test(metric)) return RefreshCw;
  if (/delivery|dispatch|pickup/i.test(metric)) return Truck;
  return Package;
};

export default function ShopsPage() {
  const { t } = useTranslation();
  const [activeChat, setActiveChat] = useState(null);

  const openWhatsApp = (supplier) => {
    window.open(buildSupplierWhatsAppUrl(supplier.name), '_blank', 'noopener,noreferrer');
  };

  const openInAppChat = (supplier) => {
    setActiveChat({
      supplier,
      initialMessage: buildSupplierContactMessage(supplier.name),
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-slate-900 py-8 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
            {t('shops.title')}
          </h1>
          <p className="text-slate-600 text-sm">
            Connect directly with quality-checked shops and verified factory partners
            across China and East Africa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {VERIFIED_SUPPLIERS.map((supplier) => (
            <article
              key={supplier.key}
              className="group bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-200"
            >
              {/* Reliable banner image — badge sits on the image, never over the title */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <SupplierBanner
                  src={supplier.image}
                  fallbackSrc={supplier.fallbackImage}
                  alt={t(supplier.nameKey)}
                />
                <span className="absolute top-3 left-3 z-10 bg-[#E50914] text-white px-2.5 py-1 text-[11px] font-bold uppercase rounded-md shadow-sm">
                  {supplier.badge}
                </span>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 leading-tight group-hover:text-[#E50914] transition-colors">
                      {t(supplier.nameKey)}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {supplier.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 mt-1 shrink-0">
                    <Store size={14} className="text-[#E50914]" />
                    <span className="text-xs font-bold text-[#E50914]">{t('shops.verified')}</span>
                  </div>
                </div>

                {/* Store metrics: rating + response rate + catalogue/service facts */}
                <div className="flex flex-wrap items-center gap-2 mt-2 mb-4">
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-md text-[11px] font-bold">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    {supplier.rating.toFixed(1)} Rating
                  </span>
                  {supplier.metrics.map((metric) => {
                    const Icon = metricIcon(metric);
                    return (
                      <span
                        key={metric}
                        className="inline-flex items-center gap-1 bg-gray-50 text-slate-700 border border-gray-200 px-2 py-1 rounded-md text-[11px] font-semibold"
                      >
                        <Icon size={11} className="text-slate-400" />
                        {metric}
                      </span>
                    );
                  })}
                </div>

                {/* Dual contact actions: WhatsApp + in-app chat */}
                <div className="mt-auto flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => openWhatsApp(supplier)}
                    title={t('shops.contactViaWhatsApp') + supplier.name}
                    aria-label={t('shops.contactViaWhatsApp') + supplier.name}
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5B] text-white rounded-full px-4 py-2.5 text-xs font-bold transition-colors shadow-sm cursor-pointer"
                  >
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white/25">
                      <MessageCircle size={12} />
                    </span>
                    Contact Supplier
                  </button>
                  <button
                    type="button"
                    onClick={() => openInAppChat(supplier)}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full px-4 py-2.5 text-xs font-bold transition-colors shadow-sm cursor-pointer"
                  >
                    <MessageSquare size={13} />
                    Chat in App
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* In-app live chat widget targeted at the selected supplier */}
      {activeChat && (
        <ServiceContactModal
          booking={{
            id: `SUP-${activeChat.supplier.key.toUpperCase()}`,
            userId: 'guest-visitor',
          }}
          providerPhone={HUALINK_WHATSAPP}
          currentUser={{ id: 'guest-visitor', name: 'Guest' }}
          contactName={activeChat.supplier.name}
          contactLabel={activeChat.supplier.badge}
          initialMessage={activeChat.initialMessage}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}
