// Checkout page — two-column layout: form left, summary right.
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../lib/format';
import { useRequireAuth } from '../../lib/useRequireAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const SHIPPING_CENTS = parseInt(process.env.NEXT_PUBLIC_SHIPPING_CENTS ?? '499', 10);

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

interface SavedAddress {
  id: string;
  street: string;
  houseNumber: string;
  houseNumberAddition: string | null;
  postalCode: string;
  city: string;
  country: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const { isLoggedIn, token } = useRequireAuth('/login?redirect=/checkout');
  const { customer } = useAuth();
  const { items, totalEuroCents, clearCart } = useCart();
  const router = useRouter();

  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [saveAddress, setSaveAddress] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Discount code state
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [appliedDiscountCode, setAppliedDiscountCode] = useState('');
  const [discountEuroCents, setDiscountEuroCents] = useState(0);
  const [discountDescription, setDiscountDescription] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  // Loyalty points state
  const [loyaltyBalance, setLoyaltyBalance] = useState(0);
  const [redeemPointsInput, setRedeemPointsInput] = useState('');

  // Load saved addresses for logged-in users
  useEffect(() => {
    if (!isLoggedIn || !token) return;
    fetch(`${API_URL}/api/v1/addresses`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() as Promise<{ data: SavedAddress[] }> : Promise.resolve({ data: [] }))
      .then((body) => setSavedAddresses(body.data))
      .catch(() => {});
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (isLoggedIn && items.length === 0) router.replace('/cart');
  }, [isLoggedIn, items.length, router]);

  // Load loyalty balance
  useEffect(() => {
    if (!isLoggedIn || !token) return;
    fetch(`${API_URL}/api/v1/loyalty/balance`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() as Promise<{ data: { balance: number } }> : Promise.resolve({ data: { balance: 0 } }))
      .then((body) => setLoyaltyBalance(body.data.balance))
      .catch(() => {});
  }, [isLoggedIn, token]);

