// AddToCartButton — client component for adding a product variant to the cart.
'use client';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

interface AddToCartButtonProps {
  variantId: string;
  productName: string;
  variantLabel: string;
  unitPriceEuroCents: number;
  maxStock: number;
  inStock: boolean;
}

export function AddToCartButton({
  variantId,
  productName,
  variantLabel,
  unitPriceEuroCents,
  maxStock,
  inStock,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem({ variantId, productName, variantLabel, unitPriceEuroCents, maxStock });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (!inStock) {
    return (
      <button
        disabled
        className="w-full mt-2 bg-gray-100 text-gray-400 py-2 rounded-lg text-sm cursor-not-allowed"
      >
        Out of stock
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
    >
      {added ? 'Added!' : 'Add to cart'}
    </button>
  );
}
