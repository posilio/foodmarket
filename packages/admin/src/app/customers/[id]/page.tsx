// Admin customer detail — profile info, order history, and addresses.
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { adminApi } from '../../../lib/api';
import { formatPrice, formatDate } from '../../../lib/format';

const ORDER_STATUS_STYLES: Record<string, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800',
  PAID:       'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED:    'bg-indigo-100 text-indigo-800',
  DELIVERED:  'bg-gray-100 text-gray-700',
  CANCELLED:  'bg-red-100 text-red-700',
  REFUNDED:   'bg-orange-100 text-orange-700',
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING:    'Pending',
  PAID:       'Paid',
  PROCESSING: 'Processing',
  SHIPPED:    'Shipped',
  DELIVERED:  'Delivered',
  CANCELLED:  'Cancelled',
  REFUNDED:   'Refunded',
};

interface Address {
  id: string;
  street: string;
  houseNumber: string;
  houseNumberAddition: string | null;
  postalCode: string;
  city: string;
  country: string;
  isDefault: boolean;
}

interface Order {
  id: string;
  status: string;
  totalEuroCents: number;
  createdAt: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
  orders: Order[];
  addresses: Address[];
}

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.customers
      .get(token!, id)
      .then((body) => setCustomer(body.data as unknown as Customer))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load customer')
      )
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl px-5 py-4 text-sm bg-red-50 border border-red-200 text-red-700">
        ⚠ {error}
      </div>
    );
  }

  if (!customer) return null;

  const totalSpent = customer.orders.reduce((sum, o) => sum + o.totalEuroCents, 0);

  return (
    <>
      <Link
        href="/customers"
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block"
      >
        ← Back to customers
      </Link>

      {/* Profile header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {customer.firstName} {customer.lastName}
          </h1>
          <p className="text-sm text-gray-500">{customer.email}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {customer.isAdmin && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-800">
              Admin
            </span>
          )}
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              customer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {customer.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Profile details */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Profile</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900">{customer.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Phone</dt>
              <dd className="text-gray-900">{customer.phone ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Member since</dt>
              <dd className="text-gray-900">{formatDate(customer.createdAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Orders</dt>
              <dd className="text-gray-900 font-medium">{customer.orders.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Total spent</dt>
              <dd className="text-gray-900 font-semibold">{formatPrice(totalSpent)}</dd>
            </div>
          </dl>
        </div>

        {/* Addresses */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-4">
            Addresses{' '}
            <span className="text-gray-400 font-normal text-xs">
              ({customer.addresses.length})
            </span>
          </h2>
          {customer.addresses.length === 0 ? (
            <p className="text-sm text-gray-500">No addresses saved.</p>
          ) : (
            <ul className="space-y-3">
              {customer.addresses.map((addr) => (
                <li key={addr.id} className="text-sm">
                  <p className="text-gray-900">
                    {addr.street} {addr.houseNumber}
                    {addr.houseNumberAddition ? ` ${addr.houseNumberAddition}` : ''}
                  </p>
                  <p className="text-gray-500">
                    {addr.postalCode} {addr.city}, {addr.country}
                  </p>
                  {addr.isDefault && (
                    <span className="text-xs text-blue-600 font-medium">Default</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Order history */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <h2 className="font-semibold text-gray-800 px-5 py-4 border-b border-gray-100">
          Order history
        </h2>
        {customer.orders.length === 0 ? (
          <p className="text-sm text-gray-500 px-5 py-4">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Order ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customer.orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {order.id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {formatPrice(order.totalEuroCents)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${ORDER_STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-700'}`}
                    >
                      {ORDER_STATUS_LABELS[order.status] ?? order.status}
                    </span>
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
        )}
      </div>
    </>
  );
}
