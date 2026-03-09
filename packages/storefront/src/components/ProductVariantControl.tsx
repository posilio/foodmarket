'use client';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/format';
import type { ProductVariant } from '../types';

interface Props {
  productName: string;
  variants: ProductVariant[];
}

export function ProductVariantControl({ productName, variants }: Props) {
  const { addItem, updateQuantity } = useCart();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = variants[selectedIdx];
  const inStock = selected ? selected.stockQuantity > 0 : false;

  function handleAdd() {
    if (!selected || !inStock) return;
    addItem({
      variantId: selected.id,
      productName,
      variantLabel: selected.label,
      priceEuroCents: selected.priceEuroCents,
    });
    if (qty > 1) {
      updateQuantity(selected.id, qty);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (variants.length === 0) return null;

  return (
    <div className="space-y-5">
      {/* Variant selector */}
      {variants.length > 1 && (
        <div>
          <p
            className="text-xs tracking-widest uppercase mb-2"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}
          >
            Size / Weight
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v, i) => (
              <button
                key={v.id}
                onClick={() => { setSelectedIdx(i); setQty(1); }}
                className="px-4 py-2 rounded-full text-sm border transition-all"
                style={i === selectedIdx ? {
                  backgroundColor: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                  color: '#fff',
                  fontFamily: 'Jost, sans-serif',
                  fontWeight: 500,
                } : {
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  fontFamily: 'Jost, sans-serif',
                }}
              >
                {v.label} — {formatPrice(v.priceEuroCents)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      {selected && (
        <p
          style={{
            fontFamily: 'Jost, sans-serif',
            fontWeight: 500,
            fontSize: '24px',
            color: 'var(--color-accent-warm)',
          }}
        >
          {formatPrice(selected.priceEuroCents)}
        </p>
      )}

      {/* Quantity */}
      {inStock && (
        <div>
          <p
            className="text-xs tracking-widest uppercase mb-2"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}
          >
            Quantity
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-full border flex items-center justify-center text-lg transition-colors"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', backgroundColor: 'var(--color-surface)' }}
            >
              −
            </button>
            <span
              className="w-8 text-center text-base"
              style={{ fontFamily: 'Jost, sans-serif', fontWeight: 500, color: 'var(--color-text)' }}
            >
              {qty}
            </span>
            <button
              onClick={() => setQty(q => q + 1)}
              className="w-9 h-9 rounded-full border flex items-center justify-center text-lg transition-colors"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', backgroundColor: 'var(--color-surface)' }}
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Add to cart */}
      <button
        onClick={handleAdd}
        disabled={!inStock}
        className="w-full py-4 rounded-xl text-base transition-colors"
        style={inStock ? {
          backgroundColor: added ? 'var(--color-accent)' : 'var(--color-primary)',
          color: '#fff',
          fontFamily: 'Jost, sans-serif',
          fontWeight: 500,
          cursor: 'pointer',
          border: 'none',
        } : {
          backgroundColor: 'var(--color-border)',
          color: 'var(--color-text-muted)',
          cursor: 'not-allowed',
          fontFamily: 'Jost, sans-serif',
          border: 'none',
        }}
      >
        {!inStock
          ? 'Out of stock'
          : added
            ? '✓ Added to cart'
            : 'Add to cart'}
      </button>

      {selected && selected.stockQuantity > 0 && selected.stockQuantity < 10 && (
        <p className="text-xs" style={{ color: 'var(--color-accent-warm)', fontFamily: 'Jost, sans-serif' }}>
          Only {selected.stockQuantity} left in stock
        </p>
      )}
    </div>
  );
}
