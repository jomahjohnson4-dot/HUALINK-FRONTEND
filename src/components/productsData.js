/**
 * Normalisation layer on top of the centralized catalogue.
 *
 * The canonical product records live in ../data/productsCatalog.js. This module
 * converts them (and any raw API payload) into the flat shape consumed by
 * ProductCard, ProductGrid and ProductList, so components never have to guess
 * which fields exist.
 */
import { productsCatalog } from '../data/productsCatalog';

/* -------------------------------------------------------------------------- */
/*  Categories                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Ordered category rules. The first match wins, so the more specific
 * categories (TVs, CCTV, packaging) are declared before the broader ones.
 */
export const CATEGORY_CONFIG = [
  { slug: 'smartphones', label: 'Smartphones', pattern: /smartphone|iphone|galaxy|smart ?watch/i },
  { slug: 'tvs', label: 'TVs & Displays', pattern: /\btv|television|\binch\b|display|monitor/i },
  { slug: 'audio', label: 'Audio & Speakers', pattern: /speaker|audio|jbl|headphone|bluetooth/i },
  { slug: 'laptops', label: 'Laptops & Notebooks', pattern: /laptop|notebook|macbook/i },
  { slug: 'networking', label: 'Networking', pattern: /network|router|switch|wifi|wi-fi|access point|ethernet/i },
  { slug: 'security', label: 'Security & CCTV', pattern: /cctv|camera|security|surveillance|dvr/i },
  { slug: 'furniture', label: 'Office Furniture', pattern: /furniture|desk|chair/i },
  { slug: 'energy', label: 'Energy & Solar', pattern: /solar|power|generator|inverter|battery/i },
  { slug: 'branding', label: 'Branding & Print', pattern: /branding|logo|design|print/i },
  { slug: 'automobile', label: 'Automobile', pattern: /car|automobile|vehicle|dashboard|air freshener/i },
  { slug: 'automotive', label: 'Automotive & Parts', pattern: /automotive|motorcycle|tyre|spare/i },
  { slug: 'packaging', label: 'Packaging & Supplies', pattern: /packaging|supplies/i },
  { slug: 'apparel', label: 'Apparel & Fashion', pattern: /apparel|fashion|clothing/i },
  { slug: 'logistics', label: 'Logistics & Shipping', pattern: /door to door|logistics|courier|freight|delivery/i },
  {
    slug: 'home-appliances',
    label: 'Home Appliances',
    pattern: /humidifier|diffuser|aromatherapy|appliance|heater|iron|kettle|blender/i,
  },
  {
    slug: 'electronics',
    label: 'Electronics & Tech',
    pattern: /charger|tech|electronics|consumer|accessor|gadget|ring light|alarm clock/i,
  },
];

const DEFAULT_CATEGORY = CATEGORY_CONFIG[CATEGORY_CONFIG.length - 1];

/** Resolve the category of a product from its slug, label or title. */
export const resolveCategory = (raw) => {
  const bySlug = CATEGORY_CONFIG.find((c) => c.slug === raw.categorySlug);
  if (bySlug) return bySlug;

  const byLabel = CATEGORY_CONFIG.find(
    (c) => c.label.toLowerCase() === String(raw.category || '').toLowerCase()
  );
  if (byLabel) return byLabel;

  const title = raw.title || raw.name || '';
  return CATEGORY_CONFIG.find((c) => c.pattern.test(title)) || DEFAULT_CATEGORY;
};

/* -------------------------------------------------------------------------- */
/*  Pricing                                                                   */
/* -------------------------------------------------------------------------- */

const CURRENCY_PATTERN = /^([A-Za-z$€£₹]{1,4})\s*/;

const currencyOf = (value) => {
  const match = String(value).match(CURRENCY_PATTERN);
  return match ? match[1] : '';
};

/**
 * Normalise a price into a display price plus an optional "was" price.
 * Range prices ("TSh 177,332 - 223,711") become the low end as the current
 * price and the high end as the struck-through reference price.
 */
