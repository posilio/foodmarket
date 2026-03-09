'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export function NavAuthLink() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? (
    <Link
      href="/account"
      className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
    >
      Account
    </Link>
  ) : (
    <Link
      href="/login"
      className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
    >
      Login
    </Link>
  );
}
