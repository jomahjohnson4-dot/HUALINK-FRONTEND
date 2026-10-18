import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Image,
  FileText,
  Search as SearchIcon,
  ArrowRight,
  UserCheck,
  Store,
  Globe,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Mode switcher tabs with routing
const MODES = [
  { id: 'ai', labelKey: 'landing.tabAI', icon: UserCheck, to: '/ai-mode' },
  { id: 'products', labelKey: 'landing.tabProducts', icon: SearchIcon, to: '/' },
  { id: 'shops', labelKey: 'landing.tabShops', icon: Store, to: '/shops' },
  { id: 'services', labelKey: 'landing.tabServices', icon: Globe, to: '/services' },
];

const MODE_CONFIG = {
  ai: { labelKey: 'landing.tabAI', icon: UserCheck },
  products: { labelKey: 'landing.tabProducts', icon: SearchIcon },
  shops: { labelKey: 'landing.tabShops', icon: Store },
  services: { labelKey: 'landing.tabServices', icon: Globe },
};

export default function SearchHero() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');

  const handleModeClick = (to) => {
    navigate(to);
    if (to === '/') {
      setActiveMode('products');
    } else if (to === '/ai-mode') {
      setActiveMode('ai');
    } else if (to === '/shops') {
      setActiveMode('shops');
    } else {
      setActiveMode('services');
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/shop');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleImageSearch = (e) => {
    e.preventDefault();
    const input = document.getElementById('image-search-input');
    if (input) input.click();
  };

  const handleFileSearch = (e) => {
    e.preventDefault();
    const input = document.getElementById('file-search-input');
    if (input) input.click();
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      console.log(`${type} image selected:`, file.name);
    }
  };

  return (
    <section className="bg-gradient-to-b from-[#FDF2F2] to-white py-8 border-b border-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mode Switcher Tabs Row */}
        <div className="flex items-center justify-center gap-10 md:gap-14 mb-4">
          {MODES.map((mode) => {
            const isActive = activeMode === mode.id;
            const Icon = MODE_CONFIG[mode.id].icon;
            const baseClass = 'flex items-center gap-2 text-xl md:text-2xl font-black transition-all cursor-pointer shrink-0';
            const activeClass = 'text-[#E50914] border-b-4 border-[#E50914] pb-2';
            const inactiveClass = 'text-gray-700 hover:text-[#E50914]';
            const fullClass = isActive ? [baseClass, activeClass].join(' ') : [baseClass, inactiveClass].join(' ');
            return (
              <button
                key={mode.id}
                onClick={() => handleModeClick(mode.to)}
                className={fullClass}
              >
                <Icon className="w-6 h-6" />
                <span>{t(mode.labelKey)}</span>
              </button>
            );
          })}
        </div>

        {/* Large Pill Search Bar */}
        <div className="max-w-3xl mx-auto">
          <div className="max-w-3xl mx-auto rounded-full border-2 border-[#E50914] shadow-md flex items-center p-2 bg-white">
            {/* Image Search button */}
            <button
              onClick={handleImageSearch}
              className="flex items-center gap-1 text-gray-600 hover:text-[#E50914] cursor-pointer transition-colors"
              aria-label="Image Search"
            >
              <Image size={16} className="mr-0.5" />
              <span className="text-xs font-medium">
                {t('landing.imageSearch')}
              </span>
            </button>
            <input
              id="image-search-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, 'image')}
            />

            {/* Vertical Divider */}
            <span className="w-px h-4 bg-gray-200 mx-1.5" />

            {/* Search with File button */}
            <button
              onClick={handleFileSearch}
              className="flex items-center gap-1 text-gray-600 hover:text-[#E50914] cursor-pointer transition-colors"
              aria-label="Search with File"
            >
              <FileText size={16} className="mr-0.5" />
              <span className="text-xs font-medium">
                {t('landing.searchWithFile')}
              </span>
            </button>
            <input
              id="file-search-input"
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => handleImageUpload(e, 'file')}
            />

            {/* Vertical Divider */}
            <span className="w-px h-4 bg-gray-200 mx-1.5" />

            {/* Search Input */}
            <input
              type="text"
              placeholder={t('landing.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 focus:outline-none text-base text-gray-800 placeholder:text-gray-400 border-none"
            />

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-[#E50914] hover:bg-[#C0040F] text-white font-bold px-8 py-3 rounded-full flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <SearchIcon size={14} className="mr-1" />
              {t('landing.searchButton')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}