export const resolvePrice = (raw) => {
  if (typeof raw.price === 'number') {
    return { price: `TSh ${raw.price.toLocaleString('en-US')}`, originalPrice: null };
  }

  const rawPrice = String(raw.price ?? '').trim();
  if (!rawPrice) return { price: 'Price on request', originalPrice: null };

  const [low, high] = rawPrice.split(/\s+-\s+/);

  if (high) {
    const currency = currencyOf(low);
    const highPrice = currency && !currencyOf(high) ? `${currency} ${high.trim()}` : high.trim();
    return { price: low.trim(), originalPrice: highPrice };
  }

  return {
    price: low.trim(),
    originalPrice: raw.originalPrice ? String(raw.originalPrice).trim() : null,
  };
};

/* -------------------------------------------------------------------------- */
/*  Normalisation                                                             */
/* -------------------------------------------------------------------------- */

const FALLBACK_RATINGS = [4.8, 4.5, 4.9, 4.7, 4.6, 4.4, 4.9, 4.3, 4.8, 4.6, 4.7, 4.5, 4.9, 4.4, 4.6, 4.8];
const FALLBACK_REVIEWS = ['1.2K', '856', '2.1K', '640', '432', '1.8K', '950', '310', '1.1K', '720', '1.4K', '590', '2.3K', '870', '1.9K', '1.05K'];

const BADGE_PRIORITY = ['Hot', 'New', 'Free Shipping', 'Verified'];

const pickBadge = (raw) => {
  const tags = Array.isArray(raw.tags) ? raw.tags : [];
  const match = BADGE_PRIORITY.find((badge) => tags.includes(badge));
  return raw.badge || match || tags[0] || 'Verified';
};

const formatSold = (sold) => {
  if (!sold) return '';
  const value = String(sold);
  return /sold/i.test(value) ? value : `${value} sold`;
};

/** Strips a duplicated "MOQ:" prefix so the chip label stays consistent. */
const formatMoq = (moq) => {
  const value = String(moq || '').trim();
  if (!value) return '1 piece';
  return value.replace(/^MOQ:\s*/i, '');
};

/**
 * Convert any raw product (catalogue record or API payload) into the shared
 * shape consumed by ProductCard / ProductGrid / ProductList.
 */
export const normalizeProduct = (raw, index = 0) => {
  const source = raw || {};
  const title = source.title || source.name || 'Untitled Product';
  const category = resolveCategory(source);
  const { price, originalPrice } = resolvePrice(source);

  return {
    id: source.id ?? `product-${index}`,
    title,
    category: source.category || category.label,
    categorySlug: source.categorySlug || category.slug,
    price,
    originalPrice: originalPrice ?? null,
    moq: formatMoq(source.moq),
    rating: source.rating ?? FALLBACK_RATINGS[index % FALLBACK_RATINGS.length],
    reviews:
      source.reviews ??
      source.reviewCount ??
      source.reviewsCount ??
      FALLBACK_REVIEWS[index % FALLBACK_REVIEWS.length],
    sold: formatSold(source.sold),
    image: source.image || '',
    thumbnails: Array.isArray(source.thumbnails) ? source.thumbnails : [],
    specs: Array.isArray(source.specs) ? source.specs : [],
    details: source.details && typeof source.details === 'object' ? source.details : {},
    badge: pickBadge(source),
    location: source.location || 'TZ',
    action: source.action || (source.tags ? 'cart' : 'inquiry'),
    description: source.description || '',
  };
};

/* -------------------------------------------------------------------------- */
/*  Exports                                                                   */
/* -------------------------------------------------------------------------- */

/** The full, normalised Hualink catalogue. */
export const PRODUCTS = productsCatalog.map(normalizeProduct);

/** Filter chips rendered above the grid. */
export const GRID_FILTERS = [
  { id: 'all', label: 'All Categories' },
  { id: 'smartphones', label: 'Smartphones' },
  { id: 'home-appliances', label: 'Home Appliances' },
  { id: 'electronics', label: 'Electronics & Tech' },
  { id: 'automobile', label: 'Automobile' },
];

export default PRODUCTS;
