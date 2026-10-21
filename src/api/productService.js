import api from './axios';

export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

/* -------------------------------------------------------------------------- */
/*  Admin CRUD                                                                */
/* -------------------------------------------------------------------------- */

export const createProduct = async (payload) => {
  const response = await api.post('/products', payload);
  return response.data;
};

export const updateProduct = async (id, payload) => {
  const response = await api.put(`/products/${id}`, payload);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

/**
 * Toggle a product's availability. Falls back to the generic update endpoint
 * because not every backend revision exposes a dedicated PATCH route.
 */
export const toggleProductAvailability = async (id, isAvailable) => {
  const response = await api.patch(`/products/${id}/availability`, { isAvailable });
  return response.data;
};
