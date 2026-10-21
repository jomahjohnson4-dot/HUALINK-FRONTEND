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
    name: 'Shenzhen Tech Electronics Co., Ltd.',
    location: 'Shenzhen, China',
    badge: 'Verified Gold Supplier',
    rating: 4.9,
    metrics: ['99% Response Rate', '100+ Wholesale Items'],
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
    fallbackImage: WAREHOUSE_FALLBACK,
  },
  {
    key: 'guangzhou-power',
    name: 'Guangzhou Power & Charger Factory',
    location: 'Guangzhou, China',
    badge: 'OEM/ODM Specialized',
    rating: 4.8,
    metrics: ['97% Response Rate', 'Fast Dispatch'],
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80',
    fallbackImage: ELECTRONICS_FALLBACK,
  },
  {
    key: 'east-africa-logistics',
    name: 'East Africa Regional Logistics & Packaging Ltd',
    location: 'Dar es Salaam / Mbeya Hub, Tanzania',
    badge: 'Regional Distribution Partner',
    rating: 4.7,
    metrics: ['95% Response Rate', 'Same-Day Local Delivery'],
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    fallbackImage: WAREHOUSE_FALLBACK,
  },
  {
    key: 'mbeya-depot',
    name: 'Hualink Electronics Hub (Mbeya Main Depot)',
    location: 'Mbeya, Tanzania',
    badge: 'Official Hualink Depot',
    rating: 5.0,
    metrics: ['100% Verified Stock', 'Direct Pickups Available'],
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