  async function handleApplyDiscount() {
    if (!discountCodeInput.trim()) return;
    setDiscountError('');
    setApplyingDiscount(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/orders/validate-discount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: discountCodeInput.trim().toUpperCase(), lineTotalCents: totalEuroCents }),
      });
      const body = await res.json() as { data?: { discountEuroCents: number; description: string }; message?: string };
      if (!res.ok) {
        setDiscountError((body as { message?: string }).message ?? 'Invalid discount code');
        return;
      }
      setAppliedDiscountCode(discountCodeInput.trim().toUpperCase());
      setDiscountEuroCents(body.data!.discountEuroCents);
      setDiscountDescription(body.data!.description);
      setDiscountCodeInput('');
    } catch {
      setDiscountError('Failed to apply discount code');
    } finally {
      setApplyingDiscount(false);
    }
  }

  function removeDiscount() {
    setAppliedDiscountCode('');
    setDiscountEuroCents(0);
    setDiscountDescription('');
    setDiscountError('');
  }

  function selectSavedAddress(addr: SavedAddress) {
    setSelectedAddressId(addr.id);
    setStreet(addr.street);
    setHouseNumber(addr.houseNumber);
    setPostalCode(addr.postalCode);
    setCity(addr.city);
  }

  const redeemPoints = parseInt(redeemPointsInput, 10) || 0;
  const pointsDiscountCents = Math.min(redeemPoints, Math.max(0, totalEuroCents - discountEuroCents));
  const grandTotal = totalEuroCents + SHIPPING_CENTS - discountEuroCents - pointsDiscountCents;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Use selected saved address or create a new one
      let addressId: string;
      if (selectedAddressId) {
        addressId = selectedAddressId;
      } else {
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
        addressId = addrBody.data.id;
      }

      const orderRes = await fetch(`${API_URL}/api/v1/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          shippingAddressId: addressId,
          lines: items.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
          ...(appliedDiscountCode ? { discountCode: appliedDiscountCode } : {}),
          ...(redeemPoints > 0 ? { redeemPoints } : {}),
        }),
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
          {/* Saved addresses */}
          {savedAddresses.length > 0 && (
            <div className="mb-8">
              <h2
                className="mb-4"
                style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '22px', color: 'var(--color-text)' }}
              >
                Use a saved address
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => selectSavedAddress(addr)}
                    className="text-left p-4 rounded-xl border transition-colors"
                    style={{
                      border: selectedAddressId === addr.id
                        ? '2px solid var(--color-primary)'
                        : '1px solid var(--color-border)',
                      backgroundColor: selectedAddressId === addr.id
                        ? 'var(--color-primary-light, #f0faf5)'
                        : '#fff',
                    }}
                  >
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)', fontFamily: 'Jost, sans-serif' }}>
                      {addr.street} {addr.houseNumber}{addr.houseNumberAddition ? ` ${addr.houseNumberAddition}` : ''}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif' }}>
                      {addr.postalCode} {addr.city}
                    </p>
                    {addr.isDefault && (
                      <span className="text-xs" style={{ color: 'var(--color-primary)', fontFamily: 'Jost, sans-serif' }}>Default</span>
                    )}
                  </button>
                ))}
              </div>
              {selectedAddressId && (
                <button
                  type="button"
                  onClick={() => { setSelectedAddressId(null); setStreet(''); setHouseNumber(''); setPostalCode(''); setCity(''); }}
                  className="mt-3 text-sm underline"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif' }}
                >
                  Enter a different address
                </button>
              )}
            </div>
          )}

          {/* Manual address form — hidden when a saved address is selected */}
          {!selectedAddressId && (
            <>
              <h2
                className="mb-5"
                style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '24px', color: 'var(--color-text)' }}
              >
                Delivery address
              </h2>
              <div className="space-y-4">
                <div>
                  <label style={labelStyle}>Street</label>
                  <input type="text" value={street} onChange={e => setStreet(e.target.value)} required={!selectedAddressId} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>House number</label>
                  <input type="text" value={houseNumber} onChange={e => setHouseNumber(e.target.value)} required={!selectedAddressId} style={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Postal code</label>
                    <input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)} required={!selectedAddressId} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>City</label>
                    <input type="text" value={city} onChange={e => setCity(e.target.value)} required={!selectedAddressId} style={inputStyle} />
                  </div>
                </div>
                {customer && (
                  <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ fontFamily: 'Jost, sans-serif', color: 'var(--color-text-muted)' }}>
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    Save this address for future orders
                  </label>
                )}
              </div>
            </>
          )}

          {/* Discount code */}
          <div className="mt-8">
            <h2
              className="mb-3"
              style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '20px', color: 'var(--color-text)' }}
            >
              Discount code
            </h2>
            {appliedDiscountCode ? (
              <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-primary-light, #f0faf5)' }}>
                <div>
                  <span className="text-sm font-medium" style={{ fontFamily: 'Jost, sans-serif', color: 'var(--color-primary)' }}>
                    {appliedDiscountCode}
                  </span>
                  <span className="text-sm ml-2" style={{ fontFamily: 'Jost, sans-serif', color: 'var(--color-text-muted)' }}>
                    — {discountDescription} ({formatPrice(discountEuroCents)} off)
                  </span>
                </div>
                <button type="button" onClick={removeDiscount} className="text-xs underline" style={{ fontFamily: 'Jost, sans-serif', color: 'var(--color-text-muted)' }}>Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCodeInput}
                  onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={applyingDiscount || !discountCodeInput.trim()}
                  className="px-5 rounded-xl text-sm transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)', color: '#fff', fontFamily: 'Jost, sans-serif', fontWeight: 500, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  {applyingDiscount ? '…' : 'Apply'}
                </button>
              </div>
            )}
            {discountError && <p className="mt-2 text-sm text-red-500" style={{ fontFamily: 'Jost, sans-serif' }}>{discountError}</p>}
          </div>

          {/* Loyalty points */}
          {loyaltyBalance > 0 && (
            <div className="mt-6">
              <h2
                className="mb-1"
                style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '20px', color: 'var(--color-text)' }}
              >
                Loyalty points
              </h2>
              <p className="mb-3 text-sm" style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, color: 'var(--color-text-muted)' }}>
                You have <strong>{loyaltyBalance}</strong> points ({formatPrice(loyaltyBalance)}). Points expire 1 year after being earned.
              </p>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={0}
                  max={loyaltyBalance}
                  value={redeemPointsInput}
                  onChange={(e) => setRedeemPointsInput(e.target.value)}
                  placeholder={`0–${loyaltyBalance}`}
                  style={{ ...inputStyle, width: '140px' }}
                />
                <span className="text-sm" style={{ fontFamily: 'Jost, sans-serif', color: 'var(--color-text-muted)' }}>
                  {redeemPoints > 0 ? `= ${formatPrice(pointsDiscountCents)} off` : 'points to redeem'}
                </span>
              </div>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-500" style={{ fontFamily: 'Jost, sans-serif' }}>{error}</p>}

          <form onSubmit={handleSubmit}>
            <button
              type="submit"
              disabled={loading || (!selectedAddressId && (!street || !houseNumber || !postalCode || !city))}
              className="w-full py-4 rounded-xl text-sm transition-opacity disabled:opacity-50 mt-6"
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
          <ul className="space-y-2 mb-3 list-none p-0">
            {items.map(item => (
              <li key={item.variantId} className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif', fontWeight: 300 }}>
                  {item.productName} — {item.variantLabel} × {item.quantity}
                </span>
                <span style={{ color: 'var(--color-text)', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}>
                  {formatPrice(item.unitPriceEuroCents * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          {/* Shipping line */}
          <div className="flex justify-between text-sm mb-2">
            <span style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif', fontWeight: 300 }}>
              Shipping
            </span>
            <span style={{ color: 'var(--color-text)', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}>
              {formatPrice(SHIPPING_CENTS)}
            </span>
          </div>

          {discountEuroCents > 0 && (
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: 'var(--color-primary)', fontFamily: 'Jost, sans-serif', fontWeight: 300 }}>
                Discount ({appliedDiscountCode})
              </span>
              <span style={{ color: 'var(--color-primary)', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}>
                −{formatPrice(discountEuroCents)}
              </span>
            </div>
          )}

          {pointsDiscountCents > 0 && (
            <div className="flex justify-between text-sm mb-4 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ color: 'var(--color-primary)', fontFamily: 'Jost, sans-serif', fontWeight: 300 }}>
                Points ({redeemPoints} pts)
              </span>
              <span style={{ color: 'var(--color-primary)', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}>
                −{formatPrice(pointsDiscountCents)}
              </span>
            </div>
          )}

          {pointsDiscountCents === 0 && discountEuroCents === 0 && (
            <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }} />
          )}

          {(discountEuroCents > 0 || pointsDiscountCents > 0) && (
            <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }} />
          )}

          <div className="flex justify-between items-center">
            <span style={{ fontFamily: 'Jost, sans-serif', fontWeight: 500, color: 'var(--color-text)' }}>Total</span>
            <span style={{ fontFamily: 'Jost, sans-serif', fontWeight: 500, fontSize: '20px', color: 'var(--color-accent-warm)' }}>
              {formatPrice(grandTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
