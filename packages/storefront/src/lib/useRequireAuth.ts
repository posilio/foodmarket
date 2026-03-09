'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export function useRequireAuth(redirectTo = '/login') {
  const { isLoggedIn, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Short delay so AuthContext can rehydrate from sessionStorage before redirecting
    const timer = setTimeout(() => {
      if (!isLoggedIn) router.replace(redirectTo);
    }, 300);
    return () => clearTimeout(timer);
  }, [isLoggedIn, redirectTo, router]);

  return { isLoggedIn, token };
}
