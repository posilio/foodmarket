'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/format';
import type { Product } from '../types';


interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const { addItem, updateQuantity } = useCart();
  const [added, setAdded] = useState(false);

  const activeVariants = product.variants.filter(v => v.isActive);
  const cheapest = activeVariants.length > 0
    ? activeVariants.reduce((a, b) => a.priceEuroCents < b.priceEuroCents ? a : b)
    : null;
  const inStock = cheapest ? cheapest.stockQuantity > 0 : false;
  const flag = product.category?.emoji ?? '🌍';

  function handleAdd() {
    if (!cheapest) return;
    addItem({
      variantId: cheapest.id,
      productName: product.name,
      variantLabel: cheapest.label,
      unitPriceEuroCents: cheapest.priceEuroCents,
      maxStock: cheapest.stockQuantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(45,106,79,0.10)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block">
        <div
          className="w-full overflow-hidden"
          style={{ aspectRatio: '4/3', backgroundColor: 'var(--color-primary-light)' }}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              style={{ transition: 'transform 0.4s ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              🌿
            </div>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif', fontWeight: 300 }}>
          {flag} {product.countryOfOrigin}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3
            className="leading-tight mb-2 line-clamp-2"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 600,
              fontSize: '18px',
              color: 'var(--color-text)',
            }}
          >
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto">
          {cheapest && (
            <p className="text-base mb-3" style={{ color: 'var(--color-accent-warm)', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}>
              From {formatPrice(cheapest.priceEuroCents)}
            </p>
          )}
          <button
            onClick={handleAdd}
            disabled={!inStock}
            className="w-full py-2.5 rounded-xl text-sm transition-colors"
            style={inStock ? {
              backgroundColor: added ? 'var(--color-accent)' : 'var(--color-primary)',
              color: '#fff',
              fontFamily: 'Jost, sans-serif',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
            } : {
              backgroundColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
              fontFamily: 'Jost, sans-serif',
              border: 'none',
              cursor: 'not-allowed',
            }}
          >
            {!inStock ? 'Out of stock' : added ? '✓ Added' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
