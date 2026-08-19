import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  FileText
} from 'lucide-react';

// Comprehensive articles database
const articlesData = {
  'what-is-hualink': {
    category: 'GETTING STARTED',
    title: 'What is Hualink Distribution?',
    updated: 'August 2026',
    author: 'Hualink Supply Operations',
    summary: 'Hualink Distribution is a unified regional supply and logistics network designed to eliminate traditional intermediary markups across Tanzania.',
    content: (
      <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
        <p>
          We connect buyers directly with verified hardware inventory, IT hardware stock, <strong>TeKeL graphics design services</strong>, and custom office furniture.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <h4 className="font-extrabold text-slate-900 text-base">Core Services Overview</h4>
          <ul className="space-y-2 list-disc list-inside text-xs sm:text-sm text-slate-600">
            <li><strong>Regional Depot Dispatch:</strong> Stock hubs located in Dar es Salaam, Mbeya, Arusha, and Mwanza for fast freight turnaround.</li>
            <li><strong>TeKeL Graphics & Brand Identity:</strong> Professional agency design services, UI prototyping, and promotional collateral.</li>
            <li><strong>Enterprise Hardware Stock:</strong> Laptops, networking gear, and office furniture built for direct institutional procurement.</li>
          </ul>
        </div>
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
          <ShieldCheck size={18} className="shrink-0" />
          <span>All dispatches include electronic serial tracking and regional depot receipt verifications.</span>
        </div>
      </div>
    )
  },
  'creating-account': {
    category: 'GETTING STARTED',
    title: 'Creating Your Account',
    updated: 'August 2026',
    author: 'User Onboarding Team',
    summary: 'How to register a business or individual account on Hualink to unlock direct wholesale pricing.',
    content: (
      <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
        <p>Follow these steps to establish your procurement identity on the Hualink platform:</p>
        <ol className="space-y-3 list-decimal list-inside font-medium text-slate-800">
          <li>Click <strong>Register</strong> on the top navigation bar.</li>
          <li>Select your account type (<strong>Individual Buyer</strong> or <strong>Enterprise Business</strong>).</li>
          <li>Fill in your business name, TIN number (for B2B invoicing), and active contact phone.</li>
          <li>Verify your phone number via SMS OTP code.</li>
        </ol>
      </div>
    )
  },
  'account-verification': {
    category: 'GETTING STARTED',
    title: 'Account & Business Verification',
    updated: 'August 2026',
    author: 'Compliance Desk',
    summary: 'Details on compliance requirements for bulk order discounts and tax-exempt purchasing.',
    content: (
      <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
        <p>Verified accounts receive priority dispatch status and custom payment terms for high-volume purchasing.</p>
        <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
          <h5 className="font-bold text-slate-900 text-xs uppercase mb-2">Required Verification Documents</h5>
          <ul className="list-disc list-inside text-xs space-y-1 text-slate-600">
            <li>Certificate of Incorporation or Business Registration</li>
            <li>TIN & VRN Tax Certificates</li>
            <li>National ID (NIDA) of authorized company representative</li>
          </ul>
        </div>
      </div>
    )
  },
  'finding-stock-pricing': {
    category: 'BUYERS & ORDERING',
    title: 'Finding Stock & Pricing',
    updated: 'August 2026',
    author: 'Inventory Desk',
    summary: 'How to search verified stock across localized regional hubs.',
    content: (
      <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
        <p>Navigate to the <strong>Marketplace</strong> page to browse real-time inventory levels. Filter products by regional availability (Dar es Salaam, Mbeya, Mwanza) to ensure minimum transit delay.</p>
      </div>
    )
  },
  'placing-paying-orders': {
    category: 'BUYERS & ORDERING',
    title: 'Placing & Paying for Orders',
    updated: 'August 2026',
    author: 'Finance & Payments',
    summary: 'Accepted payment methods, escrow protection, and direct invoice generation.',
    content: (
      <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
        <p>We support mobile money integrations (M-Pesa, Tigo Pesa, Airtel Money), bank transfers, and direct regional cash receipts upon warehouse collection.</p>
      </div>
    )
  },
  'tracking-dispatch': {
    category: 'BUYERS & ORDERING',
    title: 'Tracking Your Dispatch',
    updated: 'August 2026',
    author: 'Logistics Team',
    summary: 'Real-time tracking for regional depot cargo transport.',
    content: (
      <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
        <p>Once dispatched, enter your Waybill or Order Reference ID into the <strong>Track Active Order</strong> tool to view real-time location logs and driver contact details.</p>
      </div>
    )
  },
  'becoming-wholesale-partner': {
    category: 'WHOLESALE & B2B',
    title: 'Becoming a Wholesale Partner',
    updated: 'August 2026',
    author: 'Partner Relations',
    summary: 'Sell your verified stock or hardware directly on the Hualink supply hub.',
    content: (
      <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
        <p>Distributors and manufacturers can apply to list inventory across Hualink regional depots after completing quality assurance audits.</p>
      </div>
    )
  },
  'bulk-order-management': {
    category: 'WHOLESALE & B2B',
    title: 'Bulk Order Management',
    updated: 'August 2026',
    author: 'Enterprise Operations',
    summary: 'Custom logistics for container-load orders and institutional supply tenders.',
    content: (
      <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
        <p>Institutional clients can request custom proforma invoices and scheduled multi-destination drops through their enterprise portal dashboard.</p>
      </div>
    )
  }
};

