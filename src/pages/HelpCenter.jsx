import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  BookOpen, 
  ChevronRight, 
  CheckCircle, 
  Truck, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  Globe,
  FileText,
  Palette,
  Layers,
  PhoneCall,
  CreditCard,
  Building2
} from 'lucide-react';

// Comprehensive localized articles database
// Every string below is resolved through i18next, so the factory receives the
// active `t` function and returns the copy in the currently selected language.
const buildArticlesData = (t) => ({
  'what-is-hualink': {
    category: t('help.categories.gettingStarted'),
    title: t('help.articles.whatIsHualink.title'),
    updated: t('help.articles.whatIsHualink.updated'),
    author: t('help.articles.whatIsHualink.author'),
    summary: t('help.articles.whatIsHualink.summary'),
    content: (
      <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
        <p>
          {t('help.articles.whatIsHualink.content.introLead')}<strong>{t('help.articles.whatIsHualink.content.introEmphasis')}</strong>{t('help.articles.whatIsHualink.content.introTail')}
        </p>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-4">
          <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">
            {t('help.articles.whatIsHualink.content.ecosystemTitle')}
          </h4>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <Truck size={18} className="text-red-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900">{t('help.articles.whatIsHualink.content.hubLabel')}</strong>{t('help.articles.whatIsHualink.content.hubBody')}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Palette size={18} className="text-red-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900">{t('help.articles.whatIsHualink.content.tekelLabel')}</strong>{t('help.articles.whatIsHualink.content.tekelBody')}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Layers size={18} className="text-red-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900">{t('help.articles.whatIsHualink.content.hardwareLabel')}</strong>{t('help.articles.whatIsHualink.content.hardwareBody')}
              </span>
            </li>
          </ul>
        </div>

        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
          <ShieldCheck size={18} className="shrink-0 text-red-600" />
          <span>{t('help.articles.whatIsHualink.content.trackingNote')}</span>
        </div>
      </div>
    )
  },
  'creating-account': {
    category: t('help.categories.gettingStarted'),
    title: t('help.articles.creatingAccount.title'),
    updated: t('help.articles.creatingAccount.updated'),
    author: t('help.articles.creatingAccount.author'),
    summary: t('help.articles.creatingAccount.summary'),
    content: (
      <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
        <p>{t('help.articles.creatingAccount.content.intro')}</p>
        
        <div className="space-y-3">
          <h4 className="font-extrabold text-slate-900 text-sm">{t('help.articles.creatingAccount.content.stepsTitle')}</h4>
          <ol className="space-y-3 list-decimal list-inside font-medium text-slate-800 text-xs sm:text-sm">
            <li>{t('help.articles.creatingAccount.content.step1Lead')}<strong className="text-red-600">{t('help.articles.creatingAccount.content.step1Emphasis')}</strong>{t('help.articles.creatingAccount.content.step1Tail')}</li>
            <li>{t('help.articles.creatingAccount.content.step2Lead')}<strong>{t('help.articles.creatingAccount.content.step2EmphasisA')}</strong>{t('help.articles.creatingAccount.content.step2Middle')}<strong>{t('help.articles.creatingAccount.content.step2EmphasisB')}</strong>{t('help.articles.creatingAccount.content.step2Tail')}</li>
            <li>{t('help.articles.creatingAccount.content.step3Lead')}<code>0781359770</code>{t('help.articles.creatingAccount.content.step3Tail')}</li>
            <li>{t('help.articles.creatingAccount.content.step4')}</li>
            <li>{t('help.articles.creatingAccount.content.step5')}</li>
          </ol>
        </div>
      </div>
    )
  },
  'account-verification': {
    category: t('help.categories.gettingStarted'),
    title: t('help.articles.accountVerification.title'),
    updated: t('help.articles.accountVerification.updated'),
    author: t('help.articles.accountVerification.author'),
    summary: t('help.articles.accountVerification.summary'),
    content: (
      <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
        <p>{t('help.articles.accountVerification.content.intro')}</p>
        
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <h5 className="font-black text-slate-900 text-xs uppercase tracking-wider">{t('help.articles.accountVerification.content.documentsTitle')}</h5>
          <ul className="list-disc list-inside text-xs space-y-2 text-slate-600">
            <li>{t('help.articles.accountVerification.content.document1')}</li>
            <li>{t('help.articles.accountVerification.content.document2')}</li>
            <li>{t('help.articles.accountVerification.content.document3')}</li>
            <li>{t('help.articles.accountVerification.content.document4')}</li>
          </ul>
        </div>
      </div>
    )
  },
  'finding-stock-pricing': {
    category: t('help.categories.buyersOrdering'),
    title: t('help.articles.findingStockPricing.title'),
    updated: t('help.articles.findingStockPricing.updated'),
    author: t('help.articles.findingStockPricing.author'),
    summary: t('help.articles.findingStockPricing.summary'),
    content: (
      <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
        <p>{t('help.articles.findingStockPricing.content.intro')}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-1">
            <span className="font-extrabold text-slate-900 block">{t('help.articles.findingStockPricing.content.depotTitle')}</span>
            <p className="text-slate-500">{t('help.articles.findingStockPricing.content.depotBody')}</p>
          </div>
          <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-1">
            <span className="font-extrabold text-slate-900 block">{t('help.articles.findingStockPricing.content.tierTitle')}</span>
            <p className="text-slate-500">{t('help.articles.findingStockPricing.content.tierBody')}</p>
          </div>
        </div>
      </div>
    )
  },
  'placing-paying-orders': {
    category: t('help.categories.buyersOrdering'),
    title: t('help.articles.placingPayingOrders.title'),
    updated: t('help.articles.placingPayingOrders.updated'),
    author: t('help.articles.placingPayingOrders.author'),
    summary: t('help.articles.placingPayingOrders.summary'),
    content: (
      <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
        <p>{t('help.articles.placingPayingOrders.content.intro')}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-1">
            <span className="font-black text-slate-900 block">{t('help.articles.placingPayingOrders.content.mPesaTitle')}</span>
            <p className="text-slate-500">{t('help.articles.placingPayingOrders.content.mPesaBody')}</p>
          </div>
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-1">
            <span className="font-black text-slate-900 block">{t('help.articles.placingPayingOrders.content.airtelTitle')}</span>
            <p className="text-slate-500">{t('help.articles.placingPayingOrders.content.airtelBody')}</p>
          </div>
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-1">
            <span className="font-black text-slate-900 block">{t('help.articles.placingPayingOrders.content.azamTitle')}</span>
            <p className="text-slate-500">{t('help.articles.placingPayingOrders.content.azamBody')}</p>
          </div>
        </div>
      </div>
    )
  },
  'tracking-dispatch': {
    category: t('help.categories.buyersOrdering'),
    title: t('help.articles.trackingDispatch.title'),
    updated: t('help.articles.trackingDispatch.updated'),
    author: t('help.articles.trackingDispatch.author'),
    summary: t('help.articles.trackingDispatch.summary'),
    content: (
      <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
        <p>{t('help.articles.trackingDispatch.content.introLead')}<strong>{t('help.articles.trackingDispatch.content.introEmphasis')}</strong>{t('help.articles.trackingDispatch.content.introTail')}</p>
        
        <ol className="space-y-3 list-decimal list-inside text-xs sm:text-sm font-semibold text-slate-800">
          <li><strong>{t('help.articles.trackingDispatch.content.phase1Label')}</strong>{t('help.articles.trackingDispatch.content.phase1Body')}</li>
          <li><strong>{t('help.articles.trackingDispatch.content.phase2Label')}</strong>{t('help.articles.trackingDispatch.content.phase2Body')}</li>
          <li><strong>{t('help.articles.trackingDispatch.content.phase3Label')}</strong>{t('help.articles.trackingDispatch.content.phase3Body')}</li>
          <li><strong>{t('help.articles.trackingDispatch.content.phase4Label')}</strong>{t('help.articles.trackingDispatch.content.phase4Body')}</li>
        </ol>
      </div>
    )
  },
  'becoming-wholesale-partner': {
    category: t('help.categories.wholesaleB2b'),
    title: t('help.articles.becomingWholesalePartner.title'),
    updated: t('help.articles.becomingWholesalePartner.updated'),
    author: t('help.articles.becomingWholesalePartner.author'),
    summary: t('help.articles.becomingWholesalePartner.summary'),
    content: (
      <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
        <p>{t('help.articles.becomingWholesalePartner.content.body')}</p>
      </div>
    )
  },
  'bulk-order-management': {
    category: t('help.categories.wholesaleB2b'),
    title: t('help.articles.bulkOrderManagement.title'),
    updated: t('help.articles.bulkOrderManagement.updated'),
    author: t('help.articles.bulkOrderManagement.author'),
    summary: t('help.articles.bulkOrderManagement.summary'),
    content: (
      <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
        <p>{t('help.articles.bulkOrderManagement.content.body')}</p>
      </div>
    )
  }
});

