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

function PaymentBanner({ status, orderId }: { status: string | null; orderId: string }) {
  if (!status) return null;
  if (status === 'PAID') {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-6 text-sm">
        <span className="text-green-700 font-semibold" style={{ fontFamily: 'Jost, sans-serif' }}>
          Payment received ✓
        </span>
      </div>
    );
  }
  if (status === 'PENDING') {
    return (
      <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 mb-6 text-sm">
        <span className="text-yellow-800 font-semibold" style={{ fontFamily: 'Jost, sans-serif' }}>
          Payment pending — this page will update once confirmed
        </span>
      </div>
    );
  }
  if (status === 'FAILED') {
    return (
      <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6 text-sm">
        <span className="text-red-700 font-semibold" style={{ fontFamily: 'Jost, sans-serif' }}>
          Payment failed
        </span>
        <Link href="/checkout" className="text-red-700 hover:underline font-medium" style={{ fontFamily: 'Jost, sans-serif' }}>
          Try again →
        </Link>
      </div>
    );
  }
  return null;
}

const INVOICE_STATUSES = new Set(['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']);

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentDone, setPaymentDone] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

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

  useEffect(() => {
    if (!paymentDone || !token || !id) return;
    fetch(`${API_URL}/api/v1/payments/status/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? (r.json() as Promise<{ data: Payment | null }>) : null))
      .then((body) => { if (body?.data) setPayment(body.data); })
      .catch(() => {});
  }, [paymentDone, token, id]);

  async function handleDownloadInvoice() {
    if (!token) return;
    setDownloadingInvoice(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/orders/${id}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to download invoice');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently ignore
    } finally {
      setDownloadingInvoice(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-12 flex justify-center">
        <div
          className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div
          className="rounded-xl px-5 py-4 text-sm"
          style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontFamily: 'Jost, sans-serif' }}
        >
          ⚠ {error}
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      {/* Success banner */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{ backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-border)' }}
      >
        <h1
          className="mb-1"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '36px', color: 'var(--color-primary)' }}
        >
          Order confirmed!
        </h1>
        <p style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: '14px', color: 'var(--color-text-muted)' }}>
          Thank you for your order. We&apos;ll process it shortly.
        </p>
      </div>

      <PaymentBanner status={payment?.status ?? null} orderId={id} />

      <h2
        className="mb-1"
        style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '24px', color: 'var(--color-text)' }}
      >
        Order details
      </h2>
      <p
        className="mb-6 text-sm"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif', fontWeight: 300 }}
      >
        Order ID: <span className="font-mono text-xs">{order.id}</span>
      </p>

      <ul className="space-y-3 list-none p-0 mb-6">
        {order.lines.map((line) => (
          <li
            key={line.id}
            className="flex justify-between rounded-xl px-5 py-3 text-sm"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <span style={{ color: 'var(--color-text)', fontFamily: 'Jost, sans-serif', fontWeight: 300 }}>
              {line.variant.product.name} — {line.variant.label} × {line.quantity}
            </span>
            <span style={{ color: 'var(--color-text)', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}>
              {formatPrice(line.unitPriceEuroCents * line.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div
        className="flex justify-between pt-4 mb-8"
        style={{ borderTop: '1px solid var(--color-border)', fontFamily: 'Jost, sans-serif' }}
      >
        <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>Total</span>
        <span style={{ fontWeight: 500, fontSize: '18px', color: 'var(--color-accent-warm)' }}>
          {formatPrice(order.totalEuroCents)}
        </span>
      </div>

      {INVOICE_STATUSES.has(order.status) && (
        <div className="mb-6">
          <button
            onClick={handleDownloadInvoice}
            disabled={downloadingInvoice}
            style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              color: 'var(--color-primary)',
              background: 'none',
              border: '1px solid var(--color-primary)',
              borderRadius: '8px',
              padding: '8px 20px',
              cursor: 'pointer',
              opacity: downloadingInvoice ? 0.6 : 1,
            }}
          >
            {downloadingInvoice ? 'Downloading…' : 'Download Invoice (PDF)'}
          </button>
        </div>
      )}

      <Link
        href="/products"
        className="text-sm hover:opacity-70 transition-opacity"
        style={{ color: 'var(--color-primary)', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}
      >
        ← Continue shopping
      </Link>
    </div>
  );
}
