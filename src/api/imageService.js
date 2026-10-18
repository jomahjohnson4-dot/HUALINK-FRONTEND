import api from './axios';

/**
 * Image Upload & Fetch API Service
 * Handles uploading product images to the backend and retrieving them.
 * Falls back to sessionStorage when the API is unavailable (offline/dev mode).
 */

const SESSION_PREFIX = 'card_image_';

/**
 * Upload a single image file as Base64 to the backend API.
 * Falls back to sessionStorage storage if the API request fails.
 */
export const uploadImage = async (file, productId) => {
  if (!file) return null;

  // Convert file to Base64
  const base64String = await fileToBase64(file);

  // Try to persist via API first
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('productId', productId);

    const response = await api.post('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data && response.data.imageUrl) {
      // Persist locally as backup/session mirror
      sessionStorage.setItem(`${SESSION_PREFIX}${productId}`, response.data.imageUrl);
      return response.data.imageUrl;
    }
  } catch (err) {
    console.warn('[ImageService] API upload failed, falling back to sessionStorage:', err.message);
  }

  // Fallback: store Base64 in sessionStorage (session cookie behavior)
  sessionStorage.setItem(`${SESSION_PREFIX}${productId}`, base64String);
  return base64String;
};

/**
 * Fetch all uploaded images for a given product from the backend.
 * Falls back to sessionStorage if API fails.
 */
export const fetchProductImages = async (productId) => {
  try {
    const response = await api.get(`/images/product/${productId}`);
    return response.data.images || [];
  } catch (err) {
    console.warn('[ImageService] API fetch failed, using sessionStorage fallback:', err.message);
    const stored = sessionStorage.getItem(`${SESSION_PREFIX}${productId}`);
    return stored ? [stored] : [];
  }
};

/**
 * Fetch all images currently stored in the session (for gallery / recent uploads).
 */
export const fetchSessionImages = () => {
  const images = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith(SESSION_PREFIX)) {
      images.push({
        productId: key.replace(SESSION_PREFIX, ''),
        imageUrl: sessionStorage.getItem(key),
      });
    }
  }
  return images;
};

/**
 * Delete an uploaded image for a product (backend + sessionStorage).
 */
export const deleteProductImage = async (productId) => {
  try {
    await api.delete(`/images/product/${productId}`);
  } catch (err) {
    console.warn('[ImageService] API delete failed:', err.message);
  }
  sessionStorage.removeItem(`${SESSION_PREFIX}${productId}`);
};

/**
 * Helper: Convert a File to a Base64 data URL string.
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};
