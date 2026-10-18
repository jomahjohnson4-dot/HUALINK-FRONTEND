import { Link } from 'react-router-dom';
import { Search, Sparkles, Mic, Image as ImageIcon, Truck, ArrowRight } from 'lucide-react';

export default function AiSearchModePage() {

  const AI_FEATURES = [
    {
      title: 'Image Search',
      subtitle: 'Upload a product photo to find matching suppliers instantly',
      icon: ImageIcon,
    },
    {
      title: 'Voice Search',
      subtitle: 'Speak your query and let AI find the right products',
      icon: Mic,
    },
    {
      title: 'Smart Filters',
      subtitle: 'AI-powered recommendations based on your sourcing history',
      icon: Sparkles,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-slate-900 py-8 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
            AI Search Mode
          </h1>
          <p className="text-slate-600 text-sm">
            Intelligent product discovery powered by AI — find suppliers faster with
            image, voice, and smart search.
          </p>
        </div>

        {/* AI Search Bar */}
        <div className="bg-white rounded-2xl border-2 border-[#E50914] shadow-lg p-6 mb-10 max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products, suppliers, or services with AI..."
                className="w-full pl-10 pr-4 py-3 focus:outline-none text-base text-gray-800 placeholder:text-gray-400 border-none rounded-full bg-[#F7F7F7]"
              />
            </div>
            <button className="bg-[#E50914] hover:bg-[#C0040F] text-white font-bold px-8 py-3 rounded-full flex items-center gap-2 transition-colors shadow-sm shadow-[#E50914]/30">
              <Sparkles size={16} className="mr-1" />
              AI Search
            </button>
          </div>

          <div className="mt-4 flex flex-wrap justify-start gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <ImageIcon size={14} className="text-gray-600" />
              Image Search
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Mic size={14} className="text-gray-600" />
              Voice Search
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Truck size={14} className="text-gray-600" />
              Fast Shipping
            </button>
          </div>
        </div>

        {/* AI Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AI_FEATURES.map((feature) => {
            return (
              <div key={feature.title} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col h-full group hover:shadow-xl transition-all duration-200">
                <div className="w-12 h-12 rounded-full bg-[#FDF2F2] flex items-center justify-center mb-4 flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-[#E50914]" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2 leading-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  {feature.subtitle}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 flex items-center justify-between max-w-3xl mx-auto">
          <Link to="/shop" className="flex items-center gap-2 px-5 py-3 bg-[#E50914] hover:bg-[#C0040F] text-white rounded-full text-sm font-bold transition-colors shadow-sm shadow-[#E50914]/30">
            Browse Marketplace
            <ArrowRight size={14} className="ml-1" />
          </Link>
          <a href="/suppliers" className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-full text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors">
            View All Suppliers
          </a>
        </div>
      </div>
    </div>
  );
}