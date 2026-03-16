// AdminGuard — redirects unauthenticated / non-admin users to /login.
// Wraps all admin pages in the root layout; /login is always rendered as-is.
'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, customer } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!isLoginPage && (!isLoggedIn || !customer?.isAdmin)) {
      router.replace('/login');
    }
  }, [isLoginPage, isLoggedIn, customer, router]);

  if (isLoginPage) return <>{children}</>;
  if (!isLoggedIn || !customer?.isAdmin) return null;
  return <>{children}</>;
}
