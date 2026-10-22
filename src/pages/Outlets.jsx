import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Phone, 
  Package, 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  CheckCircle2,
  Navigation
} from 'lucide-react';

const REGIONS = [
  { id: 'all', nameKey: 'outlets.allDistributionHubs' },
  { id: 'dar', nameKey: 'outlets.darEsSalaam' },
  { id: 'mbeya', nameKey: 'outlets.mbeya' },
  { id: 'mwanza', nameKey: 'outlets.mwanza' },
  { id: 'arusha', nameKey: 'outlets.arusha' },
];

const MOCK_BRANCHES = [
  {
    id: 1,
    nameKey: 'outlets.branchNameDar',
    regionId: 'dar',
    regionNameKey: 'outlets.branchRegionDarHQ',
    addressKey: 'outlets.branchAddressDar',
    phone: '+255 700 000 001',
    statusKey: 'outlets.branchStatusOperational',
    stockCapacityKey: 'outlets.branchStockDar',
    serviceKeys: ['outlets.branchServiceBulkDelivery', 'outlets.branchServiceElectronics', 'outlets.branchServiceRegionalCargo'],
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    isHQ: true,
  },
  {
    id: 2,
    nameKey: 'outlets.branchNameMbeya',
    regionId: 'mbeya',
    regionNameKey: 'outlets.branchRegionMbeya',
    addressKey: 'outlets.branchAddressMbeya',
    phone: '+255 700 000 002',
    statusKey: 'outlets.branchStatusOperational',
    stockCapacityKey: 'outlets.branchStockMbeya',
    serviceKeys: ['outlets.branchServiceTeKel', 'outlets.branchServiceHardware', 'outlets.branchServiceLocalExpress'],
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80',
    isHQ: false,
  },
  {
    id: 3,
    nameKey: 'outlets.branchNameMwanza',
    regionId: 'mwanza',
    regionNameKey: 'outlets.branchRegionMwanza',
    addressKey: 'outlets.branchAddressMwanza',
    phone: '+255 700 000 003',
    statusKey: 'outlets.branchStatusOperational',
    stockCapacityKey: 'outlets.branchStockMwanza',
    serviceKeys: ['outlets.branchServiceSmartphones', 'outlets.branchServiceAppliances', 'outlets.branchServiceCargoShipping'],
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=600&q=80',
    isHQ: false,
  },
  {
    id: 4,
    nameKey: 'outlets.branchNameArusha',
    regionId: 'arusha',
    regionNameKey: 'outlets.branchRegionArusha',
    addressKey: 'outlets.branchAddressArusha',
    phone: '+255 700 000 004',
    statusKey: 'outlets.branchStatusOperational',
    stockCapacityKey: 'outlets.branchStockArusha',
    serviceKeys: ['outlets.branchServiceOfficeFurniture', 'outlets.branchServiceB2BWholesale'],
    image: 'https://images.unsplash.com/photo-1565891741441-64926e441838?auto=format&fit=crop&w=600&q=80',
    isHQ: false,
  },
];

export default function Outlets() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleContactManager = (branch) => {
    // Navigates to the public support desk route (/chat) accessible to guests
    navigate('/chat', { 
      state: { 
        branchId: branch.id, 
        branchName: branch.name, 
        phone: branch.phone 
      } 
    });
  };

  const filteredBranches = MOCK_BRANCHES.filter((branch) => {
    const matchesRegion =
      selectedRegion === 'all' || branch.regionId === selectedRegion;
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      t(branch.nameKey).toLowerCase().includes(search) ||
      t(branch.addressKey).toLowerCase().includes(search) ||
      (branch.regionNameKey ? t(branch.regionNameKey).toLowerCase().includes(search) : false);
    return matchesRegion && matchesSearch;
  });

  return (
    <div className="bg-gray-900 min-h-screen text-white pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-red-600 to-black rounded-3xl p-6 sm:p-10 mb-8 border border-red-900/40 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-black/50 border border-red-500/30 rounded-full px-3 py-1 text-xs font-bold text-red-400 mb-4 uppercase tracking-wider">
              <Zap size={14} />
              <span>{t('outlets.bannerBadge')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tight text-white uppercase">
              {t('outlets.bannerTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 font-medium">
              {t('outlets.bannerSubtitle')}
            </p>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Controls */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Search Input */}
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder={t('outlets.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Region Selector */}
            <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4 px-2">
                <Navigation size={14} className="text-red-500" />
                <span>{t('outlets.filterByRegion')}</span>
              </div>
              <div className="space-y-1">
                {REGIONS.map((reg) => {
                  const isActive = selectedRegion === reg.id;
                  return (
                    <button
                      key={reg.id}
                      onClick={() => setSelectedRegion(reg.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                          : 'text-gray-300 hover:bg-gray-700/60 hover:text-white'
                      }`}
                    >
                      <span>{t(reg.nameKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Network Guarantee Card */}
            <div className="bg-gray-800/50 border border-gray-700/60 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-red-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-xs font-extrabold text-white uppercase">{t('outlets.interDepotTransfer')}</h4>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {t('outlets.networkDesc')}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Branch Grid */}
          <div className="lg:col-span-3">
            
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-800">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {t('outlets.activeBranchHubs')} <span className="text-white font-extrabold">{filteredBranches.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBranches.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-gray-800 border border-gray-700/70 hover:border-red-600/60 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group shadow-lg"
                >
                  <div>
                    {/* Depot Image Header */}
                    <div className="relative h-48 bg-gray-900 overflow-hidden">
                      <img
                        src={branch.image}
                        alt={t(branch.nameKey)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className={`absolute top-3 left-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                        branch.isHQ 
                          ? 'bg-red-600 text-white border-red-500/50' 
                          : 'bg-black/80 backdrop-blur-md text-red-400 border-red-500/30'
                      }`}>
                        {branch.isHQ ? t('outlets.centralHeadquarters') : t(branch.regionNameKey)}
                      </span>
                    </div>

                    {/* Branch Details */}
                    <div className="p-5">
                      <h3 className="text-base font-bold text-white leading-snug">
                        {t(branch.nameKey)}
                      </h3>

                      <div className="mt-3 space-y-2 text-xs text-gray-300">
                        <div className="flex items-start gap-2">
                          <MapPin size={15} className="text-red-500 shrink-0 mt-0.5" />
                          <span>{t(branch.addressKey)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={15} className="text-red-500 shrink-0" />
                          <span className="font-semibold">{branch.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package size={15} className="text-red-500 shrink-0" />
                          <span className="text-gray-400">{t(branch.stockCapacityKey)}</span>
                        </div>
                      </div>

                      {/* Capabilities List */}
                      <div className="mt-4 pt-3 border-t border-gray-700/50">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-2">
                          {t('outlets.depotFeaturesServices')}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(branch.serviceKeys || []).map((serviceKey, idx) => (
                            <span 
                              key={idx}
                              className="inline-flex items-center gap-1 bg-gray-900/80 border border-gray-700/80 text-gray-300 text-[10px] font-bold px-2 py-1 rounded-lg"
                            >
                              <CheckCircle2 size={12} className="text-red-500" />
                              <span>{t(serviceKey)}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 pt-0">
                    <button 
                      onClick={() => handleContactManager(branch)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{t('outlets.contactBranchManager')}</span>
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