const navigationStructure = [
  {
    category: 'GETTING STARTED',
    items: [
      { id: 'what-is-hualink', label: 'What is Hualink Distribution?' },
      { id: 'creating-account', label: 'Creating Your Account' },
      { id: 'account-verification', label: 'Account & Business Verification' },
    ]
  },
  {
    category: 'BUYERS & ORDERING',
    items: [
      { id: 'finding-stock-pricing', label: 'Finding Stock & Pricing' },
      { id: 'placing-paying-orders', label: 'Placing & Paying for Orders' },
      { id: 'tracking-dispatch', label: 'Tracking Your Dispatch' },
    ]
  },
  {
    category: 'WHOLESALE & B2B',
    items: [
      { id: 'becoming-wholesale-partner', label: 'Becoming a Wholesale Partner' },
      { id: 'bulk-order-management', label: 'Bulk Order Management' },
    ]
  }
];

export default function HelpCenter() {
  const [activeArticleId, setActiveArticleId] = useState('what-is-hualink');
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('EN'); // 'EN' | 'SW'

  // Current Active Article Data
  const currentArticle = articlesData[activeArticleId] || articlesData['what-is-hualink'];

  // Live filter articles based on search query
  const filteredNavigation = useMemo(() => {
    if (!searchQuery.trim()) return navigationStructure;

    const query = searchQuery.toLowerCase();
    return navigationStructure.map(group => ({
      ...group,
      items: group.items.filter(item => 
        item.label.toLowerCase().includes(query) ||
        articlesData[item.id]?.summary.toLowerCase().includes(query)
      )
    })).filter(group => group.items.length > 0);
  }, [searchQuery]);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans">
      
      {/* Dynamic Sub-header Navigation */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white font-black flex items-center justify-center text-xs">
                HL
              </div>
              <span className="font-black tracking-tight text-slate-900 text-sm sm:text-base">
                HUALINK <span className="text-red-600">HELP</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-extrabold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                Help Centre
              </span>
            </div>
          </div>

          {/* Right Controls: Search & Language Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative w-48 sm:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-red-500 text-xs rounded-full pl-9 pr-4 py-2 outline-hidden transition-all text-slate-800 placeholder-slate-400"
              />
            </div>

            <button 
              onClick={() => setLanguage(l => l === 'EN' ? 'SW' : 'EN')}
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
                HELP DIRECTORY
              </h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                Interactive
              </span>
            </div>

            <div className="space-y-6">
              {filteredNavigation.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-medium">
                  No articles matched "{searchQuery}"
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

            {/* Quick Order Tracking Action Button */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link 
                to="/orders" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Truck size={16} />
                <span>Track Active Order</span>
              </Link>
            </div>

          </aside>

          {/* ================= RIGHT ARTICLE CONTENT ================= */}
          <main className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xs min-h-[550px]">
            
            {/* Article Meta Header */}
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
                <span>Last updated: {currentArticle.updated}</span>
                <span>•</span>
                <span>Published by {currentArticle.author}</span>
              </div>
            </div>

            {/* Main Article Body Render */}
            <div className="prose prose-slate max-w-none">
              {currentArticle.content}
            </div>

            {/* Article Footer Feedback Bar */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 font-medium">
                Was this article helpful?
              </p>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => alert("Thank you for your feedback!")}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Yes, it helped
                </button>
                <button 
                  onClick={() => alert("Thank you! We will improve this article.")}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  No, I need more help
                </button>
              </div>
            </div>

          </main>

        </div>
      </div>

    </div>
  );
}