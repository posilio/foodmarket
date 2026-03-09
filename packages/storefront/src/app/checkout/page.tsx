// Checkout page — two-column layout: form left, summary right.
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/format';
import { useRequireAuth } from '../../lib/useRequireAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

const inputStyle = {
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  padding: '12px 16px',
  fontSize: '14px',
  fontFamily: 'Jost, sans-serif',
  width: '100%',
  backgroundColor: '#fff',
  color: 'var(--color-text)',
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontFamily: 'Jost, sans-serif',
  fontWeight: 500 as const,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: 'var(--color-text-muted)',
  marginBottom: '6px',
};

export default function CheckoutPage() {
  const { isLoggedIn, token } = useRequireAuth();
  const { items, totalEuroCents, clearCart } = useCart();
  const router = useRouter();

  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn && items.length === 0) router.replace('/cart');
  }, [isLoggedIn, items.length, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const addrRes = await fetch(`${API_URL}/api/v1/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ street, houseNumber, postalCode, city }),
      });
      if (!addrRes.ok) {
        const body = await addrRes.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? 'Failed to save address');
      }
      const addrBody = await addrRes.json() as { data: { id: string } };
      const addressId = addrBody.data.id;

      const orderRes = await fetch(`${API_URL}/api/v1/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shippingAddressId: addressId, lines: items.map(i => ({ variantId: i.variantId, quantity: i.quantity })) }),
      });
      if (!orderRes.ok) {
        const body = await orderRes.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? 'Failed to place order');
      }
      const orderBody = await orderRes.json() as { data: { id: string } };
      const orderId = orderBody.data.id;

      const payRes = await fetch(`${API_URL}/api/v1/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId }),
      });
      if (!payRes.ok) {
        const body = await payRes.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? 'Failed to initiate payment');
      }
      const payBody = await payRes.json() as { data: { checkoutUrl: string } };
      clearCart();
      window.location.href = payBody.data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn || items.length === 0) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      <h1
        className="mb-8"
        style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '40px', color: 'var(--color-text)' }}
      >
        Checkout
      </h1>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Form */}
        <div className="flex-1 min-w-0">
          <h2
            className="mb-5"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '24px', color: 'var(--color-text)' }}
          >
            Delivery address
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label style={labelStyle}>Street</label>
              <input type="text" value={street} onChange={e => setStreet(e.target.value)} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>House number</label>
              <input type="text" value={houseNumber} onChange={e => setHouseNumber(e.target.value)} required style={inputStyle} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Postal code</label>
                <input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>City</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)} required style={inputStyle} />
              </div>
            </div>
            {error && <p className="text-sm text-red-500" style={{ fontFamily: 'Jost, sans-serif' }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-sm transition-opacity disabled:opacity-50 mt-2"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                fontFamily: 'Jost, sans-serif',
                fontWeight: 500,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '15px',
              }}
            >
              {loading ? 'Redirecting to payment…' : 'Pay with Mollie →'}
            </button>
          </form>
        </div>

        {/* Summary */}
        <div
          className="lg:w-80 shrink-0 rounded-2xl p-6 sticky top-24"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <h2
            className="mb-5"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '24px', color: 'var(--color-text)' }}
          >
            Order summary
          </h2>
          <ul className="space-y-2 mb-5 list-none p-0" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
            {items.map(item => (
              <li key={item.variantId} className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif', fontWeight: 300 }}>
                  {item.productName} — {item.variantLabel} × {item.quantity}
                </span>
                <span style={{ color: 'var(--color-text)', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}>
                  {formatPrice(item.priceEuroCents * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center">
            <span style={{ fontFamily: 'Jost, sans-serif', fontWeight: 500, color: 'var(--color-text)' }}>Total</span>
            <span style={{ fontFamily: 'Jost, sans-serif', fontWeight: 500, fontSize: '20px', color: 'var(--color-accent-warm)' }}>
              {formatPrice(totalEuroCents)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
