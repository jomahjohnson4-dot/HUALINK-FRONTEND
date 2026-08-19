// src/hooks/useCheckout.js
import { useState } from 'react';
import API from '../api/axios';

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  const createOrder = async ({ customerPhone, paymentMethod, shippingAddress, region, cart }) => {
    setLoading(true);
    setError(null);

    // Calculate total amount handling both unitPrice and price properties safely
    const totalAmount = cart.reduce((sum, item) => {
      const price = item.unitPrice ?? item.price ?? 0;
      const parsedPrice = typeof price === 'number' ? price : parseFloat(price) || 0;
      return sum + item.quantity * parsedPrice;
    }, 0);

    try {
      const payload = {
        customerPhone,
        paymentMethod,
        shippingAddress,
        region: region || 'Dar es Salaam',
        totalAmount,
        items: cart.map((item) => ({
          productId: item.id || item._id || item.productId,
          name: item.name || item.title,
          price: item.unitPrice ?? item.price ?? 0,
          quantity: item.quantity,
        })),
      };

      // Axios interceptor handles base URL and attaches Authorization: Bearer <token>
      const response = await API.post('/orders', payload);
      const resultData = response.data.data || response.data;

      setOrder(resultData);
      return resultData;
    } catch (err) {
      console.error('Order creation error:', err);
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to place order';
      setError(errorMessage);
      throw new Error(errorMessage, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  return { createOrder, loading, error, order };
}