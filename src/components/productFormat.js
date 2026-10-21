/**
 * Shared formatting helpers for the product surfaces (card, modal, chat).
 *
 * Kept in a dedicated module so every surface renders prices identically
 * without the component files having to export plain functions alongside
 * their React components.
 */

/**
 * Price as it should read on screen. Catalogue rows already carry a display
 * string ("TSh 25,000") while live API rows carry a raw number.
 */
export const formatPrice = (value) => {
  if (value === null || value === undefined || value === '') return 'Price on request';
  if (typeof value === 'number') return `TSh ${value.toLocaleString('en-US')}`;
  return String(value);
};

/**
 * Numeric price resolved from a display string ("TSh 25,000" -> 25000).
 */
export const numericPrice = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Pre-written WhatsApp inquiry for a product, ready to be URL-encoded.
 */
export const buildProductInquiryMessage = (name, priceLabel) =>
  `Hello Hualink Distribution! I would like to order/inquire about ${name} (Price: ${priceLabel}).`;
