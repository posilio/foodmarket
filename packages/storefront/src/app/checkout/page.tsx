// Checkout page — collects delivery address then posts order to the backend.
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/format';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function CheckoutPage() {
  const { isLoggedIn, token } = useAuth();
  const { items, totalEuroCents, clearCart } = useCart();
  const router = useRouter();

  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) router.replace('/login');
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn && items.length === 0) router.replace('/cart');
  }, [isLoggedIn, items.length, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Save shipping address
      const addrRes = await fetch(`${API_URL}/api/v1/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ street, houseNumber, postalCode, city }),
      });
      if (!addrRes.ok) {
        const body = await addrRes.json().catch(() => ({}));
        throw new Error(
          (body as { message?: string }).message ?? 'Failed to save address'
        );
      }
      const addrBody = await addrRes.json() as { data: { id: string } };
      const addressId = addrBody.data.id;

      // 2. Place order
      const orderRes = await fetch(`${API_URL}/api/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddressId: addressId,
          lines: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });
      if (!orderRes.ok) {
        const body = await orderRes.json().catch(() => ({}));
        throw new Error(
          (body as { message?: string }).message ?? 'Failed to place order'
        );
      }
      const orderBody = await orderRes.json() as { data: { id: string } };
      const orderId = orderBody.data.id;

      // 3. Create Mollie payment and redirect to hosted checkout
      const payRes = await fetch(`${API_URL}/api/v1/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      });
      if (!payRes.ok) {
        const body = await payRes.json().catch(() => ({}));
        throw new Error(
          (body as { message?: string }).message ?? 'Failed to initiate payment'
        );
      }
      const payBody = await payRes.json() as { data: { checkoutUrl: string } };

      clearCart();
      // Hard redirect to Mollie's hosted checkout page
      window.location.href = payBody.data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  // Avoid flash before redirect effects run
  if (!isLoggedIn || items.length === 0) return null;

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order summary */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Order summary
          </h2>
          <ul className="space-y-2 list-none p-0 mb-4">
            {items.map((item) => (
              <li key={item.variantId} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.productName} — {item.variantLabel} × {item.quantity}
                </span>
                <span className="font-medium text-gray-900">
                  {formatPrice(item.priceEuroCents * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-semibold border-t border-gray-200 pt-3">
            <span>Total</span>
            <span>{formatPrice(totalEuroCents)}</span>
          </div>
        </div>

        {/* Address form */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Delivery address
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                House number
              </label>
              <input
                type="text"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Redirecting to payment…' : 'Place order & pay'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
