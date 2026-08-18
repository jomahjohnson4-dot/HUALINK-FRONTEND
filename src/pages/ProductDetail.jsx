import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  RefreshCw, 
  Minus, 
  Plus,
  Layers
} from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Fetch single product from Backend Express API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          // Fallback mock product matching selected ID
          setProduct(mockProducts[id] || mockProducts["1"]);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setProduct(mockProducts[id] || mockProducts["1"]);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantity = (type) => {
    if (type === 'decrease' && quantity > 1) {
      setQuantity((prev) => prev - 1);
    } else if (type === 'increase' && product && quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw size={32} className="animate-spin text-red-600" />
        <p className="text-xs font-bold text-slate-500">Loading product specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-slate-50 min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <Link to="/shop" className="text-xs font-bold text-red-600 hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 py-10">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Inventory Catalog</span>
          </Link>
        </div>

        {/* Product Details Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-10 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Product Image Column */}
          <div className="space-y-4">
            <div className="h-80 md:h-[420px] bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-200/60">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 left-4 bg-slate-900/90 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg backdrop-blur-md">
                {product.category}
              </span>
            </div>
          </div>

          {/* Product Info & Actions Column */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-block border-l-4 border-red-600 pl-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-red-600">
                  Hualink Verified Item
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4">
                <span className="text-2xl font-black text-slate-900">
                  {Number(product.price * quantity).toLocaleString()} TZS
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  product.stock > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}>
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed pt-2">
                {product.description}
              </p>
            </div>

            {/* Specifications Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                Item Features
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700 font-semibold">
                {product.specs?.map((spec, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-red-600 shrink-0" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity Selector & Add To Cart Button */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quantity:</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button 
                    onClick={() => handleQuantity('decrease')}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-white rounded-lg transition-all cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-xs font-extrabold text-slate-900">{quantity}</span>
                  <button 
                    onClick={() => handleQuantity('increase')}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-white rounded-lg transition-all cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  disabled={product.stock <= 0}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all cursor-pointer"
                >
                  <ShoppingCart size={16} />
                  <span>Add To Order Cart</span>
                </button>
                <Link 
                  to="/checkout" 
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <span>Direct Order</span>
                </Link>
              </div>
            </div>

            {/* Delivery & Warranty Tags */}
            <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck size={16} className="text-slate-600" />
                <span className="text-[10px] font-bold text-slate-600">Verified Quality</span>
              </div>
              <div className="flex flex-col items-center gap-1 border-x border-slate-100">
                <Truck size={16} className="text-slate-600" />
                <span className="text-[10px] font-bold text-slate-600">Tanzania Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Layers size={16} className="text-slate-600" />
                <span className="text-[10px] font-bold text-slate-600">TeKeL Support</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// Temporary Mock Data mapped by ID
const mockProducts = {
  "1": {
    id: "1",
    name: "Enterprise Ethernet Router Switch",
    category: "Networking Maintenance",
    price: 450000,
    stock: 12,
    description: "High-speed multi-port rackmount switch designed for corporate networks, inter-VLAN configurations, and high-bandwidth regional data centers.",
    specs: [
      "24 Gigabit Ethernet Ports + 4 SFP Uplinks",
      "Layer 2+ Static Routing & VLAN Tagging",
      "Rackmountable 1U Steel Casing",
      "Compliant with Cisco Packet Tracer setups"
    ],
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800"
  },
  "2": {
    id: "2",
    name: "TeKeL Corporate Identity Package",
    category: "TeKeL Branding & Print",
    price: 250000,
    stock: 50,
    description: "Complete corporate branding suite including high-resolution vector logo assets, business card templates, promotional flyer graphics, and brand guideline books.",
    specs: [
      "Custom Vector Logo (.AI, .SVG, .PNG)",
      "Print-ready Stationery & Letterheads",
      "Social Media & Web Branding Kit",
      "3 Revisions Included with TeKeL Designers"
    ],
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800"
  }
};