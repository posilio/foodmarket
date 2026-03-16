// Stock import page — three-step flow: upload → preview → done.
// Supports PDF invoices (AI-parsed via Anthropic) and tab-separated UTF-16 CSV files.
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { adminApi, type ImportLine, type ImportPreviewResult } from '../../lib/api';

type Step = 'upload' | 'preview' | 'done';

export default function ImportPage() {
  const { token } = useAuth();
  const [step, setStep] = useState<Step>('upload');

  // Upload card state
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState('');

  // Preview state
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  // Confirm state
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [updatedCount, setUpdatedCount] = useState(0);

  function resetToUpload() {
    setStep('upload');
    setPdfLoading(false);
    setPdfError('');
    setCsvLoading(false);
    setCsvError('');
    setPreview(null);
    setCheckedIds(new Set());
    setConfirming(false);
    setConfirmError('');
    setUpdatedCount(0);
  }

  async function goToPreview(lines: ImportLine[]) {
    const result = await adminApi.import.preview(token!, lines);
    setPreview(result.data);
    setCheckedIds(new Set(result.data.matched.map((m) => m.variantId)));
    setStep('preview');
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setPdfLoading(true);
    setPdfError('');
    try {
      const { data } = await adminApi.import.parsePdf(token!, file);
      await goToPreview(data.lines);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Failed to parse PDF');
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setCsvLoading(true);
    setCsvError('');
    try {
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file, 'UTF-16');
      });
      const rows = text.split('\n').map((r) => r.split('\t'));
      const dataRows = rows.slice(1); // skip header
      const lines: ImportLine[] = [];
      for (const cols of dataRows) {
        if (cols.length < 13) continue;
        const ean = cols[1]?.trim().replace(/\D/g, '');
        if (!ean || ean.length < 8) continue;
        const zolltarif = cols[12]?.trim();
        if (!zolltarif) continue; // skip packaging (pallets, bags)
        const name = cols[22]?.trim() || cols[2]?.trim() || '';
        const qty = parseFloat((cols[3] ?? '0').replace(',', '.'));
        const price = parseFloat((cols[4] ?? '0').replace(',', '.'));
        if (!qty || !price) continue;
        lines.push({
          ean,
          description: name,
          quantity: Math.round(qty),
          unitPriceEuroCents: Math.round(price * 100),
        });
      }
      await goToPreview(lines);
    } catch (err) {
      setCsvError(err instanceof Error ? err.message : 'Failed to parse CSV');
    } finally {
      setCsvLoading(false);
    }
  }

  function toggleChecked(variantId: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(variantId)) {
        next.delete(variantId);
      } else {
        next.add(variantId);
      }
      return next;
    });
  }

  async function handleConfirm() {
    if (!preview) return;
    setConfirming(true);
    setConfirmError('');
    try {
      const checkedLines = preview.matched
        .filter((m) => checkedIds.has(m.variantId))
        .map((m) => ({ variantId: m.variantId, quantity: m.incomingQuantity }));
      const result = await adminApi.import.confirm(token!, checkedLines);
      setUpdatedCount(result.data.updated);
      setStep('done');
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setConfirming(false);
    }
  }

  // ── Step: upload ─────────────────────────────────────────────────────────────

  if (step === 'upload') {
    const busy = pdfLoading || csvLoading;
    return (
      <>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Stock Import</h1>
        <div className="flex flex-col sm:flex-row gap-6">

          {/* PDF card */}
          <label className={`flex-1 ${busy ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
            <div
              className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                pdfError
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {pdfLoading ? (
                <>
                  <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Reading invoice with AI…</p>
                </>
              ) : (
                <>
                  <p className="text-4xl mb-3">📄</p>
                  <p className="font-semibold text-gray-800 mb-1">PDF Invoice</p>
                  <p className="text-sm text-gray-500">Drag & drop or click to upload</p>
                  {pdfError && <p className="mt-3 text-sm text-red-600">{pdfError}</p>}
                </>
              )}
            </div>
            <input
              type="file"
              accept="application/pdf"
              className="sr-only"
              disabled={busy}
              onChange={handlePdfUpload}
            />
          </label>

          {/* CSV card */}
          <label className={`flex-1 ${busy ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
            <div
              className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                csvError
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {csvLoading ? (
                <>
                  <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Processing…</p>
                </>
              ) : (
                <>
                  <p className="text-4xl mb-3">📊</p>
                  <p className="font-semibold text-gray-800 mb-1">CSV Order File</p>
                  <p className="text-sm text-gray-500">Tab-separated, UTF-16</p>
                  {csvError && <p className="mt-3 text-sm text-red-600">{csvError}</p>}
                </>
              )}
            </div>
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              disabled={busy}
              onChange={handleCsvUpload}
            />
          </label>
        </div>
      </>
    );
  }

  // ── Step: preview ────────────────────────────────────────────────────────────

  if (step === 'preview' && preview) {
    const checkedLines = preview.matched.filter((m) => checkedIds.has(m.variantId));

    return (
      <>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Stock Import — Preview</h1>

        {/* Matched table */}
        <div className="mb-6 rounded-xl border border-green-200 overflow-hidden">
          <div className="bg-green-50 px-5 py-3 border-b border-green-200">
            <h2 className="font-semibold text-green-800">
              ✅ Matched products ({preview.matched.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 w-8">☑</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">EAN</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Supplier description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Your product</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Variant</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Current stock</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Incoming</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">New stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.matched.map((m) => {
                  const checked = checkedIds.has(m.variantId);
                  return (
                    <tr
                      key={m.variantId}
                      className={`cursor-pointer hover:bg-gray-50 ${checked ? '' : 'opacity-50'}`}
                      onClick={() => toggleChecked(m.variantId)}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleChecked(m.variantId)}
                          onClick={(e) => e.stopPropagation()}
                          className="accent-green-600"
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.ean}</td>
                      <td className="px-4 py-3 text-gray-600">{m.description}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{m.productName}</td>
                      <td className="px-4 py-3 text-gray-600">{m.variantLabel}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{m.currentStock}</td>
                      <td className="px-4 py-3 text-right text-blue-600">+{m.incomingQuantity}</td>
                      <td
                        className={`px-4 py-3 text-right font-bold ${
                          m.newStock > m.currentStock ? 'text-green-600' : 'text-gray-900'
                        }`}
                      >
                        {m.newStock}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Unmatched table */}
        {preview.unmatched.length > 0 && (
          <div className="mb-6 rounded-xl border border-amber-200 overflow-hidden">
            <div className="bg-amber-50 px-5 py-3 border-b border-amber-200">
              <h2 className="font-semibold text-amber-800">
                ⚠️ Not in catalogue ({preview.unmatched.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">EAN</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Supplier description</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.unmatched.map((u, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{u.ean || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{u.description}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{u.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="px-5 py-3 text-xs text-gray-400">
              Add the EAN to a product variant on the product edit page to match these next time.
            </p>
          </div>
        )}

        {/* Action bar */}
        {confirmError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
            {confirmError}
          </div>
        )}
        <div className="flex items-center gap-4">
          <button
            onClick={resetToUpload}
            className="px-5 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={checkedLines.length === 0 || confirming}
            className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {confirming
              ? 'Importing…'
              : `Confirm import (${checkedLines.length} product${checkedLines.length !== 1 ? 's' : ''})`}
          </button>
        </div>
      </>
    );
  }

  // ── Step: done ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-6xl mb-4">✅</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Import complete</h1>
      <p className="text-gray-500 mb-8">Stock updated for {updatedCount} variants.</p>
      <div className="flex gap-4">
        <button
          onClick={resetToUpload}
          className="px-5 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Import another file
        </button>
        <Link
          href="/products"
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
        >
          View products
        </Link>
      </div>
    </div>
  );
}
