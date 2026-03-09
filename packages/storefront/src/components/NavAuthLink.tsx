'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export function NavAuthLink() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? (
    <Link
      href="/account"
      className="text-sm flex items-center gap-1.5 transition-colors"
      style={{ color: 'var(--color-text)', fontFamily: 'Jost, sans-serif' }}
    >
      <span>👤</span>
      <span className="hidden sm:inline">Account</span>
    </Link>
  ) : (
    <Link
      href="/login"
      className="text-sm transition-colors hover:opacity-70"
      style={{ color: 'var(--color-text)', fontFamily: 'Jost, sans-serif' }}
    >
      Sign in
    </Link>
  );
}
