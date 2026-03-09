// Order confirmation page — fetches order details and payment status.
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { formatPrice } from '../../../lib/format';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface OrderLine {
  id: string;
  quantity: number;
  unitPriceEuroCents: number;
  variant: { label: string; product: { name: string } };
}

interface Order {
  id: string;
  status: string;
  totalEuroCents: number;
  createdAt: string;
  lines: OrderLine[];
}

interface Payment {
  id: string;
  status: string;
  amountEuroCents: number;
}

function PaymentBanner({
  status,
  orderId,
}: {
  status: string | null;
  orderId: string;
}) {
  if (!status) return null;

  if (status === 'PAID') {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6 text-sm">
        <span className="text-green-600 font-semibold">Payment received ✓</span>
      </div>
    );
  }
  if (status === 'PENDING') {
    return (
      <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-6 text-sm">
        <span className="text-yellow-700 font-semibold">
          Payment pending — this page will update once confirmed
        </span>
      </div>
    );
  }
  if (status === 'FAILED') {
    return (
      <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-sm">
        <span className="text-red-600 font-semibold">Payment failed</span>
        <Link
          href={`/checkout`}
          className="text-red-600 hover:underline font-medium"
        >
          Try again →
        </Link>
      </div>
    );
  }
  return null;
}

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Read ?payment=done from URL without useSearchParams (avoids Suspense requirement)
  const [paymentDone, setPaymentDone] = useState(false);

  useEffect(() => {
    setPaymentDone(
      new URLSearchParams(window.location.search).get('payment') === 'done'
    );
  }, []);

  useEffect(() => {
    if (!token) {
      const timer = setTimeout(() => {
        setError('Please sign in to view this order.');
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }

    fetch(`${API_URL}/api/v1/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Order not found');
        return r.json() as Promise<{ data: Order }>;
      })
      .then((body) => setOrder(body.data))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load order')
      )
      .finally(() => setLoading(false));
  }, [id, token]);

  // Fetch payment status when returning from Mollie
  useEffect(() => {
    if (!paymentDone || !token || !id) return;

    fetch(`${API_URL}/api/v1/payments/status/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? (r.json() as Promise<{ data: Payment | null }>) : null))
      .then((body) => {
        if (body?.data) setPayment(body.data);
      })
      .catch(() => {});
  }, [paymentDone, token, id]);

  if (loading) return <p className="text-gray-500">Loading order…</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!order) return null;

  return (
    <>
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-green-800 mb-1">
          Order confirmed!
        </h1>
        <p className="text-green-700 text-sm">
          Thank you for your order. We&apos;ll process it shortly.
        </p>
      </div>

      <PaymentBanner status={payment?.status ?? null} orderId={id} />

      <h2 className="text-lg font-semibold text-gray-800 mb-1">Order details</h2>
      <p className="text-sm text-gray-500 mb-4">
        Order ID: <span className="font-mono text-xs">{order.id}</span>
      </p>

      <ul className="space-y-3 list-none p-0 mb-6">
        {order.lines.map((line) => (
          <li
            key={line.id}
            className="flex justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm"
          >
            <span className="text-gray-800">
              {line.variant.product.name} — {line.variant.label} ×{' '}
              {line.quantity}
            </span>
            <span className="font-semibold text-gray-900">
              {formatPrice(line.unitPriceEuroCents * line.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex justify-between font-semibold border-t border-gray-200 pt-4 mb-6">
        <span>Total</span>
        <span>{formatPrice(order.totalEuroCents)}</span>
      </div>

      <Link href="/products" className="text-green-600 hover:underline text-sm">
        Continue shopping
      </Link>
    </>
  );
}
