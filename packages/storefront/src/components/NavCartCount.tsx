// NavCartCount — shows the current cart item count in the navigation bar.
'use client';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export function NavCartCount() {
  const { totalItems } = useCart();
  return (
    <Link
      href="/cart"
      className="relative text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
    >
      Cart
      {totalItems > 0 && (
        <span className="ml-1 bg-green-600 text-white text-xs rounded-full px-1.5 py-0.5 font-semibold">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
