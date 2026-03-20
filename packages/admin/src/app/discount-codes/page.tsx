// Admin discount codes page — list, create, and toggle discount codes.
'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminApi, type DiscountCode, type DiscountType } from '../../lib/api';
import { formatDate } from '../../lib/format';

function formatAmount(code: DiscountCode): string {
  if (code.type === 'FLAT' && code.amountCents !== null) {
    return `€${(code.amountCents / 100).toFixed(2)} off`;
  }
  if (code.type === 'PERCENTAGE' && code.percent !== null) {
    return `${code.percent}% off`;
  }
  return '—';
}

export default function DiscountCodesPage() {
  const { token } = useAuth();
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create form state
  const [formCode, setFormCode] = useState('');
  const [formType, setFormType] = useState<DiscountType>('FLAT');
  const [formAmountCents, setFormAmountCents] = useState('');
  const [formPercent, setFormPercent] = useState('');
  const [formMaxUses, setFormMaxUses] = useState('');
  const [formExpiresAt, setFormExpiresAt] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Toggle state: track which id is being toggled
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    adminApi.discountCodes
      .list(token)
      .then((body) => setCodes(body.data))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load discount codes')
      )
      .finally(() => setLoading(false));
  }, [token]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setCreateError('');
    setCreating(true);
    try {
      const amountCentsNum = formType === 'FLAT' ? parseInt(formAmountCents, 10) : undefined;
      const percentNum = formType === 'PERCENTAGE' ? parseInt(formPercent, 10) : undefined;
      const maxUsesNum = formMaxUses ? parseInt(formMaxUses, 10) : undefined;

      const result = await adminApi.discountCodes.create(token, {
        code: formCode.trim().toUpperCase(),
        type: formType,
        ...(amountCentsNum !== undefined ? { amountCents: amountCentsNum } : {}),
        ...(percentNum !== undefined ? { percent: percentNum } : {}),
        ...(maxUsesNum !== undefined ? { maxUses: maxUsesNum } : {}),
        ...(formExpiresAt ? { expiresAt: formExpiresAt } : {}),
      });
      setCodes((prev) => [result.data, ...prev]);
      // Reset form
      setFormCode('');
      setFormAmountCents('');
      setFormPercent('');
      setFormMaxUses('');
      setFormExpiresAt('');
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create discount code');
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(code: DiscountCode) {
    if (!token) return;
    setTogglingId(code.id);
    try {
      const result = await adminApi.discountCodes.setActive(token, code.id, !code.isActive);
      setCodes((prev) => prev.map((c) => (c.id === code.id ? result.data : c)));
    } catch {
      // silently ignore — row stays unchanged
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Discount codes</h1>
      </div>

      {/* Create form */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">Create new code</h2>
        <form onSubmit={(e) => void handleCreate(e)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Code
              </label>
              <input
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                required
                placeholder="SUMMER25"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Type
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as DiscountType)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="FLAT">Flat (€ amount)</option>
                <option value="PERCENTAGE">Percentage (%)</option>
              </select>
            </div>

            {formType === 'FLAT' ? (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Amount (euro cents)
                </label>
                <input
                  type="number"
                  min={1}
                  value={formAmountCents}
                  onChange={(e) => setFormAmountCents(e.target.value)}
                  required
                  placeholder="500 = €5.00"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Percent (1–100)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={formPercent}
                  onChange={(e) => setFormPercent(e.target.value)}
                  required
                  placeholder="10"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Max uses (optional)
              </label>
              <input
                type="number"
                min={1}
                value={formMaxUses}
                onChange={(e) => setFormMaxUses(e.target.value)}
                placeholder="Unlimited"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Expires at (optional)
              </label>
              <input
                type="date"
                value={formExpiresAt}
                onChange={(e) => setFormExpiresAt(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {createError && (
            <p className="text-sm text-red-600 mb-3">{createError}</p>
          )}

          <button
            type="submit"
            disabled={creating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {creating ? 'Creating…' : 'Create code'}
          </button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl px-5 py-4 text-sm bg-red-50 border border-red-200 text-red-700 mb-4">
          ⚠ {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
        </div>
      )}

      {/* Codes table */}
      {!loading && !error && (
        codes.length === 0 ? (
          <p className="text-gray-500 text-sm">No discount codes yet. Create one above.</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Discount</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Uses</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Expires</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {codes.map((code) => {
                  const isExpired =
                    code.expiresAt !== null && new Date(code.expiresAt) < new Date();
                  const isExhausted =
                    code.maxUses !== null && code.usedCount >= code.maxUses;
                  return (
                    <tr key={code.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-semibold text-gray-900">
                        {code.code}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {code.type === 'FLAT' ? 'Flat' : 'Percentage'}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {formatAmount(code)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {code.usedCount}
                        {code.maxUses !== null ? ` / ${code.maxUses}` : ''}
                        {isExhausted && (
                          <span className="ml-2 text-xs text-red-500 font-medium">exhausted</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {code.expiresAt ? (
                          <span className={isExpired ? 'text-red-500' : ''}>
                            {formatDate(code.expiresAt)}
                            {isExpired && ' (expired)'}
                          </span>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            code.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {code.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => void handleToggle(code)}
                          disabled={togglingId === code.id}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 hover:bg-gray-50"
                          style={{ borderColor: code.isActive ? '#FCA5A5' : '#BBF7D0', color: code.isActive ? '#DC2626' : '#16A34A' }}
                        >
                          {togglingId === code.id
                            ? '…'
                            : code.isActive
                            ? 'Deactivate'
                            : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </>
  );
}
