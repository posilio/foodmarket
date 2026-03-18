'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export function useRequireAuth(redirectTo = '/login') {
  const { isLoggedIn, hydrating, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until the mount-time cookie session check completes before redirecting.
    // Without this guard the user would be redirected on every page load while
    // the httpOnly cookie is being validated against the backend.
    if (!hydrating && !isLoggedIn) {
      router.replace(redirectTo);
    }
  }, [isLoggedIn, hydrating, redirectTo, router]);

  return { isLoggedIn, hydrating, token };
}
