// Auth context — sessionStorage-based JWT auth state shared across the storefront.
'use client';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

const TOKEN_KEY = 'foodwebshop_token';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface AuthCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
}

interface AuthContextValue {
  customer: AuthCustomer | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<AuthCustomer | null>(null);

  // Rehydrate from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (!stored) return;
    setToken(stored);
    fetch(`${API_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${stored}` },
    })
      .then((r) => (r.ok ? (r.json() as Promise<{ data: AuthCustomer }>) : null))
      .then((body) => {
        if (body?.data) setCustomer(body.data);
        else {
          // Token invalid/expired — clear it
          sessionStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
      })
      .catch(() => {});
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { message?: string }).message ?? 'Login failed');
    }
    const body = await res.json() as { data: { token: string; customer: AuthCustomer } };
    const { token: newToken, customer: newCustomer } = body.data;
    sessionStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setCustomer(newCustomer);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setCustomer(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ customer, token, isLoggedIn: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
