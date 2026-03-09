// Cart page — two-column layout: items left, order summary right.
'use client';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/format';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalEuroCents } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
        <p className="text-6xl mb-6">🌿</p>
        <h1
          className="mb-3"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '36px', color: 'var(--color-text)' }}
        >
          Your cart is empty
        </h1>
        <p className="mb-8" style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif', fontWeight: 300 }}>
          Discover our specialty ingredients from around the world.
        </p>
        <Link
          href="/products"
          className="inline-block px-8 py-3 rounded-xl text-sm"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            fontFamily: 'Jost, sans-serif',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Start shopping →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      <h1
        className="mb-8"
        style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '40px', color: 'var(--color-text)' }}
      >
        Your cart
      </h1>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Items */}
        <div className="flex-1 min-w-0">
          <ul className="space-y-0 list-none p-0" style={{ borderTop: '1px solid var(--color-border)' }}>
            {items.map(item => (
              <li
                key={item.variantId}
                className="flex items-center gap-4 py-5"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                {/* Thumbnail placeholder */}
                <div
                  className="w-14 h-14 rounded-lg shrink-0 flex items-center justify-center text-2xl"
                  style={{ backgroundColor: 'var(--color-primary-light)' }}
                >
                  🌿
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium truncate"
                    style={{ color: 'var(--color-text)', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}
                  >
                    {item.productName}
                  </p>
                  <p
                    className="text-sm mt-0.5"
                    style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif', fontWeight: 300 }}
                  >
                    {item.variantLabel}
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    className="w-8 h-8 rounded-full border flex items-center justify-center text-sm transition-colors hover:opacity-70"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  >
                    −
                  </button>
                  <span
                    className="w-8 text-center text-sm"
                    style={{ fontFamily: 'Jost, sans-serif', fontWeight: 500, color: 'var(--color-text)' }}
                  >
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    className="w-8 h-8 rounded-full border flex items-center justify-center text-sm transition-colors hover:opacity-70"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  >
                    +
                  </button>
                </div>

                <p
                  className="w-20 text-right text-sm shrink-0"
                  style={{ color: 'var(--color-accent-warm)', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}
                >
                  {formatPrice(item.priceEuroCents * item.quantity)}
                </p>

                <button
                  onClick={() => removeItem(item.variantId)}
                  className="text-lg shrink-0 hover:opacity-60 transition-opacity"
                  style={{ color: 'var(--color-text-muted)' }}
                  aria-label="Remove"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <Link
              href="/products"
              className="text-sm hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-primary)', fontFamily: 'Jost, sans-serif' }}
            >
              ← Continue shopping
            </Link>
          </div>
        </div>

        {/* Order summary — sticky */}
        <div
          className="lg:w-80 shrink-0 rounded-2xl p-6 sticky top-24"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h2
            className="mb-5"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 600,
              fontSize: '24px',
              color: 'var(--color-text)',
            }}
          >
            Order summary
          </h2>

          <div className="space-y-3 mb-5" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
            <div className="flex justify-between text-sm" style={{ fontFamily: 'Jost, sans-serif', color: 'var(--color-text-muted)' }}>
              <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span style={{ color: 'var(--color-text)' }}>{formatPrice(totalEuroCents)}</span>
            </div>
            <div className="flex justify-between text-sm" style={{ fontFamily: 'Jost, sans-serif', color: 'var(--color-text-muted)' }}>
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <span style={{ fontFamily: 'Jost, sans-serif', fontWeight: 500, color: 'var(--color-text)' }}>Total</span>
            <span
              style={{
                fontFamily: 'Jost, sans-serif',
                fontWeight: 500,
                fontSize: '20px',
                color: 'var(--color-accent-warm)',
              }}
            >
              {formatPrice(totalEuroCents)}
            </span>
          </div>

          <Link
            href="/checkout"
            className="block w-full text-center py-4 rounded-xl text-sm transition-colors hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              fontFamily: 'Jost, sans-serif',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
