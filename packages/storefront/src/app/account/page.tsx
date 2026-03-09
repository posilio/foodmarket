// Account page — profile info, order history, and logout.
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useRequireAuth } from '../../lib/useRequireAuth';
import { formatPrice } from '../../lib/format';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface Order {
  id: string;
  status: string;
  totalEuroCents: number;
  createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800',
  PAID:       'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-50 text-blue-700',
  SHIPPED:    'bg-blue-100 text-blue-800',
  DELIVERED:  'bg-gray-100 text-gray-700',
  CANCELLED:  'bg-red-100 text-red-700',
  REFUNDED:   'bg-orange-100 text-orange-700',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

export default function AccountPage() {
  const { isLoggedIn, token } = useRequireAuth();
  const { customer, logout } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/v1/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load orders');
        return r.json() as Promise<{ data: Order[] }>;
      })
      .then((body) => setOrders(body.data))
      .catch((err: unknown) =>
        setOrdersError(err instanceof Error ? err.message : 'Failed to load orders')
      )
      .finally(() => setOrdersLoading(false));
  }, [token]);

  function handleLogout() {
    logout();
    router.push('/');
  }

  // Show nothing while auth is being checked (prevents flash before redirect)
  if (!isLoggedIn || !customer) return null;

  return (
    <>
      {/* Profile section */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hello, {customer.firstName}!
          </h1>
          <p className="text-gray-500 text-sm mt-1">{customer.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          Log out
        </button>
      </div>

      {/* Orders section */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Your orders</h2>

      {ordersLoading && (
        <p className="text-gray-400 text-sm">Loading orders…</p>
      )}

      {ordersError && (
        <p className="text-red-500 text-sm">{ordersError}</p>
      )}

      {!ordersLoading && !ordersError && orders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-3">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/products"
            className="text-green-600 hover:underline text-sm font-medium"
          >
            Browse products →
          </Link>
        </div>
      )}

      {orders.length > 0 && (
        <ul className="space-y-3 list-none p-0">
          {[...orders]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((order) => (
              <li
                key={order.id}
                className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-2 py-1">
                    {order.id.slice(0, 8)}
                  </span>
                  <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[order.status] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900">
                    {formatPrice(order.totalEuroCents)}
                  </span>
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-sm text-green-600 hover:underline font-medium"
                  >
                    View details →
                  </Link>
                </div>
              </li>
            ))}
        </ul>
      )}
    </>
  );
}
