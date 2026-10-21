import api from './axios';

/**
 * Normalise the many shapes the backend may return for a product list into a
 * plain array of product rows.
 */
const toProductList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data?.products)) return payload.data.products;
  return [];
};

/**
 * Flattens a database product row into the shape the UI renders.
 *
 * The Prisma model stores `basePrice` / `stockCount` / `isAvailable`; the
 * marketplace and the admin tables read `price` / `stock` / `isAvailable`.
 * Normalising here keeps every consumer on the same contract.
 */
export const normaliseProduct = (raw = {}) => ({
  id: raw.id || raw.productId || raw._id,
  name: raw.name || raw.title || 'Untitled product',
  category: raw.category || 'Uncategorised',
  description: raw.description || '',
  descriptions: raw.descriptions || {},
  price: Number(raw.basePrice ?? raw.price ?? 0),
  originalPrice: raw.originalPrice ?? null,
  stock: Number(raw.stockCount ?? raw.stock ?? 0),
  rating: Number(raw.rating ?? 4.8),
  image: raw.image || raw.imageUrl || '',
  isAvailable: raw.isAvailable !== false,
  warehouseLocation: raw.warehouseLocation || '',
  variants: Array.isArray(raw.variants) ? raw.variants : [],
});

/**
 * Fetch the live catalogue.
 *
 * @param {object}  [options]
 * @param {string}  [options.category]           exact category filter
 * @param {string}  [options.search]             free-text search
 * @param {number}  [options.page]               1-based page number
 * @param {number}  [options.limit]              page size
 * @param {boolean} [options.availableOnly]      hide products flagged unavailable
 * @param {boolean} [options.includeUnavailable] keep unavailable products in the result
 */
export const getProducts = async ({
  category,
  search,
  page,
  limit,
  availableOnly,
  includeUnavailable,
} = {}) => {
  const params = {};

  if (category) params.category = category;
  if (search) params.search = search;
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (availableOnly !== undefined) params.availableOnly = availableOnly;
  if (includeUnavailable !== undefined) params.includeUnavailable = includeUnavailable;

  const response = await api.get('/products', { params });
  const payload = response.data;

  return {
    products: toProductList(payload).map(normaliseProduct),
    pagination: payload?.pagination || null,
  };
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return normaliseProduct(response.data?.data || response.data);
};

/* -------------------------------------------------------------------------- */
/*  Admin CRUD                                                                */
/* -------------------------------------------------------------------------- */

export const createProduct = async (payload) => {
  const response = await api.post('/products', payload);
  return normaliseProduct(response.data?.data || response.data);
};

export const updateProduct = async (id, payload) => {
  const response = await api.put(`/products/${id}`, payload);
  return normaliseProduct(response.data?.data || response.data);
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

/**
 * Toggle a product's marketplace visibility.
 */
export const toggleProductAvailability = async (id, isAvailable) => {
  const response = await api.patch(`/products/${id}/availability`, { isAvailable });
  return normaliseProduct(response.data?.data || response.data);
};
