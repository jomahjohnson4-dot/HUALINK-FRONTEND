import { useState } from 'react';
import { 
  Zap, 
  Truck, 
  Palette, 
  Wrench, 
  MapPin, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Compass,
  Boxes,
} from 'lucide-react';

const EXPLORE_CATEGORIES = [
  { id: 'all', name: 'All Distribution Capabilities', icon: Compass },
  { id: 'wholesale', name: 'Bulk Wholesale & Supply', icon: Boxes },
  { id: 'graphics', name: 'TeKeL Graphics & Branding', icon: Palette },
  { id: 'depots', name: 'Regional Depots & Hubs', icon: Building2 },
  { id: 'tech', name: 'IT Support & Maintenance', icon: Wrench },
];

const EXPLORE_CARDS = [
  {
    id: 1,
    title: 'Bulk & Wholesale Product Supply',
    category: 'wholesale',
    tag: 'Direct Distribution',
    badgeColor: 'bg-red-600 text-white',
    description: 'Order electronics, computer hardware, home appliances, and office furniture directly from Hualink central inventory with regional cargo dispatch.',
    highlights: ['Dar es Salaam HQ Stock', 'Bulk Discount Rates', 'Inter-Region Shipping'],
    actionText: 'Browse Bulk Catalog',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'TeKeL Graphics Studio & Brand Assets',
    category: 'graphics',
    tag: 'TeKeL Studio',
    badgeColor: 'bg-orange-500 text-white',
    description: 'High-impact visual identity design including company logos, marketing posters, custom banners, food delivery packaging, and promotional flyers.',
    highlights: ['24-Hour Delivery', 'High Resolution Files', 'Mbeya & Regional Hubs'],
    actionText: 'Explore Brand Design',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'Regional Depot & Logistics Network',
    category: 'depots',
    tag: 'Tanzania Coverage',
    badgeColor: 'bg-blue-600 text-white',
    description: 'Locate Hualink distribution centers across Dar es Salaam, Mbeya, Mwanza, and Arusha for instant local pickup and same-day express dispatch.',
    highlights: ['4 Major Regional Hubs', 'Local Pickup Available', 'Synced Inventory Track'],
    actionText: 'Find Nearby Depot',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    title: 'IT Infrastructure & Hardware Diagnostics',
    category: 'tech',
    tag: 'Technical Services',
    badgeColor: 'bg-emerald-600 text-white',
    description: 'Professional laptop/desktop maintenance, operating system driver setup, networking configurations, and custom client web development.',
    highlights: ['Ubuntu & OS Troubleshooting', 'Cisco Network Setup', 'Verified Hardware Techs'],
    actionText: 'Request Technical Service',
    image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=600&q=80',
  },
];

export default function Explore() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCards = EXPLORE_CARDS.filter((card) => {
    const matchesCategory =
      activeCategory === 'all' || card.category === activeCategory;
    const matchesSearch =
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-gray-900 min-h-screen text-white pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-red-600 to-black rounded-3xl p-6 sm:p-10 mb-8 border border-red-900/40 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-black/50 border border-red-500/30 rounded-full px-3 py-1 text-xs font-bold text-red-400 mb-4 uppercase tracking-wider">
              <Zap size={14} />
              <span>Hualink Distribution Network</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tight text-white uppercase">
              Explore Our Capabilities
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 font-medium">
              Discover Hualink supply chain services, regional distribution depots, TeKeL graphics design, and hardware maintenance solutions.
            </p>
          </div>
        </div>

        {/* Action Feature Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2.5 bg-red-600/20 text-red-500 rounded-xl">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase">Bulk Dispatch</h4>
              <p className="text-[10px] text-gray-400">Direct warehouse delivery</p>
            </div>
          </div>

          <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/20 text-orange-400 rounded-xl">
              <Palette size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase">TeKeL Branding</h4>
              <p className="text-[10px] text-gray-400">Logos, posters & web UI</p>
            </div>
          </div>

          <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
              <MapPin size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase">4 Regional Hubs</h4>
              <p className="text-[10px] text-gray-400">Dar, Mbeya, Mwanza, Arusha</p>
            </div>
          </div>

          <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Wrench size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase">Tech Support</h4>
              <p className="text-[10px] text-gray-400">Hardware & network setups</p>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Search Input */}
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search capabilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4 px-2">
                <Filter size={14} className="text-red-500" />
                <span>Filter Sections</span>
              </div>
              <div className="space-y-1">
                {EXPLORE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                          : 'text-gray-300 hover:bg-gray-700/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon size={16} className="shrink-0" />
                        <span className="truncate">{cat.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quality Assurance Card */}
            <div className="bg-gray-800/50 border border-gray-700/60 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-red-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-xs font-extrabold text-white uppercase">Single Network Operational</h4>
                  <p className="text-[11px] text-gray-400 mt-1">
                    All offerings are handled directly by Hualink Distribution and TeKeL Graphics teams.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Feature Grid */}
          <div className="lg:col-span-3">
            
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-800">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Showing Sections: <span className="text-white font-extrabold">{filteredCards.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-gray-800 border border-gray-700/70 hover:border-red-600/60 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group shadow-lg"
                >
                  <div>
                    {/* Header Image */}
                    <div className="relative h-48 bg-gray-900 overflow-hidden">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className={`absolute top-3 left-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase tracking-wider ${card.badgeColor}`}>
                        {card.tag}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-base font-bold text-white leading-snug">
                        {card.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                        {card.description}
                      </p>

                      {/* Highlights */}
                      <div className="mt-4 pt-3 border-t border-gray-700/50 space-y-2">
                        {card.highlights.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-300 font-medium">
                            <CheckCircle2 size={14} className="text-red-500 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="p-5 pt-0">
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2">
                      <span>{card.actionText}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}