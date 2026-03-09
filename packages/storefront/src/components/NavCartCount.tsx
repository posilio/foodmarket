'use client';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export function NavCartCount() {
  const { totalItems } = useCart();
  return (
    <Link href="/cart" className="relative flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-text)' }}>
      <span className="text-xl leading-none">🛍</span>
      {totalItems > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-white text-[10px] font-medium rounded-full px-1"
          style={{ backgroundColor: 'var(--color-primary)', fontFamily: 'Jost, sans-serif' }}
        >
          {totalItems}
        </span>
      )}
    </Link>
  );
}
