import { Link } from 'react-router-dom';
import { Store, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

const SUPPLIERS = [
  {
    name: 'Shenzhen Tech Electronics Co., Ltd.',
    location: 'Shenzhen, China',
    rating: 4.9,
    responseRate: 99,
    badge: 'Verified Gold Supplier',
    image: 'https://images.unsplash.com/photo-1556740734-9b8d24d2a693?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Guangzhou Power & Charger Factory',
    location: 'Guangzhou, China',
    rating: 4.8,
    responseRate: 97,
    badge: 'OEM/ODM Specialized',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'East Africa Regional Logistics & Packaging Ltd',
    location: 'Dar es Salaam / Mbeya Hub',
    rating: 4.7,
    responseRate: 95,
    badge: 'Regional Distribution Partner',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=400',
  },
];

export default function ShopsPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-slate-900 py-8 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
            Verified Hualink Shops &amp; Supplier Storefronts
          </h1>
          <p className="text-slate-600 text-sm">
            Connect directly with quality-checked shops and verified factory partners
            across China and East Africa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUPPLIERS.map((supplier) => (
            <Link
              key={supplier.name}
              to="/supplier/storefront"
              className="group block"
            >
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full group hover:shadow-xl transition-all duration-200">
                <div className="relative aspect-square overflow-hidden bg-gray-50 border-b border-gray-100">
                  <img
                    src={supplier.image}
                    alt={supplier.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 z-10 bg-[#E50914] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    {supplier.badge}
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-black text-gray-900 leading-tight group-hover:text-[#E50914] transition-colors">
                        {supplier.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {supplier.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Store size={14} className="text-[#E50914]" />
                      <span className="text-xs font-bold text-[#E50914]">Verified</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 mb-4">
                    <div className="flex items-center gap-1">
                      <ShieldCheck size={16} className="text-[#E50914]" />
                      <span className="text-xs font-bold text-gray-700">{supplier.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                      <RefreshCw size={14} className="text-slate-400" />
                      <span>{supplier.responseRate}% Response</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <button className="w-full bg-[#E50914] hover:bg-[#C0040F] text-white rounded-full px-4 py-2 text-xs font-bold transition-colors shadow-sm shadow-[#E50914]/30">
                      Contact Supplier
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}