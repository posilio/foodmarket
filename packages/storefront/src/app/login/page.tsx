// Login page — restyled for the new earthy bio-green design.
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

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

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/checkout');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
        {/* Brand */}
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
          Welcome back
        </h1>

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
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
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
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)', fontFamily: 'Jost, sans-serif', fontWeight: 300 }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
