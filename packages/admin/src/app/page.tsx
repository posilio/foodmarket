// Admin dashboard homepage — quick links and low stock alerts.
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { adminApi, type LowStockVariant } from '../lib/api';

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [lowStock, setLowStock] = useState<LowStockVariant[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    void adminApi.products.lowStock(token).then((res) => {
      setLowStockCount(res.count);
      setLowStock(res.data.slice(0, 5));
    }).catch(() => {
      // Non-critical — silently ignore if the endpoint fails
    });
  }, [token]);

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-6">Welcome to the FoodWebshop admin.</p>

      {lowStockCount > 0 && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4">
          <p className="font-semibold text-amber-800 mb-3">
            ⚠️ {lowStockCount} variant{lowStockCount !== 1 ? 's' : ''} are low on stock
            {' '}
            <Link href="/products" className="underline text-amber-700 hover:text-amber-900 text-sm font-normal ml-1">
              View products →
            </Link>
          </p>
          <ul className="space-y-1">
            {lowStock.map((v) => (
              <li key={v.id} className="flex items-center gap-3 text-sm">
                <span className="text-amber-700 font-medium">{v.product.name}</span>
                <span className="text-gray-500">{v.label}</span>
                <span className="text-red-600 font-semibold">{v.stockQuantity} left</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
        <Link
          href="/orders"
          className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-sm transition-all"
        >
          <p className="text-2xl mb-2">📦</p>
          <p className="font-semibold text-gray-900">Manage Orders</p>
          <p className="text-sm text-gray-500 mt-1">
            View, filter, and update order statuses
          </p>
        </Link>
        <Link
          href="/products"
          className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-sm transition-all"
        >
          <p className="text-2xl mb-2">🥦</p>
          <p className="font-semibold text-gray-900">Manage Products</p>
          <p className="text-sm text-gray-500 mt-1">
            View products and update stock levels
          </p>
        </Link>
      </div>
    </>
  );
}
