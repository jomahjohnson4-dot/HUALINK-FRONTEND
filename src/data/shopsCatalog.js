/**
 * Verified supplier storefronts rendered on /shops.
 *
 * Banner imagery lives here with a paired high-quality fallback photo per
 * supplier (electronics/warehouse shots) so a broken primary URL degrades to
 * a relevant image instead of an empty box. Contact copy and the official
 * WhatsApp line are shared with the services catalog.
 */
import { HUALINK_WHATSAPP } from './servicesCatalog.js';

export { HUALINK_WHATSAPP };

/** High-quality fallback photos (electronics factory / warehouse interiors). */
const ELECTRONICS_FALLBACK = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80';
const WAREHOUSE_FALLBACK = 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80';

export const VERIFIED_SUPPLIERS = [
  {
    key: 'shenzhen-tech',
    nameKey: 'shops.nameShenzhenTech',
    locationKey: 'shops.locationShenzhen',
    badgeKey: 'shops.badgeGold',
    rating: 4.9,
    metricKeys: ['shops.metricResponse99', 'shops.metricWholesale100'],
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
    fallbackImage: WAREHOUSE_FALLBACK,
  },
  {
    key: 'guangzhou-power',
    nameKey: 'shops.nameGuangzhouPower',
    locationKey: 'shops.locationGuangzhou',
    badgeKey: 'shops.badgeOem',
    rating: 4.8,
    metricKeys: ['shops.metricResponse97', 'shops.metricFastDispatch'],
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80',
    fallbackImage: ELECTRONICS_FALLBACK,
  },
  {
    key: 'east-africa-logistics',
    nameKey: 'shops.nameEastAfrica',
    locationKey: 'shops.locationDarMbeya',
    badgeKey: 'shops.badgeRegional',
    rating: 4.7,
    metricKeys: ['shops.metricResponse95', 'shops.metricSameDay'],
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    fallbackImage: WAREHOUSE_FALLBACK,
  },
  {
    key: 'mbeya-depot',
    nameKey: 'shops.nameHualinkMbeya',
    locationKey: 'shops.locationMbeya',
    badgeKey: 'shops.badgeHualinkDepot',
    rating: 5.0,
    metricKeys: ['shops.metricResponse100', 'shops.metricPickups'],
    image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80',
    fallbackImage: ELECTRONICS_FALLBACK,
  },
];

/** Exact outreach copy used for both the WhatsApp deep link and chat pre-fill. */
export const buildSupplierContactMessage = (supplierName) =>
  `Hello! I am inquiring about wholesale products from ${supplierName} on Hualink Distribution.`;

/** Deep link to the official WhatsApp line with the inquiry pre-populated. */
export const buildSupplierWhatsAppUrl = (supplierName) =>
  `https://wa.me/${HUALINK_WHATSAPP}?text=${encodeURIComponent(buildSupplierContactMessage(supplierName))}`;
