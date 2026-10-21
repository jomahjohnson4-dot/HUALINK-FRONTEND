/**
 * Canonical Hualink Distribution service offerings rendered on /services.
 *
 * The translatable content (title, subtitle, features, badges, inquiry copy)
 * lives in `src/locales/*.json` under the `services` namespace so the page can
 * resolve it against the active language (EN, SW, ZH, FR). This module holds
 * the language-independent data: banner imagery, badge variant, and the
 * WhatsApp / in-app chat plumbing shared by every service card.
 */

/** Official Hualink Distribution WhatsApp number (international format). */
export const HUALINK_WHATSAPP = '255781359770';

/**
 * Neutral branded fallback banner (inline SVG) used whenever a remote
 * Unsplash banner fails to load, so a card never shows a broken image.
 */
const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="320" viewBox="0 0 800 320"><rect width="800" height="320" fill="#f3f4f6"/><g fill="none" stroke="#9ca3af" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><rect x="352" y="104" width="96" height="76" rx="8"/><path d="M352 132h96M386 104v76"/></g><text x="400" y="232" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#6b7280" text-anchor="middle" letter-spacing="4">HUALINK SERVICES</text></svg>`;

export const SERVICE_IMAGE_FALLBACK = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(FALLBACK_SVG)}`;

/**
 * The four primary service offerings. `key` maps to the `services.items.*`
 * translation entries; `badge` maps to `services.badge.*`.
 */
export const HUALINK_SERVICES = [
  {
    key: 'freight',
    badge: 'global',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
  },
  {
    key: 'customs',
    badge: 'global',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
  },
  {
    key: 'sourcing',
    badge: 'global',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
  },
  {
    key: 'hub',
    badge: 'regional',
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80',
  },
];

/** Deep link to the official WhatsApp business line with a pre-filled message. */
export const buildWhatsAppUrl = (message) =>
  `https://wa.me/${HUALINK_WHATSAPP}?text=${encodeURIComponent(message)}`;

/** Initial in-app chat context for a service inquiry. */
export const buildChatContext = (serviceTitle) => `Inquiring about ${serviceTitle}`;
