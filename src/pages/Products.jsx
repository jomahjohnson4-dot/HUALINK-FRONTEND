import { useState } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Smartphone, 
  Tv, 
  Home, 
  Shirt, 
  Boxes, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  Zap,
  Filter
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'All Inventory', icon: Boxes },
  { id: 'smartphones', name: 'Smartphones & Mobile', icon: Smartphone },
  { id: 'electronics', name: 'Electronics & Gadgets', icon: Tv },
  { id: 'home', name: 'Home & Living', icon: Home },
  { id: 'fashion', name: 'Fashion & Apparel', icon: Shirt },
];

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Samsung Galaxy A05s (64GB, Dual SIM)',
    category: 'smartphones',
    price: '310,000 TSH',
    wholesalePrice: '285,000 TSH (Min 5 units)',
    location: 'Dar es Salaam Hub',
    stock: '142 Units',
    verified: true,
    tag: 'Direct Supply',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    name: 'Smart Android LED TV 43 Inch 4K',
    category: 'electronics',
    price: '580,000 TSH',
    wholesalePrice: '530,000 TSH (Bulk)',
    location: 'Mbeya Regional Depot',
    stock: '28 Units',
    verified: true,
    tag: 'Verified Depot',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    name: 'Multi-Function Electric Water Heater Kettle',
    category: 'home',
    price: '35,000 TSH',
    wholesalePrice: '28,000 TSH (Min 10 units)',
    location: 'Dar es Salaam Hub',
    stock: '310 Units',
    verified: true,
    tag: 'Fast Ship',
    image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    name: 'Men Leather Formal Shoes & Boots',
    category: 'fashion',
    price: '65,000 TSH',
    wholesalePrice: '52,000 TSH (Bulk)',
    location: 'Arusha Logistics Hub',
    stock: '85 Pairs',
    verified: false,
    tag: 'Partner Store',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    name: 'Redmi Note 13 Pro (256GB)',
    category: 'smartphones',
    price: '620,000 TSH',
    wholesalePrice: '580,000 TSH (Min 3 units)',
    location: 'Dar es Salaam Hub',
    stock: '64 Units',
    verified: true,
    tag: 'Top Dealer',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 6,
    name: 'Air Convection Fryer & Kitchen Oven',
    category: 'home',
    price: '185,000 TSH',
    wholesalePrice: '160,000 TSH (Bulk)',
    location: 'Mwanza Depot',
    stock: '19 Units',
    verified: true,
    tag: 'Verified Depot',
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80',
  },
];

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-gray-900 min-h-screen text-white pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top Distribution Banner */}
        <div className="bg-gradient-to-r from-red-600 to-black rounded-3xl p-6 sm:p-10 mb-8 border border-red-900/40 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-black/50 border border-red-500/30 rounded-full px-3 py-1 text-xs font-bold text-red-400 mb-4 uppercase tracking-wider">
              <Zap size={14} />
              <span>Direct Wholesale & Retail Inventory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tight text-white uppercase">
              Hualink Supply Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 font-medium">
              Verified product distribution directly from regional depots & trusted supply channels across Tanzania.
            </p>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Search Input */}
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search inventory, SKUs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Category Navigation Panel */}
            <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4 px-2">
                <Filter size={14} className="text-red-500" />
                <span>Categories</span>
              </div>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => {
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
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} />
                        <span>{cat.name}</span>
                      </div>
                      <ChevronRight size={14} className={isActive ? 'text-white' : 'text-gray-500'} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Distribution Verification Badge Box */}
            <div className="bg-gray-800/50 border border-gray-700/60 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-red-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-xs font-extrabold text-white uppercase">Guaranteed Quality</h4>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Every batch item listed on Hualink is quality checked at local hubs before dispatch.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Product Grid */}
          <div className="lg:col-span-3">
            
            {/* Header bar for product list */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-800">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Showing <span className="text-white font-extrabold">{filteredProducts.length}</span> Products
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <SlidersHorizontal size={14} />
                <span>Default Sort: Direct Supply First</span>
              </div>
            </div>

            {/* Product Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-800 border border-gray-700/70 hover:border-red-600/60 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group shadow-lg"
                >
                  <div>
                    {/* Image Header with Custom Badge */}
                    <div className="relative h-48 bg-gray-900 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-red-500 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-red-500/30 uppercase tracking-wider">
                        {product.tag}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1">
                        <CheckCircle2 size={13} className="text-red-500" />
                        <span>{product.location}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                        {product.name}
                      </h3>

                      {/* Stock & Wholesale Info */}
                      <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-gray-400">Retail Unit:</span>
                          <span className="font-extrabold text-white">{product.price}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-gray-400">Wholesale Tier:</span>
                          <span className="font-bold text-red-400">{product.wholesalePrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="p-4 pt-0">
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2">
                      <span>Order Supply</span>
                      <ChevronRight size={14} />
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