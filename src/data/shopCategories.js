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
  { id: 'all', name: 'All Inventory', icon: Boxes },
  {
    id: 'smartphones',
    name: 'Smartphones & Mobile',
    icon: Smartphone,
    slugs: ['smartphones'],
    keywords: ['smartphone', 'iphone', 'galaxy', 'phone', 'mobile', 'smart watch'],
  },
  {
    id: 'electronics',
    name: 'Electronics & Gadgets',
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

export default SHOP_CATEGORIES;
