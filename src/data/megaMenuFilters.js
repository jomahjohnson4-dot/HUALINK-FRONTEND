import { productsCatalog } from './productsCatalog';

/**
 * Map mega-menu slugs to a filter + which sidebar shelf to highlight.
 * Filters are strict so clicking "Phones & Smartphones" only shows phones.
 */
export const MEGA_MENU_SUBCATEGORIES = [
  {
    slug: 'smartphones',
    shelfId: 'smartphones',
    match: (product) => {
      const text = `${product.name || ''} ${product.title || ''} ${product.category || ''} ${product.categorySlug || ''}`.toLowerCase();
      return text.includes('iphone') || text.includes('smartphone') || product.categorySlug === 'smartphones';
    },
  },
  {
    slug: 'chargers',
    shelfId: 'electronics',
    match: (product) => {
      const text = `${product.name || ''} ${product.title || ''} ${product.category || ''} ${product.categorySlug || ''}`.toLowerCase();
      if (product.categorySlug === 'chargers-cables') return true;
      if (product.category === 'Chargers & Cables') return true;
      return /charger|charging|adapter|cable|flash drive/.test(text);
    },
  },
  {
    slug: 'audio',
    shelfId: 'electronics',
    match: (product) => {
      const text = `${product.name || ''} ${product.title || ''} ${product.category || ''} ${product.categorySlug || ''}`.toLowerCase();
      if (product.categorySlug !== 'audio' && product.category !== 'Audio & Sound') return false;
      // Keep personal audio only (AirPods), exclude radios/speakers
      if (/radio|speaker|jbl|soundbar/.test(text)) return false;
      return /airpod|earbud|headphone|headset|bluetooth/.test(text) || product.categorySlug === 'audio';
    },
  },
  {
    slug: 'radios',
    shelfId: 'electronics',
    match: (product) => {
      const text = `${product.name || ''} ${product.title || ''} ${product.category || ''} ${product.categorySlug || ''}`.toLowerCase();
      return /radio|am\/fm|cassette|walkman|player/.test(text);
    },
  },
  {
    slug: 'accessories',
    shelfId: 'electronics',
    match: (product) => {
      const text = `${product.name || ''} ${product.title || ''} ${product.category || ''} ${product.categorySlug || ''}`.toLowerCase();
      if (product.categorySlug === 'accessories' || product.category === 'Accessories') return true;
      return /selfie|tripod|stand|mount/.test(text);
    },
  },
  {
    slug: 'kettles',
    shelfId: 'home',
    match: (product) => {
      const text = `${product.name || ''} ${product.title || ''} ${product.category || ''} ${product.categorySlug || ''}`.toLowerCase();
      return /kettle|jug kettle/.test(text);
    },
  },
  {
    slug: 'irons',
    shelfId: 'home',
    match: (product) => {
      const text = `${product.name || ''} ${product.title || ''} ${product.category || ''} ${product.categorySlug || ''}`.toLowerCase();
      return /steam iron|flat iron|\biron\b/.test(text);
    },
  },
  {
    slug: 'speakers',
    shelfId: 'home',
    match: (product) => {
      const text = `${product.name || ''} ${product.title || ''} ${product.category || ''} ${product.categorySlug || ''}`.toLowerCase();
      return /speaker|jbl|soundbar|subwoofer/.test(text);
    },
  },
];

export const getMegaMenuFilter = (slug) => {
  if (!slug) return null;
  return MEGA_MENU_SUBCATEGORIES.find((entry) => entry.slug === slug.toLowerCase()) || null;
};

export const filterByMegaMenuSlug = (slug, items = productsCatalog) => {
  const entry = getMegaMenuFilter(slug);
  if (!entry) return items;
  return items.filter((item) => entry.match(item));
};
