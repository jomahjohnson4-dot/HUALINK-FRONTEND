/**
 * Sidebar shelves for the /shop marketplace.
 *
 * Kept outside the page component so the filter rules can be unit tested and
 * reused. `slugs` match a product's categorySlug / category exactly, `keywords`
 * catch items whose title, category or description belongs to the shelf.
 *
 * "All Inventory" is an unconditional match, so it can never return an empty
 * list while the catalogue is loaded.
 */
import { Boxes, Home, Smartphone, Tv } from 'lucide-react';

export const SHOP_CATEGORIES = [
  { id: 'all', name: 'All Inventory', nameKey: 'categories.allInventory', icon: Boxes },
  {
    id: 'smartphones',
    name: 'Smartphones & Mobile',
    nameKey: 'categories.smartphonesMobile',
    icon: Smartphone,
    slugs: ['smartphones'],
    keywords: ['smartphone', 'iphone', 'galaxy', 'phone', 'mobile', 'smart watch'],
  },
  {
    id: 'electronics',
    name: 'Electronics & Gadgets',
    nameKey: 'categories.electronicsGadgets',
    icon: Tv,
    slugs: ['chargers-cables', 'audio', 'accessories', 'electronics', 'tvs', 'networking', 'security'],
    keywords: [
      'charger',
      'charging',
      'cable',
      'usb',
      'flash drive',
      'audio',
      'speaker',
      'radio',
      'airpod',
      'earbud',
      'selfie',
      'tripod',
      'electronic',
      'gadget',
    ],
  },
  {
    id: 'home',
    name: 'Home & Living',
    nameKey: 'categories.homeLiving',
    icon: Home,
    slugs: ['home-appliances', 'furniture', 'energy'],
    keywords: ['kettle', 'steam iron', 'iron', 'appliance', 'blender', 'heater', 'home'],
  },
];

/** True when the product belongs to the selected sidebar shelf. */
export const matchesShopCategory = (product, categoryId) => {
  if (categoryId === 'all') return true;

  const definition = SHOP_CATEGORIES.find((category) => category.id === categoryId);
  if (!definition) return true;

  const slug = String(product.categorySlug || '').toLowerCase().trim();
  const categoryName = String(product.category || '').toLowerCase().trim();
  if (definition.slugs?.some((value) => value === slug || value === categoryName)) {
    return true;
  }

  const haystack = [
    product.name || product.title || '',
    product.category || '',
    product.description || '',
  ]
    .join(' ')
    .toLowerCase();

  return definition.keywords?.some((keyword) => haystack.includes(keyword)) ?? false;
};

/**
 * Sub-category filters for header mega-menu deep links (/shop?category=<slug>).
 *
 * Each entry narrows the /shop grid to ONLY the items belonging to that
 * sub-category (the sidebar shelf merely highlights afterwards — `shelf`
 * records which sidebar shelf to highlight for a given slug). Matchers use the
 * product's name, category and categorySlug so they stay precise even when a
 * shared slug (e.g. `audio`) covers several physical products.
 */
const subcategoryHaystack = (product) =>
  [
    product.name || product.title || '',
    product.category || '',
    product.categorySlug || '',
  ]
    .join(' ')
    .toLowerCase();

const subcategorySlug = (product) =>
  String(product.categorySlug || '').toLowerCase().trim();

export const SHOP_SUBCATEGORIES = [
  {
    slug: 'smartphones',
    shelf: 'smartphones',
    matches: (product) => /smartphone|iphone|galaxy|android|\bphone\b/.test(subcategoryHaystack(product)),
  },
  {
    slug: 'chargers',
    shelf: 'electronics',
    matches: (product) =>
      subcategorySlug(product) === 'chargers-cables' ||
      /charger|charging|power bank|adapter/.test(subcategoryHaystack(product)),
  },
  {
    // Shared `audio` slug: keep personal audio only — radios and speakers have
    // their own sub-categories below.
    slug: 'audio',
    shelf: 'electronics',
    matches: (product) =>
      subcategorySlug(product) === 'audio' &&
      !/radio|speaker|cassette|walkman/.test(subcategoryHaystack(product)),
  },
  {
    slug: 'radios',
    shelf: 'electronics',
    matches: (product) => /radio|cassette|walkman|\bplayer\b/.test(subcategoryHaystack(product)),
  },
  {
    slug: 'accessories',
    shelf: 'electronics',
    matches: (product) =>
      subcategorySlug(product) === 'accessories' ||
      /selfie|tripod|flash drive|memory card|stylus/.test(subcategoryHaystack(product)),
  },
  {
    slug: 'kettles',
    shelf: 'home',
    matches: (product) => /kettle|teapot/.test(subcategoryHaystack(product)),
  },
  {
    slug: 'irons',
    shelf: 'home',
    matches: (product) => /steam iron|flat iron|\biron\b/.test(subcategoryHaystack(product)),
  },
  {
    slug: 'speakers',
    shelf: 'home',
    matches: (product) => /speaker|jbl|soundbar|subwoofer/.test(subcategoryHaystack(product)),
  },
];

/** Resolves a ?category= deep-link value to its filter entry (null if unknown). */
export const findShopSubcategory = (slug) => {
  const normalized = String(slug || '').toLowerCase().trim();
  if (!normalized) return null;
  return SHOP_SUBCATEGORIES.find((entry) => entry.slug === normalized) || null;
};

export default SHOP_CATEGORIES;
