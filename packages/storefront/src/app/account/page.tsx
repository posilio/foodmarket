// Account page — restyled profile + order history.
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useRequireAuth } from '../../lib/useRequireAuth';
import { formatPrice } from '../../lib/format';
import { deleteMyAccount } from '../../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface Order {
  id: string;
  status: string;
  totalEuroCents: number;
  createdAt: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING:    { bg: '#FFFBEB', color: '#92400E' },
  PAID:       { bg: 'var(--color-primary-light)', color: 'var(--color-primary)' },
  PROCESSING: { bg: '#EFF6FF', color: '#1D4ED8' },
  SHIPPED:    { bg: '#EFF6FF', color: '#1E40AF' },
  DELIVERED:  { bg: '#F9FAFB', color: '#374151' },
  CANCELLED:  { bg: '#FEF2F2', color: '#DC2626' },
  REFUNDED:   { bg: '#FFF7ED', color: '#C2410C' },
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/v1/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error('Failed to load orders'); return r.json() as Promise<{ data: Order[] }>; })
      .then(body => setOrders(body.data))
      .catch((err: unknown) => setOrdersError(err instanceof Error ? err.message : 'Failed to load orders'))
      .finally(() => setOrdersLoading(false));
  }, [token]);

  function handleLogout() { logout(); router.push('/'); }

  async function handleDeleteAccount() {
    if (!token) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteMyAccount(token);
      logout();
      router.push('/');
    } catch {
      setDeleteError('Something went wrong. Please try again.');
      setDeleting(false);
    }
  }

  if (!isLoggedIn || !customer) return null;

  const sorted = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Profile card */}
      <div
        className="rounded-2xl p-6 mb-10 flex items-start justify-between"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 600,
              fontSize: '32px',
              color: 'var(--color-text)',
            }}
          >
            Hello, {customer.firstName}!
          </h1>
          <p
            className="mt-1"
            style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: '14px', color: 'var(--color-text-muted)' }}
          >
            {customer.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm px-4 py-1.5 rounded-full border transition-colors hover:opacity-80"
          style={{
            fontFamily: 'Jost, sans-serif',
            color: 'var(--color-primary)',
            borderColor: 'var(--color-border)',
            backgroundColor: 'transparent',
            cursor: 'pointer',
          }}
        >
          Log out
        </button>
      </div>

      {/* Orders */}
      <h2
        className="mb-5"
        style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '26px', color: 'var(--color-text)' }}
      >
        Your orders
      </h2>

      {ordersLoading && (
        <div className="flex justify-center py-10">
          <div
            className="w-6 h-6 rounded-full border-2 animate-spin"
            style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }}
          />
        </div>
      )}
      {ordersError && (
        <div
          className="rounded-xl px-5 py-4 text-sm"
          style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontFamily: 'Jost, sans-serif' }}
        >
          ⚠ {ordersError}
        </div>
      )}

      {!ordersLoading && !ordersError && sorted.length === 0 && (
        <div
          className="rounded-2xl py-12 text-center"
          style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <p className="mb-3" style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif', fontWeight: 300 }}>
            You haven&apos;t placed any orders yet.
          </p>
          <Link
            href="/products"
            className="text-sm"
            style={{ color: 'var(--color-primary)', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}
          >
            Browse products →
          </Link>
        </div>
      )}

      {sorted.length > 0 && (
        <ul className="space-y-3 list-none p-0">
          {sorted.map(order => {
            const s = STATUS_STYLE[order.status] ?? { bg: '#F9FAFB', color: '#374151' };
            return (
              <li
                key={order.id}
                className="rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <span
                    className="font-mono text-xs px-2 py-1 rounded"
                    style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                  >
                    {order.id.slice(0, 8)}
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif', fontWeight: 300 }}
                  >
                    {formatDate(order.createdAt)}
                  </span>
                  <span
                    className="text-xs px-3 py-0.5 rounded-full"
                    style={{ backgroundColor: s.bg, color: s.color, fontFamily: 'Jost, sans-serif', fontWeight: 500 }}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span
                    style={{ fontFamily: 'Jost, sans-serif', fontWeight: 500, color: 'var(--color-accent-warm)' }}
                  >
                    {formatPrice(order.totalEuroCents)}
                  </span>
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-sm"
                    style={{ color: 'var(--color-primary)', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}
                  >
                    View details →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {/* Delete account section */}
      <div
        className="mt-16 rounded-2xl p-6"
        style={{ border: '1px solid #FECACA', backgroundColor: '#FFF5F5' }}
      >
        <h2
          className="mb-2"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '22px', color: '#B91C1C' }}
        >
          Delete my account
        </h2>
        <p
          className="mb-4 text-sm"
          style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, color: '#374151' }}
        >
          This will permanently anonymise your account. Your order history is retained for legal compliance but will no longer be linked to your personal data.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="text-sm px-5 py-2 rounded-full border transition-colors hover:opacity-80"
          style={{ fontFamily: 'Jost, sans-serif', fontWeight: 500, color: '#B91C1C', borderColor: '#FECACA', backgroundColor: 'transparent', cursor: 'pointer' }}
        >
          Delete my account
        </button>
      </div>

      {/* Confirmation modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-8"
            style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)' }}
          >
            <h3
              className="mb-3"
              style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '24px', color: '#B91C1C' }}
            >
              Are you sure?
            </h3>
            <p
              className="mb-5 text-sm"
              style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, color: '#374151' }}
            >
              Type <strong>DELETE</strong> to confirm. This action cannot be undone.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full px-4 py-2 rounded-xl text-sm mb-4"
              style={{ border: '1px solid var(--color-border)', fontFamily: 'Jost, sans-serif', outline: 'none' }}
            />
            {deleteError && (
              <p className="mb-3 text-sm" style={{ color: '#B91C1C', fontFamily: 'Jost, sans-serif' }}>{deleteError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); setDeleteError(''); }}
                disabled={deleting}
                className="text-sm px-5 py-2 rounded-full border"
                style={{ fontFamily: 'Jost, sans-serif', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)', backgroundColor: 'transparent', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE' || deleting}
                className="text-sm px-5 py-2 rounded-full transition-opacity"
                style={{
                  fontFamily: 'Jost, sans-serif',
                  fontWeight: 500,
                  color: '#fff',
                  backgroundColor: deleteConfirm === 'DELETE' && !deleting ? '#B91C1C' : '#FCA5A5',
                  cursor: deleteConfirm === 'DELETE' && !deleting ? 'pointer' : 'not-allowed',
                  border: 'none',
                }}
              >
                {deleting ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
