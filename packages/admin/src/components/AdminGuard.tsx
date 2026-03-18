// AdminGuard — redirects unauthenticated / non-admin users to /login.
// Wraps all admin pages in the root layout; /login is always rendered as-is.
// Waits for hydrating to complete (cookie session check) before redirecting,
// so the admin panel does not flash a redirect on page load.
'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, customer, hydrating } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    // Wait until the mount-time cookie session check completes before redirecting.
    if (!hydrating && !isLoginPage && (!isLoggedIn || !customer?.isAdmin)) {
      router.replace('/login');
    }
  }, [isLoginPage, isLoggedIn, customer, hydrating, router]);

  if (isLoginPage) return <>{children}</>;
  // Show nothing while hydrating or while not authenticated
  if (hydrating || !isLoggedIn || !customer?.isAdmin) return null;
  return <>{children}</>;
}
