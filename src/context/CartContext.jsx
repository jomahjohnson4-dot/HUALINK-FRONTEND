import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { numericPrice } from '../components/productFormat';

/** localStorage key that backs the basket across reloads. */
export const CART_STORAGE_KEY = 'hualink_cart';

const CartContext = createContext(null);

/** Identity of a cart line — products arrive with `id`, `_id` or `productId`. */
const itemKey = (item) => item?.id || item?._id || item?.productId;

/** Reads the persisted basket. A corrupt payload must never break the app. */
const readStoredCart = () => {
  if (typeof localStorage === 'undefined') return [];

  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse cart items from local storage:', err);
    return [];
  }
};

/**
 * Normalises a product into a cart line.
 *
 * Prices arrive as display strings ("TSh 25,000") from the catalogue and as
 * raw numbers from the API — they are stored as numbers so the drawer and the
 * checkout always add up correctly.
 */
const toCartItem = (product, quantity) => {
  const price = numericPrice(product.price ?? product.unitPrice ?? product.basePrice);

  return {
    ...product,
    id: itemKey(product),
    name: product.name || product.title || 'Hualink Item',
    price,
    unitPrice: price,
    image: product.image || product.thumbnail || product.thumbnails?.[0] || '',
    quantity,
  };
};

/**
 * Global cart state.
 *
 * The provider owns the basket, its persistence and the drawer visibility, so
 * every surface (cards, quick view, product page, header badge) reads and
 * mutates exactly the same state.
 */
export function CartProvider({ children }) {
  // Lazy initialise from localStorage so a reload keeps the basket.
  const [cart, setCart] = useState(readStoredCart);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Mirror every change into localStorage.
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart to local storage:', err);
    }
  }, [cart]);

  /**
   * Adds a product to the basket. A product that is already in the basket has
   * its quantity incremented instead of creating a duplicate line.
   */
  const addToCart = useCallback((product, quantity = 1) => {
    if (!product) return;

    const amount = Math.max(1, Number(quantity) || 1);
    const key = itemKey(product);

    setCart((prevCart) => {
      const exists = prevCart.some((item) => itemKey(item) === key);

      if (exists) {
        return prevCart.map((item) =>
          itemKey(item) === key
            ? { ...item, quantity: (Number(item.quantity) || 0) + amount }
            : item
        );
      }

      return [...prevCart, toCartItem(product, amount)];
    });
  }, []);

  /** Sets an explicit quantity; zero or less removes the line. */
  const updateQuantity = useCallback((id, newQuantity) => {
    const quantity = Number(newQuantity) || 0;

    if (quantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => itemKey(item) !== id));
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => (itemKey(item) === id ? { ...item, quantity } : item))
    );
  }, []);

  const removeItem = useCallback((id) => {
    setCart((prevCart) => prevCart.filter((item) => itemKey(item) !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);

    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear cart from local storage:', err);
    }
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  // Total units in the basket — the number the header badge shows.
  const totalItems = useMemo(
    () => cart.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0),
    [cart]
  );

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + numericPrice(item.price ?? item.unitPrice) * (Number(item.quantity) || 0),
        0
      ),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      cartItems: cart,
      totalItems,
      subtotal,
      isCartOpen,
      openCart,
      closeCart,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      cart,
      totalItems,
      subtotal,
      isCartOpen,
      openCart,
      closeCart,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Access the global cart.
 *
 * @returns {{
 *   cart: object[],
 *   cartItems: object[],
 *   totalItems: number,
 *   subtotal: number,
 *   isCartOpen: boolean,
 *   openCart: () => void,
 *   closeCart: () => void,
 *   addToCart: (product: object, quantity?: number) => void,
 *   updateQuantity: (id: string, quantity: number) => void,
 *   removeItem: (id: string) => void,
 *   clearCart: () => void
 * }}
 */
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}

export default CartContext;
