// Admin orders list — all orders with status filter and quick links.
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, formatDate } from '../../lib/format';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

const ALL_STATUSES = [
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
] as const;

type OrderStatus = (typeof ALL_STATUSES)[number];

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800',
  PAID:       'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED:    'bg-indigo-100 text-indigo-800',
  DELIVERED:  'bg-gray-100 text-gray-700',
  CANCELLED:  'bg-red-100 text-red-700',
  REFUNDED:   'bg-orange-100 text-orange-700',
};

interface Order {
  id: string;
  status: OrderStatus;
  totalEuroCents: number;
  createdAt: string;
  customer: { firstName: string; lastName: string; email: string };
}

export default function AdminOrdersPage() {
  const { token, isLoggedIn } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
      return;
    }
    const url =
      filter === 'ALL'
        ? `${API_URL}/api/v1/admin/orders`
        : `${API_URL}/api/v1/admin/orders?status=${filter}`;
    setLoading(true);
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ data: Order[] }>;
      })
      .then((body) => setOrders(body.data))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load')
      )
      .finally(() => setLoading(false));
  }, [isLoggedIn, token, filter, router]);

  if (!isLoggedIn) return null;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.currentTarget.value as OrderStatus | 'ALL')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {loading && <p className="text-gray-500 text-sm">Loading…</p>}

      {!loading && orders.length === 0 && (
        <p className="text-gray-500 text-sm">No orders found.</p>
      )}

      {!loading && orders.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Order
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Customer
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Total
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Date
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {order.id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{order.customer.email}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {formatPrice(order.totalEuroCents)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-700'}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-blue-600 hover:underline text-xs font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
