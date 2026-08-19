import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  BookOpen, 
  ShieldCheck, 
  Truck, 
  Building2, 
  HelpCircle, 
  Globe, 
  Layers, 
  ExternalLink 
} from 'lucide-react';

export default function Documentation() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('EN');

  const stats = [
    { value: '31', label: 'Regions Covered in Tanzania', icon: MapPinIcon },
    { value: '2', label: 'Languages (English & Swahili)', icon: Globe },
    { value: '100%', label: 'Direct Logistics Transparency', icon: ShieldCheck }
  ];

  const quickCategories = [
    {
      title: 'Platform Overview',
      desc: 'Understand Hualink direct supply chains, verified stock listings, and regional depots.',
      icon: Layers,
      link: '/docs/help#getting-started'
    },
    {
      title: 'Wholesale & B2B Purchasing',
      desc: 'Guides for bulk ordering, tax clearance invoicing, and regional depot pickup.',
      icon: Building2,
      link: '/docs/help#wholesale'
    },
    {
      title: 'Order Dispatch & Tracking',
      desc: 'How to track live shipments across Dar es Salaam, Mbeya, Arusha, and Mwanza hubs.',
      icon: Truck,
      link: '/docs/help#tracking'
    },
    {
      title: 'TeKeL Brand & Tech Services',
      desc: 'Requesting custom design, UI prototyping, and hardware maintenance.',
      icon: BookOpen,
      link: '/docs/help#tekel'
    }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/docs/help?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Top Docs Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full border-2 border-red-600 flex items-center justify-center font-black tracking-tighter text-sm bg-white">
                <span className="text-red-600 italic">H</span>
                <span className="text-black italic -ml-0.5">L</span>
              </div>
              <span className="font-black text-lg tracking-tight italic">
                <span className="text-red-600">HUA</span>LINK <span className="text-xs font-bold text-slate-500 uppercase not-italic">Docs</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-2 text-xs font-bold">
              <Link to="/docs" className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-900">
                Documentation
              </Link>
              <Link to="/docs/help" className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-900 transition-colors">
                Help Centre
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-64 lg:w-80">
              <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-transparent focus:border-red-600 focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all"
              />
            </form>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-[11px] font-black">
              <button
                onClick={() => setLanguage('EN')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  language === 'EN' ? 'bg-red-600 text-white' : 'text-slate-600'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('SW')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  language === 'SW' ? 'bg-red-600 text-white' : 'text-slate-600'
                }`}
              >
                SW
              </button>
            </div>

            <Link
              to="/"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all"
            >
              <span>Visit Portal</span>
              <ExternalLink size={14} />
            </Link>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-black uppercase tracking-wider">
          <ShieldCheck size={14} />
          <span>Official Distribution Knowledgebase</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Everything You Need to Know About <span className="text-red-600 italic">Hualink Distribution</span>
        </h1>

        <p className="text-base sm:text-lg font-semibold text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Comprehensive operational guides, regional delivery schedules, wholesale registration details, and technical maintenance reference manuals.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/docs/help"
            className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-red-600/25 transition-all"
          >
            <span>Browse Help Centre</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-2">
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
              <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Category Guides */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Explore Documentation Hubs</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickCategories.map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={idx}
                to={cat.link}
                className="bg-white p-8 rounded-3xl border border-slate-200/80 hover:border-red-600 hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <IconComponent size={24} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-red-600 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-extrabold text-red-600 pt-2">
                  <span>Read Guides</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

    </div>
  );
}

function MapPinIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-8-7.5-8-12a8 8 0 1116 0c0 4.5-8 12-8 12z" />
      <circle cx="12" cy="9" r="3" />
    </svg>
  );
}