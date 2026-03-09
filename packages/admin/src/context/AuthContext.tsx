// Admin auth context — sessionStorage JWT with isAdmin verification.
'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const TOKEN_KEY = 'fw_admin_token';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface AuthContextValue {
  token: string | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (stored) setToken(stored);
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
    const body = await res.json() as { data: { token: string } };
    const newToken = body.data.token;

    // Verify admin flag
    const meRes = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${newToken}` },
    });
    if (!meRes.ok) throw new Error('Could not verify account');
    const me = await meRes.json() as { data: { isAdmin: boolean } };
    if (!me.data.isAdmin) throw new Error('Not an admin account');

    sessionStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isLoggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
