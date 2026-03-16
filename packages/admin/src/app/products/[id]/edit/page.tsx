// Admin product edit page — edit product fields, variants, and add new variants.
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import { adminApi, type Product, type Category, type ProductVariant } from '../../../../lib/api';
import { formatPrice } from '../../../../lib/format';

export default function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  // Product fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isActive, setIsActive] = useState(true);

  // New variant form
  const [newSku, setNewSku] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [addingVariant, setAddingVariant] = useState(false);
  const [addVariantMsg, setAddVariantMsg] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [productsPage, cats] = await Promise.all([
          adminApi.products.list(token!),
          adminApi.products.listCategories(token!),
        ]);
        const found = productsPage.data.find((p) => p.id === id) ?? null;
        setCategories(cats.data);
        if (found) {
          setProduct(found);
          setName(found.name);
          setDescription(found.description ?? '');
          setImageUrl(found.imageUrl ?? '');
          setCountryOfOrigin(found.countryOfOrigin);
          setCategoryId(found.category.id);
          setIsActive(found.isActive);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id, token]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const result = await adminApi.upload.image(token!, file);
      setImageUrl(result.data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
      // Reset the input so the same file can be re-selected after an error
      e.target.value = '';
    }
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    setError('');
    try {
      const updated = await adminApi.products.update(token!, id, {
        name, description, imageUrl, countryOfOrigin, categoryId, isActive,
      });
      setProduct(updated.data);
      setSaveMsg('Product saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateVariant(
    variantId: string,
    field: keyof { label: string; priceEuroCents: number; isActive: boolean; ean: string },
    value: string | number | boolean
  ) {
    try {
      const updated = await adminApi.products.updateVariant(token!, id, variantId, {
        [field]: value,
      });
      setProduct((prev) =>
        prev
          ? {
              ...prev,
              variants: prev.variants.map((v) =>
                v.id === variantId ? { ...v, ...updated.data } : v
              ),
            }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update variant');
    }
  }

  async function handleAddVariant(e: React.FormEvent) {
    e.preventDefault();
    setAddingVariant(true);
    setAddVariantMsg('');
    try {
      const price = parseInt(newPrice.replace('.', '').replace(',', ''), 10);
      if (isNaN(price) || price < 0) throw new Error('Invalid price (enter euro cents, e.g. 499)');
      const stock = parseInt(newStock, 10) || 0;

      const result = await adminApi.products.addVariant(token!, id, {
        sku: newSku,
        label: newLabel,
        priceEuroCents: price,
        stockQuantity: stock,
      });
      setProduct((prev) =>
        prev ? { ...prev, variants: [...prev.variants, result.data] } : prev
      );
      setNewSku(''); setNewLabel(''); setNewPrice(''); setNewStock('');
      setAddVariantMsg('Variant added.');
      setTimeout(() => setAddVariantMsg(''), 3000);
    } catch (err) {
      setAddVariantMsg(err instanceof Error ? err.message : 'Failed to add variant');
    } finally {
      setAddingVariant(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return <p className="text-red-500 text-sm">{error || 'Product not found.'}</p>;
  }

  const inputCls = 'border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <>
      <Link href="/products" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
        ← Back to products
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit: {product.name}</h1>

      {error && (
        <div className="rounded-xl px-5 py-4 text-sm bg-red-50 border border-red-200 text-red-700 mb-6">
          ⚠ {error}
        </div>
      )}

      {/* Product form */}
      <form onSubmit={handleSaveProduct} className="bg-white border border-gray-200 rounded-xl p-6 mb-8 space-y-4">
        <h2 className="font-semibold text-gray-800 mb-2">Product details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Country of origin</label>
            <input className={inputCls} value={countryOfOrigin} onChange={(e) => setCountryOfOrigin(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select className={inputCls} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Product image</label>
            {imageUrl && (
              <img
                src={imageUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}` : imageUrl}
                alt="Product"
                className="mb-2 rounded object-cover"
                style={{ maxHeight: 120 }}
              />
            )}
            <label className="cursor-pointer">
              <span className={`${inputCls} inline-block text-center ${uploading ? 'opacity-50' : 'cursor-pointer hover:bg-gray-50'}`}>
                {uploading ? 'Uploading…' : imageUrl ? 'Change image' : 'Upload image'}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={uploading}
                onChange={handleImageUpload}
              />
            </label>
            {imageUrl && (
              <p className="mt-1 text-xs text-gray-400 truncate">{imageUrl}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <textarea
            className={inputCls}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="accent-blue-600"
          />
          <span className="text-gray-700">Active (visible to customers)</span>
        </label>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save product'}
          </button>
          {saveMsg && <p className="text-sm text-green-600">{saveMsg}</p>}
        </div>
      </form>

      {/* Variants table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-8">
        <h2 className="font-semibold text-gray-800 px-5 py-4 border-b border-gray-100">Variants</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">SKU</th>
              <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">EAN</th>
              <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">Label</th>
              <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">Price (cents)</th>
              <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">Stock</th>
              <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {product.variants.map((v) => (
              <VariantRow
                key={v.id}
                variant={v}
                onUpdate={(field, value) => void handleUpdateVariant(v.id, field as keyof { label: string; priceEuroCents: number; isActive: boolean; ean: string }, value)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Add variant form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Add variant</h2>
        <form onSubmit={handleAddVariant} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">SKU</label>
            <input className={inputCls} value={newSku} onChange={(e) => setNewSku(e.target.value)} required placeholder="SKU-001" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
            <input className={inputCls} value={newLabel} onChange={(e) => setNewLabel(e.target.value)} required placeholder="500g" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Price (euro cents)</label>
            <input className={inputCls} type="number" min="0" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} required placeholder="499" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
            <input className={inputCls} type="number" min="0" value={newStock} onChange={(e) => setNewStock(e.target.value)} placeholder="0" />
          </div>
          <div className="col-span-2 md:col-span-4 flex items-center gap-4">
            <button
              type="submit"
              disabled={addingVariant}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {addingVariant ? 'Adding…' : 'Add variant'}
            </button>
            {addVariantMsg && (
              <p className={`text-sm ${addVariantMsg.startsWith('Variant') ? 'text-green-600' : 'text-red-500'}`}>
                {addVariantMsg}
              </p>
            )}
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Inline editable variant row ─────────────────────────────────────────────

function VariantRow({
  variant,
  onUpdate,
}: {
  variant: ProductVariant;
  onUpdate: (field: string, value: string | number | boolean) => void;
}) {
  const [ean, setEan] = useState(variant.ean ?? '');
  const [label, setLabel] = useState(variant.label);
  const [price, setPrice] = useState(String(variant.priceEuroCents));
  const [active, setActive] = useState(variant.isActive);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-5 py-3 font-mono text-xs text-gray-500">{variant.sku}</td>
      <td className="px-5 py-3">
        <input
          className="border border-gray-200 rounded px-2 py-1 text-sm w-36 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={ean}
          onChange={(e) => setEan(e.target.value)}
          onBlur={() => { if (ean !== (variant.ean ?? '')) onUpdate('ean', ean); }}
          placeholder="EAN barcode"
        />
      </td>
      <td className="px-5 py-3">
        <input
          className="border border-gray-200 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => { if (label !== variant.label) onUpdate('label', label); }}
        />
      </td>
      <td className="px-5 py-3">
        <input
          type="number"
          min="0"
          className="border border-gray-200 rounded px-2 py-1 text-sm w-24 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={() => {
            const n = parseInt(price, 10);
            if (!isNaN(n) && n !== variant.priceEuroCents) onUpdate('priceEuroCents', n);
          }}
        />
        <span className="ml-2 text-xs text-gray-400">{formatPrice(parseInt(price, 10) || 0)}</span>
      </td>
      <td className="px-5 py-3 text-gray-600">{variant.stockQuantity}</td>
      <td className="px-5 py-3">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => { setActive(e.target.checked); onUpdate('isActive', e.target.checked); }}
          className="accent-blue-600"
        />
      </td>
    </tr>
  );
}
