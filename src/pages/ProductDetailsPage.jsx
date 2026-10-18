import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [quantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('Black');
  const [mainImage, setMainImage] = useState(null);

  const COLORS = ['Black', 'Blue', 'Red', 'White'];

  const breadcrumbItems = ['Home', 'Electronics', 'Audio & Speakers', 'Bluetooth Speakers', 'JBL CHARGE 5'];

  const mainImageUrl =
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=800';

  const thumbnailImages = [
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1589492998650-0284e2e11e6b?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1604006070277-07a9a1e2c3e0?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1604668835970-d9bbfb04a440?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1603023092738-7b219502e67a?auto=format&fit=crop&q=80&w=400',
  ];

  const price = 520000;

  const handleAddToCart = () => {
    window.location.href = `/shop?add=${id}&qty=${quantity}&color=${selectedColor}`;
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-slate-900 py-8 px-4 md:px-12">
      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto mb-6">
        <ol className="flex items-center gap-2 text-xs font-medium text-slate-600">
          {breadcrumbItems.map((item, idx) => (
            <li key={item} className="flex items-center gap-1">
              {idx < breadcrumbItems.length - 1 ? (
                <>
                  <Link to="/" className="hover:text-[#E50914] transition-colors">{item}</Link>
                  <ArrowLeft size={12} className="text-slate-400" />
                </>
              ) : (
                <span className="text-[#E50914] font-bold">{item}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Vertical Thumbnails */}
        <div className="lg:col-span-2 hidden lg:block">
          <div className="flex flex-col gap-2">
            {thumbnailImages.map((thumb, i) => (
              <button
                key={i}
                onClick={() => setMainImage(thumb)}
                className={`w-14 h-14 rounded-lg border cursor-pointer overflow-hidden ${mainImage === thumb ? 'border-[#E50914]' : 'border-gray-200 hover:border-[#E50914]'}`}
              >
                <img src={thumb} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Center Column - Main Image */}
        <div className="lg:col-span-4">
          <div className="w-full max-w-lg h-96 flex items-center justify-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
            <img src={mainImage || mainImageUrl} alt="Product" className="max-h-full max-w-full object-contain" />
          </div>
        </div>

        {/* Right Column - Product Details */}
        <div className="lg:col-span-6">
          {/* Brand */}
          <span className="text-[11px] font-black uppercase tracking-widest text-[#E50914] block mb-2">
            HUALINK CERTIFIED / JBL
          </span>

          {/* Title */}
          <h1 className="text-xl font-black text-gray-900 leading-tight mb-4">
            JBL CHARGE 5 Tanzania - Portable Bluetooth Speaker with IP67 Waterproof and USB Charge out
          </h1>

          {/* Rating & Model */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gray-700">4.7</span>
              <span className="text-xs text-yellow-500">★</span>
              <span className="text-xs text-slate-600 font-medium">(10 ratings)</span>
            </div>
            <span className="text-xs text-slate-500">Model Number: JBLCharge5</span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-2xl font-black text-[#E50914]">{price} TSh</span>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-3">
              Select Color
            </span>
            <div className="flex items-center gap-3">
              {COLORS.map((color) => {
                const isSelected = selectedColor === color;
                const colorMap = {
                  Black: '#111111',
                  Blue: '#1E40AF',
                  Red: '#DC2626',
                  White: '#F8FAFC',
                };
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full cursor-pointer transition-all ${isSelected ? 'ring-3 ring-[#E50914]' : 'ring-1 ring-transparent hover:ring-gray-300'}`}
                    style={{ backgroundColor: colorMap[color] }}
                  />
                );
              })}
            </div>
          </div>

          {/* About this item */}
          <div className="mb-6">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-3">
              About this item
            </span>
            <ul className="space-y-2 text-sm text-slate-700 font-medium">
              {[
                'High-definition audio drivers with deep bass',
                '20-hour battery life for all-day play',
                'IP67 waterproof rating for pool and beach',
                'PartyBoost sync with other JBL speakers',
                'Built-in USB charge out port',
              ].map((spec, i) => {
                return (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#E50914] font-black mt-0.5">•</span>
                    <span>{spec}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Warranty & Delivery */}
          <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl space-y-3 mb-6">
            <div className="flex items-start gap-2">
              <ShieldCheck size={16} className="text-[#E50914] shrink-0" />
              <span className="text-sm text-slate-700 font-medium">
                1 Year Hualink Warranty
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#10b981] text-[10px] font-bold">✔</span>
              <span className="text-sm text-slate-700 font-medium">
                Eligible for Cash on Delivery
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#10b981] text-[10px] font-bold">✔</span>
              <span className="text-sm text-slate-700 font-medium">
                Easy Returns &amp; Exchanges
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#10b981] text-[10px] font-bold">✔</span>
              <span className="text-sm text-slate-700 font-medium">
                TRA Fiscalized EFD Receipt Included
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#10b981] text-[10px] font-bold">✔</span>
              <span className="text-sm text-slate-700 font-medium">
                Fast Regional Delivery (Dar es Salaam / Mbeya Hub)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-[#E50914] text-white font-bold py-3 px-6 rounded-lg text-center hover:bg-[#C0040F] transition-colors shadow-md shadow-[#E50914]/30"
          >
            Add to Cart
          </button>

          <div className="mt-3 text-xs text-center text-slate-600 font-medium">
            Lipa kwa Cash / TRA Compliant / CRDB / M-Pesa / Visa
          </div>
        </div>
      </div>
    </div>
  );
}