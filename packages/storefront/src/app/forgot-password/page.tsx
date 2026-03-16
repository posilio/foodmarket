'use client';
import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '../../lib/api';

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await forgotPassword(email.trim().toLowerCase());
    setLoading(false);
    setSubmitted(true);
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
          className="text-center mb-2"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: '22px', color: 'var(--color-text)' }}
        >
          Reset your password
        </h1>

        {submitted ? (
          <div className="mt-6 space-y-4 text-center">
            <p style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: '14px', color: 'var(--color-text-muted)' }}>
              If an account exists for <strong style={{ color: 'var(--color-text)', fontWeight: 500 }}>{email}</strong>, we&apos;ve sent a reset link. Check your inbox.
            </p>
            <Link
              href="/login"
              style={{ display: 'inline-block', color: 'var(--color-primary)', fontFamily: 'Jost, sans-serif', fontSize: '14px', fontWeight: 500 }}
            >
              ← Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <p
              className="text-center mb-8"
              style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: '14px', color: 'var(--color-text-muted)' }}
            >
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

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
                {loading ? 'Sending…' : 'Send reset link'}
              </button>

              <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif', fontWeight: 300 }}>
                <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                  ← Back to sign in
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
