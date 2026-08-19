import { useState, useEffect, useCallback } from 'react';
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
  Edit2,
  Trash2,
  PackagePlus,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  LayoutDashboard
} from 'lucide-react';
import API from '../api/axios';

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
  
  const [userRole] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        return parsed?.role?.toLowerCase() || null;
      } catch (e) {
        console.error('Failed to parse user profile:', e);
      }
    }
    return null;
  });

  const [products, setProducts] = useState([]);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    stockCount: '',
    category: 'Electronics',
    image: '',
  });

  const isAdminOrDepot = userRole === 'admin' || userRole === 'depot';

  // Standalone fetch handler for manual triggers like sync button or form submit
  const fetchProducts = useCallback(async () => {
    try {
      setFetchingProducts(true);
      const res = await API.get('/products');
      setProducts(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setFetchingProducts(false);
    }
  }, []);

  // Async data fetching in effect scheduled outside current execution frame
  useEffect(() => {
    let isMounted = true;

    if (isAdminOrDepot) {
      queueMicrotask(async () => {
        try {
          if (isMounted) setFetchingProducts(true);
          const res = await API.get('/products');
          if (isMounted) setProducts(res.data?.data || res.data || []);
        } catch (err) {
          console.error('Failed to load products:', err);
        } finally {
          if (isMounted) setFetchingProducts(false);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [isAdminOrDepot]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditSelect = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      basePrice: product.basePrice ?? product.price ?? '',
      stockCount: product.stockCount ?? product.stock ?? '',
      category: product.category || 'Electronics',
      image: product.image || '',
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      basePrice: '',
      stockCount: '',
      category: 'Electronics',
      image: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMsg({ type: '', text: '' });

    const payload = {
      ...formData,
      basePrice: parseFloat(formData.basePrice),
      stockCount: parseInt(formData.stockCount, 10),
    };

    try {
      if (editingId) {
        await API.put(`/products/${editingId}`, payload);
        setMsg({ type: 'success', text: 'Depot item updated successfully!' });
      } else {
        await API.post('/products', payload);
        setMsg({ type: 'success', text: 'New item added to depot inventory!' });
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || 'Operation failed. Verify authorization.',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product from regional inventory?')) return;
    try {
      await API.delete(`/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
      setMsg({ type: 'success', text: 'Product removed from stock.' });
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || 'Could not delete product.',
      });
    }
  };

  const filteredCards = EXPLORE_CARDS.filter((card) => {
    const matchesCategory =
      activeCategory === 'all' || card.category === activeCategory;
    const matchesSearch =
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-gray-900 min-h-screen text-white pt-6 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-950 to-black rounded-3xl p-6 sm:p-10 border border-red-900/40 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-black/50 border border-red-500/30 rounded-full px-3 py-1 text-xs font-bold text-red-400 mb-4 uppercase tracking-wider">
              <Zap size={14} />
              <span>Hualink Distribution Network</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tight text-white uppercase">
              Explore Capabilities & Depot Hubs
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 font-medium">
              Discover Hualink supply chain services, regional distribution depots, TeKeL graphics design, and hardware maintenance solutions.
            </p>
          </div>
        </div>

        {/* Action Feature Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2.5 bg-red-600/20 text-red-500 rounded-xl shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase">Bulk Dispatch</h4>
              <p className="text-[10px] text-gray-400">Direct warehouse delivery</p>
            </div>
          </div>

          <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/20 text-orange-400 rounded-xl shrink-0">
              <Palette size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase">TeKeL Branding</h4>
              <p className="text-[10px] text-gray-400">Logos, posters & web UI</p>
            </div>
          </div>

          <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase">4 Regional Hubs</h4>
              <p className="text-[10px] text-gray-400">Dar, Mbeya, Mwanza, Arusha</p>
            </div>
          </div>

          <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
              <Wrench size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase">Tech Support</h4>
              <p className="text-[10px] text-gray-400">Hardware & network setups</p>
            </div>
          </div>
        </div>

        {/* RESTRICTED ADMIN / DEPOT MANAGEMENT PANEL */}
        {isAdminOrDepot && (
          <div className="bg-gray-800/90 border border-red-600/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600 text-white rounded-xl">
                  <LayoutDashboard size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-wider">
                    Depot Inventory Management
                  </h2>
                  <p className="text-xs text-gray-400">
                    Create, update stock counts, and adjust catalog prices in real-time
                  </p>
                </div>
              </div>

              <button
                onClick={fetchProducts}
                className="self-start sm:self-auto px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw size={14} className={fetchingProducts ? 'animate-spin' : ''} />
                <span>Sync Inventory</span>
              </button>
            </div>

            {msg.text && (
              <div
                className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                  msg.type === 'error'
                    ? 'bg-red-950/80 text-red-300 border border-red-800'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                }`}
              >
                {msg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                <span>{msg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Product Form */}
              <div className="lg:col-span-5 bg-gray-900/90 p-6 rounded-2xl border border-gray-700 space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
                  <PackagePlus className="text-red-500" size={18} />
                  <h3 className="text-xs font-black uppercase text-gray-200">
                    {editingId ? 'Edit Stock Item' : 'Add New Inventory Item'}
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
                      Item Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. HP EliteBook 840 G7"
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
                        Price (TZS)
                      </label>
                      <input
                        type="number"
                        name="basePrice"
                        required
                        value={formData.basePrice}
                        onChange={handleInputChange}
                        placeholder="750000"
                        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-600"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
                        Stock Count
                      </label>
                      <input
                        type="number"
                        name="stockCount"
                        required
                        value={formData.stockCount}
                        onChange={handleInputChange}
                        placeholder="15"
                        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-600"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Networking">Networking</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Graphics">Graphics Assets</option>
                      <option value="Appliances">Home Appliances</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows="2"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief item specification..."
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-red-600/20"
                    >
                      {editingId ? 'Save Changes' : 'Publish Item'}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="py-3 px-4 bg-gray-700 text-gray-300 font-extrabold text-xs uppercase rounded-xl hover:bg-gray-600 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Product Inventory Table */}
              <div className="lg:col-span-7 bg-gray-900/90 p-6 rounded-2xl border border-gray-700 overflow-x-auto">
                <h3 className="text-xs font-black uppercase text-gray-200 mb-4">
                  Depot Product Stock ({products.length})
                </h3>
                
                {products.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No products found in depot database.</p>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px]">
                        <th className="py-2">Product</th>
                        <th className="py-2">Price</th>
                        <th className="py-2">Stock</th>
                        <th className="py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 font-medium">
                      {products.map((item) => {
                        const price = item.basePrice ?? item.price ?? 0;
                        const stock = item.stockCount ?? item.stock ?? 0;
                        return (
                          <tr key={item.id}>
                            <td className="py-3 font-bold text-white max-w-[150px] truncate">
                              {item.name}
                              <span className="block text-[10px] text-gray-400 font-normal">{item.category}</span>
                            </td>
                            <td className="py-3 font-extrabold text-red-400">
                              {Number(price).toLocaleString()} TZS
                            </td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                  stock < 10
                                    ? 'bg-red-950 text-red-400 border border-red-800'
                                    : 'bg-gray-800 text-gray-300'
                                }`}
                              >
                                {stock} left
                              </span>
                            </td>
                            <td className="py-3 text-right space-x-2">
                              <button
                                onClick={() => handleEditSelect(item)}
                                className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors cursor-pointer"
                                title="Edit Item"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-400 rounded-lg transition-colors cursor-pointer"
                                title="Delete Item"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Capabilities Content Grid */}
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