const buildNavigationStructure = (t) => [
  {
    category: t('help.categories.gettingStarted'),
    items: [
      { id: 'what-is-hualink', label: t('help.articles.whatIsHualink.title') },
      { id: 'creating-account', label: t('help.articles.creatingAccount.title') },
      { id: 'account-verification', label: t('help.articles.accountVerification.title') }
    ]
  },
  {
    category: t('help.categories.buyersOrdering'),
    items: [
      { id: 'finding-stock-pricing', label: t('help.articles.findingStockPricing.title') },
      { id: 'placing-paying-orders', label: t('help.articles.placingPayingOrders.title') },
      { id: 'tracking-dispatch', label: t('help.navigation.trackingDispatch') }
    ]
  },
  {
    category: t('help.categories.wholesaleB2b'),
    items: [
      { id: 'becoming-wholesale-partner', label: t('help.articles.becomingWholesalePartner.title') },
      { id: 'bulk-order-management', label: t('help.articles.bulkOrderManagement.title') }
    ]
  }
];

export default function HelpCenter() {
  const { t, i18n } = useTranslation();
  const [activeArticleId, setActiveArticleId] = useState('what-is-hualink');
  const [searchQuery, setSearchQuery] = useState('');

  // The page follows the application-wide language selection, so the globe
  // toggle simply switches between English and Swahili.
  const language = (i18n.language || 'en').slice(0, 2).toUpperCase();

  // Localized copy for the active language — rebuilt whenever it changes.
  const articles = useMemo(() => buildArticlesData(t), [t]);
  const navigation = useMemo(() => buildNavigationStructure(t), [t]);

  // Current Active Article Data
  const currentArticle = articles[activeArticleId] || articles['what-is-hualink'];

  // Live filter articles based on search query
  const filteredNavigation = useMemo(() => {
    if (!searchQuery.trim()) return navigation;

    const query = searchQuery.toLowerCase();
    return navigation.map(group => ({
      ...group,
      items: group.items.filter(item => 
        item.label.toLowerCase().includes(query) ||
        articles[item.id]?.summary.toLowerCase().includes(query)
      )
    })).filter(group => group.items.length > 0);
  }, [searchQuery, navigation, articles]);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans pb-16">
      
      {/* Dynamic Sub-header Navigation */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-600 text-white font-black flex items-center justify-center text-xs">
                HL
              </div>
              <span className="font-black tracking-tight text-slate-900 text-sm sm:text-base">
                HUALINK <span className="text-red-600">{t('help.brandHelp')}</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-extrabold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                {t('common.helpCenter')}
              </span>
            </div>
          </div>

          {/* Search & Language Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative w-48 sm:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder={t('help.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-red-500 text-xs rounded-full pl-9 pr-4 py-2 outline-hidden transition-all text-slate-800 placeholder-slate-400 font-medium"
              />
            </div>

            <button 
              onClick={() => i18n.changeLanguage(language === 'EN' ? 'sw' : 'en')}
              aria-label={t('common.languageSelector')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Globe size={14} className="text-slate-500" />
              <span>{language}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT SIDEBAR ================= */}
          <aside className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs sticky top-24">
            
            <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">
                {t('help.directory')}
              </h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                {t('help.interactive')}
              </span>
            </div>

            <div className="space-y-6">
              {filteredNavigation.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-medium">
                  {t('help.noArticlesFound', { query: searchQuery })}
                </div>
              ) : (
                filteredNavigation.map((group, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                      {group.category}
                    </h4>
                    
                    <ul className="space-y-1">
                      {group.items.map((item) => {
                        const isActive = activeArticleId === item.id;
                        return (
                          <li key={item.id}>
                            <button
                              onClick={() => setActiveArticleId(item.id)}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
                                isActive 
                                  ? 'bg-red-50 text-red-600 border border-red-200/60 shadow-xs' 
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              <span className="line-clamp-1">{item.label}</span>
                              <ChevronRight 
                                size={14} 
                                className={`shrink-0 transition-transform ${
                                  isActive ? 'translate-x-0.5 text-red-600' : 'text-slate-300 group-hover:text-slate-500'
                                }`} 
                              />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>

            {/* Quick Order Tracking Button */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link 
                to="/orders" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Truck size={16} />
                <span>{t('help.trackActiveOrder')}</span>
              </Link>
            </div>

          </aside>

          {/* ================= RIGHT ARTICLE CONTENT ================= */}
          <main className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xs min-h-[550px]">
            
            {/* Meta Header */}
            <div className="border-b border-slate-100 pb-6 mb-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-red-100 text-red-600 rounded-lg">
                  <BookOpen size={16} />
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-red-600">
                  {currentArticle.category}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {currentArticle.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
                <span>{t('help.lastUpdated', { date: currentArticle.updated })}</span>
                <span>•</span>
                <span>{t('help.publishedBy', { author: currentArticle.author })}</span>
              </div>
            </div>

            {/* Article Render */}
            <div className="prose prose-slate max-w-none">
              {currentArticle.content}
            </div>

            {/* Article Footer Feedback */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 font-medium">
                {t('help.wasHelpful')}
              </p>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => alert(t('help.feedbackThanks'))}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {t('help.yesHelped')}
                </button>
                <button 
                  onClick={() => alert(t('help.feedbackImprove'))}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {t('help.needMoreHelp')}
                </button>
              </div>
            </div>

          </main>

        </div>
      </div>

    </div>
  );
}
