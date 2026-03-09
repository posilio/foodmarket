// Cart page — displays cart items with quantity controls and checkout link.
'use client';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/format';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalEuroCents } = useCart();

  if (items.length === 0) {
    return (
      <>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart</h1>
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link href="/products" className="text-green-600 hover:underline text-sm">
          Browse products
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your cart</h1>

      <ul className="space-y-4 list-none p-0 mb-6">
        {items.map((item) => (
          <li
            key={item.variantId}
            className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg px-4 py-3"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.productName}</p>
              <p className="text-sm text-gray-500">{item.variantLabel}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center justify-center text-sm"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center justify-center text-sm"
              >
                +
              </button>
            </div>

            <p className="w-20 text-right font-semibold text-gray-900 text-sm">
              {formatPrice(item.priceEuroCents * item.quantity)}
            </p>

            <button
              onClick={() => removeItem(item.variantId)}
              className="text-gray-400 hover:text-red-500 text-sm"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="flex justify-between items-center border-t border-gray-200 pt-4 mb-6">
        <span className="font-semibold text-gray-800">Total</span>
        <span className="text-lg font-bold text-gray-900">
          {formatPrice(totalEuroCents)}
        </span>
      </div>

      <Link
        href="/checkout"
        className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Proceed to checkout
      </Link>
    </>
  );
}
