import { useState } from 'react';
import { 
  Monitor, 
  Palette, 
  Armchair, 
  Wrench, 
  Search, 
  Filter, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Zap,
  Sparkles,
  MessageSquare,
  X,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ServiceContactModal from '../components/modals/ServiceContactModal';

const SERVICE_CATEGORIES = [
  { id: 'all', nameKey: 'servicesAlt.allServices', icon: Sparkles },
  { id: 'web', nameKey: 'servicesAlt.webAppDevelopment', icon: Monitor },
  { id: 'graphic', nameKey: 'servicesAlt.teKelGraphicsBranding', icon: Palette },
  { id: 'furniture', nameKey: 'servicesAlt.customFurniture', icon: Armchair },
  { id: 'tech', nameKey: 'servicesAlt.technicalSupport', icon: Wrench },
];

const MOCK_SERVICES = [
  {
    id: 1,
    title: 'Custom Web & Mobile App Development',
    category: 'web',
    provider: 'Hualink Tech Solutions',
    phone: '255758139770',
    price: 'From 700,000 TSH',
    timeline: '5-10 Days Delivery',
    location: 'Dar es Salaam & Online',
    description: 'Professional responsive web applications, e-commerce storefronts, and custom client-side software engineered with modern UI/UX standards.',
    tag: 'Top Rated',
    status: 'Online Now',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'Logo, Posters, Flyers & Brand Banners',
    category: 'graphic',
    provider: 'TeKeL Graphics Studio',
    phone: '255758139770',
    price: 'From 25,000 TSH',
    timeline: '24 Hours Turnaround',
    location: 'Mbeya & Regional Hubs',
    description: 'High-impact visual identity design, custom company logos, marketing posters, social media banners, and promotional print assets.',
    tag: 'TeKeL Branding',
    status: 'Fast Response',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'Modern Office & Home Furniture Supply',
    category: 'furniture',
    provider: 'Hualink Logistics & Interiors',
    phone: '255758139770',
    price: 'From 150,000 TSH',
    timeline: 'Instant Stock / 3 Days Custom',
    location: 'Dar es Salaam Depot',
    description: 'Durable executive desks, ergonomic office chairs, custom shelving units, and contemporary home furnishing solutions built for longevity.',
    tag: 'Direct Supply',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    title: 'Computer Maintenance, Repair & Networking',
    category: 'tech',
    provider: 'Hualink Systems Support',
    phone: '255758139770',
    price: 'From 30,000 TSH',
    timeline: 'Same Day Service',
    location: 'All Regional Depots',
    description: 'Professional laptop/desktop hardware diagnosis, operating system troubleshooting, driver installation, and office network routing setups.',
    tag: 'Verified Tech',
    status: 'Online Now',
    image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    title: 'Agency Dashboard & Web UI Prototyping',
    category: 'web',
    provider: 'Hualink Tech Solutions',
    phone: '255758139770',
    price: 'From 450,000 TSH',
    timeline: '4 Days Delivery',
    location: 'Online Delivery',
    description: 'Dark-themed creative studio dashboards, custom client portals, and interactive web interfaces designed for maximum performance.',
    tag: 'Pro Feature',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 6,
    title: 'Custom Product Packaging & Promotional Banners',
    category: 'graphic',
    provider: 'TeKeL Graphics Studio',
    phone: '255758139770',
    price: 'From 50,000 TSH',
    timeline: '2 Days Delivery',
    location: 'Mbeya Hub',
    description: 'Custom product packaging labels, roll-up banners, billboard graphics, and promotional flyers tailored to your brand identity.',
    tag: 'TeKeL Special',
    status: 'Fast Response',
    image: 'https://images.unsplash.com/photo-1542744094-3a31243324d0?auto=format&fit=crop&w=600&q=80',
  },
];

export default function Services() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Booking Modal State
  const [activeServiceModal, setActiveServiceModal] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '', note: '' });

  // Saved Booking & Live Chat Modal State
  const [submittedBooking, setSubmittedBooking] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const filteredServices = MOCK_SERVICES.filter((service) => {
    const matchesCategory =
      selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleWhatsAppClick = (service) => {
    const text = encodeURIComponent(
      `Hello ${service.provider}! 👋\n\nI am contacting you via *Hualink Hub* regarding:\n📌 *${service.title}*\n\nEstimated Price: ${service.price}\nLocation/Target: ${service.location}\n\nI would like to inquire about starting this service.`
    );
    window.open(`https://wa.me/${service.phone}?text=${text}`, '_blank');
  };

  const handleOpenModal = (service) => {
    setActiveServiceModal(service);
    setIsSubmitted(false);
    setIsLoading(false);
    setErrorMessage('');
    setFormData({ name: '', phone: '', note: '' });
  };

  const handleCloseModal = () => {
    setActiveServiceModal(null);
    setIsSubmitted(false);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceTitle: activeServiceModal.title,
          provider: activeServiceModal.provider,
          clientName: formData.name,
          clientPhone: formData.phone,
          note: formData.note,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmittedBooking(data.data);
        setIsSubmitted(true);
      } else {
        setErrorMessage(data.message || t('servicesAlt.bookingFailed'));
      }
    } catch (error) {
      setErrorMessage(t('servicesAlt.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white pt-6 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-red-600 to-black rounded-3xl p-6 sm:p-10 mb-8 border border-red-900/40 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-black/50 border border-red-500/30 rounded-full px-3 py-1 text-xs font-bold text-red-400 mb-4 uppercase tracking-wider">
              <Zap size={14} />
              <span>{t('servicesAlt.bannerBadge')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tight text-white uppercase">
              {t('servicesAlt.bannerTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 font-medium">
              {t('servicesAlt.bannerSubtitle')}
            </p>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filter Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder={t('servicesAlt.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4 px-2">
                <Filter size={14} className="text-red-500" />
                <span>{t('servicesAlt.serviceCategories')}</span>
              </div>
              <div className="space-y-1">
                {SERVICE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                          : 'text-gray-300 hover:bg-gray-700/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon size={16} className="shrink-0" />
                        <span className="truncate">{t(cat.nameKey)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/60 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-red-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-xs font-extrabold text-white uppercase">{t('servicesAlt.verifiedStandards')}</h4>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {t('servicesAlt.verifiedStandardsDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Cards Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-800">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {t('servicesAlt.availableServices')} <span className="text-white font-extrabold">{filteredServices.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-gray-800 border border-gray-700/70 hover:border-red-600/60 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group shadow-lg"
                >
                  <div>
                    <div className="relative h-48 bg-gray-900 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-red-500 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-red-500/30 uppercase tracking-wider">
                        {service.tag}
                      </span>

                      <span className="absolute top-3 right-3 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        service.status === 'Online Now' ? t('servicesAlt.onlineNow') : service.status === 'Fast Response' ? t('servicesAlt.fastResponse') : service.status === 'Available' ? t('servicesAlt.available') : service.status
                      </span>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-1.5 text-[11px] text-red-400 font-bold mb-1">
                        <CheckCircle2 size={13} />
                        <span>{service.provider}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                        {service.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                        {service.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-gray-700/50 space-y-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-gray-400">{t('servicesAlt.estimate')}</span>
                          <span className="font-extrabold text-white">{service.price}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-gray-400">{t('servicesAlt.timeline')}</span>
                          <span className="font-bold text-red-400">{service.timeline}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 space-y-2">
                    <button 
                      onClick={() => handleOpenModal(service)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-red-600/20"
                    >
                      <span>{t('servicesAlt.bookService')}</span>
                      <ArrowRight size={14} />
                    </button>

                    <button 
                      onClick={() => handleWhatsAppClick(service)}
                      className="w-full bg-gray-900/80 hover:bg-gray-900 border border-emerald-500/40 hover:border-emerald-500/80 text-emerald-400 hover:text-emerald-300 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={14} />
                      <span>{t('servicesAlt.chatOnWhatsApp')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Booking Form Modal */}
      {activeServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-5">
            
            <button 
              onClick={handleCloseModal}
              disabled={isLoading}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-full bg-gray-700/60 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X size={18} />
            </button>

            {!isSubmitted ? (
              <>
                <div>
                  <span className="text-[10px] font-black uppercase text-red-400 tracking-wider">
                    {activeServiceModal.provider}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1 leading-snug">
                    {t('servicesAlt.bookServiceTitle')}: {activeServiceModal.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('servicesAlt.estimateLabel')} <span className="text-white font-bold">{activeServiceModal.price}</span>
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitBooking} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                      {t('servicesAlt.fullName')}
                    </label>
                    <input 
                      type="text" 
                      required 
                      disabled={isLoading}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('servicesAlt.fullNamePlaceholder')} 
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                      {t('servicesAlt.phoneNumber')}
                    </label>
                    <input 
                      type="tel" 
                      required 
                      disabled={isLoading}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder={t('servicesAlt.phonePlaceholder')} 
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                      {t('servicesAlt.projectScope')}
                    </label>
                    <textarea 
                      rows="3" 
                      required 
                      disabled={isLoading}
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="{t('servicesAlt.projectScopePlaceholder')}" 
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors disabled:opacity-50"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-red-600/20 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>{t('servicesAlt.sendingRequest')}</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>{t('servicesAlt.submitServiceOrder')}</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="py-4 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{t('servicesAlt.bookingSent')}</h4>
                  <p className="text-xs text-gray-400 mt-2">
                    {t('servicesAlt.bookingThanks')} <span className="text-white font-semibold">{formData.name}</span>. {t('servicesAlt.bookingContact')} <span className="text-white font-semibold">{activeServiceModal.provider}</span> {t('servicesAlt.bookingWillContact')} <span className="text-white font-semibold">{formData.phone}</span>. {t('servicesAlt.bookingSms')}
                  </p>
                  {submittedBooking?.id && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      {t('servicesAlt.bookingId')} <span className="font-mono text-white">#{submittedBooking.id}</span>
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      handleCloseModal();
                      setShowContactModal(true);
                    }}
                    className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-extrabold text-xs rounded-xl transition-colors cursor-pointer shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare size={14} />
                    <span>{t('servicesAlt.openLiveChat')}</span>
                  </button>
                  <button 
                    type="button"
                    onClick={handleCloseModal} 
                    className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Live Chat Modal Component */}
      {showContactModal && submittedBooking && (
        <ServiceContactModal
          booking={submittedBooking}
          providerPhone="255758139770"
          currentUser={{ 
            id: submittedBooking.clientPhone || formData.phone, 
            name: submittedBooking.clientName || formData.name 
          }}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
}