// Admin products page — list all products with per-variant inline stock updates.
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../lib/format';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface Variant {
  id: string;
  sku: string;
  label: string;
  priceEuroCents: number;
  stockQuantity: number;
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  countryOfOrigin: string;
  isActive: boolean;
  category: { name: string };
  variants: Variant[];
}

function StockCell({
  productId,
  variant,
  token,
  onUpdated,
}: {
  productId: string;
  variant: Variant;
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
      const res = await fetch(
        `${API_URL}/api/v1/admin/products/${productId}/stock`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            variantId: variant.id,
            stockQuantity: parsed,
          }),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { message?: string }).message ?? `HTTP ${res.status}`
        );
      }
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
  const { token, isLoggedIn } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
      return;
    }
    fetch(`${API_URL}/api/v1/admin/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ data: Product[] }>;
      })
      .then((body) => setProducts(body.data))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load')
      )
      .finally(() => setLoading(false));
  }, [isLoggedIn, token, router]);

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

  if (!isLoggedIn) return null;

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Products</h1>

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
                  <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">
                    SKU
                  </th>
                  <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">
                    Label
                  </th>
                  <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">
                    Price
                  </th>
                  <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">
                    Stock
                  </th>
                  <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">
                    Update stock
                  </th>
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
    </>
  );
}
