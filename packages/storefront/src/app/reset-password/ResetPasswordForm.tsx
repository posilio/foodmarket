'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { resetPassword } from '../../lib/api';

const inputStyle = {
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  padding: '12px 16px',
  fontSize: '14px',
  fontFamily: 'Jost, sans-serif',
  width: '100%',
  backgroundColor: '#fff',
  color: 'var(--color-text)',
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontFamily: 'Jost, sans-serif',
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: 'var(--color-text-muted)',
  marginBottom: '6px',
};

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-20 px-4">
        <div
          className="rounded-2xl p-8 text-center"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
        >
          <p
            className="mb-2"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '28px', color: 'var(--color-primary)' }}
          >
            FoodMarket
          </p>
          <p style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            This reset link is invalid or has expired.
          </p>
          <Link
            href="/forgot-password"
            style={{ color: 'var(--color-primary)', fontFamily: 'Jost, sans-serif', fontSize: '14px', fontWeight: 500 }}
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      router.push('/login?reset=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <div
        className="rounded-2xl p-8"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
      >
        <p
          className="text-center mb-2"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '28px', color: 'var(--color-primary)' }}
        >
          FoodMarket
        </p>
        <h1
          className="text-center mb-8"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '22px', color: 'var(--color-text)' }}
        >
          Choose a new password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label style={labelStyle}>New password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500" style={{ fontFamily: 'Jost, sans-serif' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              fontFamily: 'Jost, sans-serif',
              fontWeight: 500,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
