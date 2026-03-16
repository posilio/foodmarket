// Admin order detail — full order info, event timeline, and status update.
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { adminApi } from '../../../lib/api';
import { formatPrice, formatDate } from '../../../lib/format';

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

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING:    'Pending',
  PAID:       'Paid',
  PROCESSING: 'Processing',
  SHIPPED:    'Shipped',
  DELIVERED:  'Delivered',
  CANCELLED:  'Cancelled',
  REFUNDED:   'Refunded',
};

const EVENT_LABELS: Record<string, string> = {
  ORDER_PLACED:      'Order placed',
  STATUS_UPDATED:    'Status updated',
  PAYMENT_RECEIVED:  'Payment received',
  PAYMENT_FAILED:    'Payment failed',
  PAYMENT_WEBHOOK:   'Payment webhook received',
  ORDER_CANCELLED:   'Order cancelled',
  ORDER_REFUNDED:    'Order refunded',
};

function humaniseEvent(eventType: string): string {
  return (
    EVENT_LABELS[eventType] ??
    eventType
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

interface OrderLine {
  id: string;
  quantity: number;
  unitPriceEuroCents: number;
  variant: { label: string; product: { name: string } };
}

interface OrderEvent {
  id: string;
  eventType: string;
  fromStatus: string | null;
  toStatus: string | null;
  note: string | null;
  createdAt: string;
}

interface ShippingAddress {
  street: string;
  houseNumber: string;
  houseNumberAddition: string | null;
  postalCode: string;
  city: string;
  country: string;
}

interface Order {
  id: string;
  status: OrderStatus;
  totalEuroCents: number;
  createdAt: string;
  customer: { firstName: string; lastName: string; email: string };
  shippingAddress: ShippingAddress;
  lines: OrderLine[];
  events: OrderEvent[];
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newStatus, setNewStatus] = useState<OrderStatus>('PENDING');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  useEffect(() => {
    adminApi.orders
      .get(token!, id)
      .then((body) => {
        setOrder(body.data as unknown as Order);
        setNewStatus(body.data.status as OrderStatus);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load order')
      )
      .finally(() => setLoading(false));
  }, [id, token]);

  async function handleStatusUpdate() {
    if (!order) return;
    setUpdating(true);
    setUpdateMsg('');
    try {
      const body = await adminApi.orders.updateStatus(token!, order.id, newStatus);
      setOrder(body.data as unknown as Order);
      setUpdateMsg('Status updated successfully.');
    } catch (err) {
      setUpdateMsg(
        err instanceof Error ? err.message : 'Failed to update status'
      );
    } finally {
      setUpdating(false);
    }
  }

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

  if (!order) return null;

  const addr = order.shippingAddress;

  return (
    <>
      <Link
        href="/orders"
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block"
      >
        ← Back to orders
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Order{' '}
          <span className="font-mono text-lg">{order.id.slice(0, 8)}…</span>
        </h1>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-700'}`}
        >
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Customer */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Customer</h2>
          <p className="text-sm text-gray-900 font-medium">
            {order.customer.firstName} {order.customer.lastName}
          </p>
          <p className="text-sm text-gray-500">{order.customer.email}</p>
        </div>

        {/* Shipping address */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Shipping address</h2>
          <p className="text-sm text-gray-900">
            {addr.street} {addr.houseNumber}
            {addr.houseNumberAddition ? ` ${addr.houseNumberAddition}` : ''}
          </p>
          <p className="text-sm text-gray-900">
            {addr.postalCode} {addr.city}
          </p>
          <p className="text-sm text-gray-500">{addr.country}</p>
        </div>
      </div>

      {/* Order lines */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <h2 className="font-semibold text-gray-800 px-5 py-4 border-b border-gray-100">
          Items
        </h2>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100">
            {order.lines.map((line) => (
              <tr key={line.id}>
                <td className="px-5 py-3 text-gray-900">
                  {line.variant.product.name} — {line.variant.label}
                </td>
                <td className="px-5 py-3 text-gray-500 text-center">
                  × {line.quantity}
                </td>
                <td className="px-5 py-3 text-gray-900 text-right font-medium">
                  {formatPrice(line.unitPriceEuroCents * line.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-gray-200 bg-gray-50">
            <tr>
              <td colSpan={2} className="px-5 py-3 font-semibold text-gray-800">
                Total
              </td>
              <td className="px-5 py-3 font-bold text-gray-900 text-right">
                {formatPrice(order.totalEuroCents)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Status update */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Update status</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={newStatus}
            onChange={(e) =>
              setNewStatus(e.currentTarget.value as OrderStatus)
            }
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <button
            onClick={handleStatusUpdate}
            disabled={updating || newStatus === order.status}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {updating ? 'Saving…' : 'Update'}
          </button>
          {updateMsg && (
            <p className="text-sm text-gray-600">{updateMsg}</p>
          )}
        </div>
      </div>

      {/* Event timeline */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Timeline</h2>
        <ol className="space-y-3">
          {order.events.map((ev) => (
            <li key={ev.id} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">{humaniseEvent(ev.eventType)}</p>
                {ev.note && (
                  <p className="text-gray-500 text-xs">{ev.note}</p>
                )}
                <p className="text-gray-400 text-xs">
                  {formatDate(ev.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
