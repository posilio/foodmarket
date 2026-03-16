// Admin products page — list all products with per-variant inline stock updates and load-more.
'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { adminApi, type Product } from '../../lib/api';
import { formatPrice } from '../../lib/format';

function StockCell({
  productId,
  variant,
  token,
  onUpdated,
}: {
  productId: string;
  variant: Product['variants'][number];
  token: string;
  onUpdated: (variantId: string, qty: number) => void;
}) {
  const [qty, setQty] = useState(String(variant.stockQuantity));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleUpdate() {
    const parsed = parseInt(qty, 10);
    if (isNaN(parsed) || parsed < 0) {
      setMsg('Invalid quantity');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      await adminApi.products.updateStock(token, productId, variant.id, parsed);
      onUpdated(variant.id, parsed);
      setMsg('✓');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        value={qty}
        onChange={(e) => setQty(e.currentTarget.value)}
        className="w-20 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        onClick={handleUpdate}
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded transition-colors disabled:opacity-50"
      >
        {saving ? '…' : 'Update'}
      </button>
      {msg && (
        <span
          className={`text-xs ${msg === '✓' ? 'text-green-600' : 'text-red-500'}`}
        >
          {msg}
        </span>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(
    async (cursor?: string, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const result = await adminApi.products.list(token!, cursor);
        setProducts((prev) => (append ? [...prev, ...result.data] : result.data));
        setNextCursor(result.nextCursor);
        setTotal(result.total);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        if (append) setLoadingMore(false);
        else setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const handleStockUpdated = useCallback(
    (productId: string, variantId: string, qty: number) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id !== productId
            ? p
            : {
                ...p,
                variants: p.variants.map((v) =>
                  v.id === variantId ? { ...v, stockQuantity: qty } : v
                ),
              }
        )
      );
    },
    []
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Products{total > 0 && <span className="ml-2 text-gray-400 font-normal text-lg">({total})</span>}
        </h1>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {loading && <p className="text-gray-500 text-sm">Loading…</p>}

      {!loading && products.length === 0 && (
        <p className="text-gray-500 text-sm">No products found.</p>
      )}

      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
          >
            {/* Product header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500">
                  {product.category.name} · {product.countryOfOrigin}
                </p>
              </div>
              <Link
                href={`/products/${product.id}/edit`}
                className="text-xs font-medium text-blue-600 hover:underline mr-3"
              >
                Edit
              </Link>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  product.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {product.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Variants table */}
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">SKU</th>
                  <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">Label</th>
                  <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">Price</th>
                  <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">Stock</th>
                  <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">Update stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {product.variants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">
                      {variant.sku}
                    </td>
                    <td className="px-5 py-3 text-gray-900">{variant.label}</td>
                    <td className="px-5 py-3 text-gray-900">
                      {formatPrice(variant.priceEuroCents)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`font-medium ${
                          variant.stockQuantity > 0
                            ? 'text-green-700'
                            : 'text-red-500'
                        }`}
                      >
                        {variant.stockQuantity}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StockCell
                        productId={product.id}
                        variant={variant}
                        token={token ?? ''}
                        onUpdated={(vid, qty) =>
                          handleStockUpdated(product.id, vid, qty)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {nextCursor && (
        <div className="mt-6 text-center">
          <button
            onClick={() => void fetchProducts(nextCursor, true)}
            disabled={loadingMore}
            className="px-6 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </>
  );
}
