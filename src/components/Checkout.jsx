import { useState } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

// Active cart state or props
const cart = [
  {
    productId: 'aff60abc-d4f2-4d6b-be04-daee2b48e0a6',
    quantity: 1,
    unitPrice: 45000,
  },
];

export default function CheckoutForm() {
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('M-PESA');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const totalAmount = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    const payload = {
      customerPhone,
      paymentMethod,
      totalAmount,
      items: cart,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to place order');
      }

      setStatus({
        type: 'success',
        message: `Order #${result.data.orderNumber} created! Check your phone for payment prompt.`,
      });
      console.log('Created Order:', result.data);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div>
        <label htmlFor="customerPhone">Phone Number</label>
        <input
          id="customerPhone"
          type="tel"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="0700000000"
          required
        />
      </div>

      <div>
        <label htmlFor="paymentMethod">Payment Method</label>
        <select
          id="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="M-PESA">M-Pesa</option>
          <option value="AZAM-PAY">AzamPay</option>
          <option value="AIRTEL-MONEY">Airtel Money</option>
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Processing Request...' : `Pay TZS ${totalAmount.toLocaleString()}`}
      </button>

      {status.message && (
        <div className={`alert alert-${status.type}`}>
          {status.message}
        </div>
      )}
    </form>
  );
}