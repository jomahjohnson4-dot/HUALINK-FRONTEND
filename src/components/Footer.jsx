import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Share2, 
  MessageSquare, 
  ArrowRight 
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-12 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Main Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-gray-800">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-red-600 flex items-center justify-center font-black tracking-tighter text-base bg-white shadow-xs">
                <span className="text-red-600 italic">H</span>
                <span className="text-black italic -ml-0.5">L</span>
              </div>
              <div className="flex flex-col">
                <div className="text-xl font-black italic tracking-wide">
                  <span className="text-red-600">HUA</span>
                  <span className="text-white">LINK</span>
                </div>
                <span className="text-[9px] text-gray-400 font-extrabold tracking-[0.25em] uppercase">
                  DISTRIBUTION
                </span>
              </div>
            </Link>

            <p className="text-xs text-gray-400 leading-relaxed">
              Redefining direct product distribution through quality-checked stock, verified inventory management, and a unified regional supply network.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-2">
              <button className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-red-600 text-gray-400 hover:text-white transition-all cursor-pointer">
                <Globe size={16} />
              </button>
              <button className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-red-600 text-gray-400 hover:text-white transition-all cursor-pointer">
                <Share2 size={16} />
              </button>
              <button className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-red-600 text-gray-400 hover:text-white transition-all cursor-pointer">
                <MessageSquare size={16} />
              </button>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-red-500">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-medium">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-red-500" />
                  <span>Marketplace Catalog</span>
                </Link>
              </li>
              <li>
                <Link to="/outlets" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-red-500" />
                  <span>Regional Depots & Outlets</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-red-500" />
                  <span>Services & TeKeL Graphics</span>
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-red-500" />
                  <span>Explore Network</span>
                </Link>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-red-500" />
                  <span>Terms & Conditions</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Hualink Supply Scope */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-red-500">
              Hualink Supply Scope
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-medium">
              <li className="hover:text-white transition-colors">Electronics & Hardware Stock</li>
              <li className="hover:text-white transition-colors">TeKeL Graphics & Brand Design</li>
              <li className="hover:text-white transition-colors">Custom Office & Home Furniture</li>
              <li className="hover:text-white transition-colors">Computers & Networking Maintenance</li>
              <li className="hover:text-white transition-colors">Bulk Order Cargo Dispatch</li>
            </ul>
          </div>

          {/* Column 4: Vertical Contact Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-red-500">
              Contact Information
            </h4>
            
            <div className="space-y-4 pt-1">
              {/* Main Address */}
              <div className="flex items-start gap-3 text-xs text-gray-300">
                <div className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-red-500 mt-0.5">
                  <MapPin size={16} />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Main Address</span>
                  <span className="font-medium text-white">Dar es Salaam, Tanzania</span>
                </div>
              </div>

              {/* Direct Hotline */}
              <div className="flex items-start gap-3 text-xs text-gray-300">
                <div className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-red-500 mt-0.5">
                  <Phone size={16} />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Direct Hotline</span>
                  <span className="font-medium text-white">+255 760 706 872</span>
                </div>
              </div>

              {/* Official Email */}
              <div className="flex items-start gap-3 text-xs text-gray-300">
                <div className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-red-500 mt-0.5">
                  <Mail size={16} />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Official Email</span>
                  <span className="font-medium text-white">info@hualink.co.tz</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 text-center text-xs text-gray-500 font-medium">
          All rights reserved. © 2026 HUALINK DISTRIBUTION.
        </div>

      </div>
    </footer>
  );
}