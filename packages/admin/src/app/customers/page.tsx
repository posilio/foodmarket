// Admin customers page — browse all customer accounts with order stats and load-more.
'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { adminApi, type CustomerSummary } from '../../lib/api';
import { formatPrice, formatDate } from '../../lib/format';

export default function AdminCustomersPage() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchCustomers = useCallback(
    async (cursor?: string, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const result = await adminApi.customers.list(token!, cursor);
        setCustomers((prev) => (append ? [...prev, ...result.data] : result.data));
        setNextCursor(result.nextCursor);
        setTotal(result.total);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load customers');
      } finally {
        if (append) setLoadingMore(false);
        else setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  const filtered = search.trim()
    ? customers.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.email.toLowerCase().includes(q) ||
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q)
        );
      })
    : customers;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Customers{total > 0 && <span className="ml-2 text-gray-400 font-normal text-lg">({total})</span>}
        </h1>
      </div>

      {error && (
        <div className="rounded-xl px-5 py-4 text-sm bg-red-50 border border-red-200 text-red-700 mb-4">
          ⚠ {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-gray-500 text-sm">
              {search ? 'No customers match your search.' : 'No customers yet.'}
            </p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Orders</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Total spent</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {c.orderCount}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-semibold">
                        {formatPrice(c.totalSpentEuroCents)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            c.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/customers/${c.id}`}
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

          {nextCursor && !search && (
            <div className="mt-4 text-center">
              <button
                onClick={() => void fetchCustomers(nextCursor, true)}
                disabled={loadingMore}
                className="px-6 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
