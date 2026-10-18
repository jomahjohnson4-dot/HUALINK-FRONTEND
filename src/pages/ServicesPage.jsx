import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function ServicesPage() {
  const SERVICES = [
    {
      title: 'Global Freight Forwarding',
      subtitle: 'Air & Sea freight tracking from China / Asia to East Africa',
      image: 'https://images.unsplash.com/photo-1505107937205-30e16f4514df?auto=format&fit=crop&q=80&w=400',
      features: ['Door-to-door delivery', 'Real-time tracking', 'Bulk cargo handling'],
    },
    {
      title: 'Customs Clearance & Duty Consultation',
      subtitle: 'Fast-track TRA compliance and bulk shipment handling',
      image: 'https://images.unsplash.com/photo-1556740738-9b8d24d2a693?auto=format&fit=crop&q=80&w=400',
      features: ['TRA compliance', 'Duty calculation', 'Documentation support'],
    },
    {
      title: 'Sourcing & Quality Inspection',
      subtitle: 'On-site factory inspection before dispatch',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400',
      features: ['Pre-shipment inspection', 'Quality control', 'Factory audits'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-slate-900 py-8 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
            Hualink Services &amp; Global Trade
          </h1>
          <p className="text-slate-600 text-sm">
            End-to-end international procurement, customs clearance, and shipping
            solutions connecting China, Asia, and East Africa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map((service) => (
            <Link
              key={service.title}
              to="/services/book"
              className="group block"
            >
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full group hover:shadow-xl transition-all duration-200">
                <div className="relative aspect-square overflow-hidden bg-gray-50 border-b border-gray-100">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 z-10 bg-[#E50914] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    Global
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-black text-gray-900 leading-tight mb-2 group-hover:text-[#E50914] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mb-4 leading-relaxed">
                    {service.subtitle}
                  </p>

                  <div className="mt-auto">
                    <ul className="space-y-2 mb-4">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                          <CheckCircle2 size={12} className="text-[#E50914]" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button className="w-full bg-[#E50914] hover:bg-[#C0040F] text-white rounded-full px-4 py-2 text-xs font-bold transition-colors shadow-sm shadow-[#E50914]/30">
                      Inquire Now
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