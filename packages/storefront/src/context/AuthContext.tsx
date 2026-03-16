// Auth context — localStorage-persisted JWT auth state shared across the storefront.
// Access tokens expire in 15m; a stored refresh token is used to silently renew them.
'use client';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

const TOKEN_KEY = 'foodmarket_token_v1';
const REFRESH_KEY = 'foodmarket_refresh_token_v1';
const CUSTOMER_KEY = 'foodmarket_customer_v1';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface AuthCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isAdmin: boolean;
}

// ─── localStorage helpers ──────────────────────────────────────────────────────

function readToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

function readRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(REFRESH_KEY); } catch { return null; }
}

function readCustomer(): AuthCustomer | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CUSTOMER_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object' || parsed === null ||
      typeof (parsed as AuthCustomer).id !== 'string' ||
      typeof (parsed as AuthCustomer).email !== 'string'
    ) return null;
    return parsed as AuthCustomer;
  } catch { return null; }
}

function saveAuth(token: string, refreshToken: string, customer: AuthCustomer) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
  } catch { /* ignore */ }
}

function clearAuth(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(CUSTOMER_KEY);
  } catch { /* ignore */ }
}

// ─── Context value ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  customer: AuthCustomer | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Silently refresh the access token. Returns the new token or null on failure. */
  silentRefresh: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(readToken);
  const [customer, setCustomer] = useState<AuthCustomer | null>(readCustomer);

  // On mount: check JWT expiry; if expired, attempt silent refresh
  useEffect(() => {
    const storedToken = readToken();
    if (!storedToken) return;
    try {
      const payload = JSON.parse(atob(storedToken.split('.')[1])) as { exp?: number };
      if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) {
        // Token expired — try silent refresh, then clear if it fails
        const rt = readRefreshToken();
        if (!rt) { clearAuth(); setToken(null); setCustomer(null); return; }
        fetch(`${API_URL}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rt }),
        }).then(async (res) => {
          if (!res.ok) { clearAuth(); setToken(null); setCustomer(null); return; }
          const body = await res.json() as { data: { token: string; refreshToken: string; customer: AuthCustomer } };
          saveAuth(body.data.token, body.data.refreshToken, body.data.customer);
          setToken(body.data.token);
          setCustomer(body.data.customer);
        }).catch(() => { clearAuth(); setToken(null); setCustomer(null); });
      }
    } catch {
      clearAuth(); setToken(null); setCustomer(null);
    }
  }, []);

  const silentRefresh = useCallback(async (): Promise<string | null> => {
    const rt = readRefreshToken();
    if (!rt) return null;
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (!res.ok) { clearAuth(); setToken(null); setCustomer(null); return null; }
      const body = await res.json() as { data: { token: string; refreshToken: string; customer: AuthCustomer } };
      saveAuth(body.data.token, body.data.refreshToken, body.data.customer);
      setToken(body.data.token);
      setCustomer(body.data.customer);
      return body.data.token;
    } catch {
      clearAuth(); setToken(null); setCustomer(null);
      return null;
    }
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
    const body = await res.json() as { data: { token: string; refreshToken: string; customer: AuthCustomer } };
    saveAuth(body.data.token, body.data.refreshToken, body.data.customer);
    setToken(body.data.token);
    setCustomer(body.data.customer);
  }, []);

  const register = useCallback(
    async (firstName: string, lastName: string, email: string, password: string) => {
      const res = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? 'Registration failed');
      }
      const body = await res.json() as { data: { token: string; refreshToken: string; customer: AuthCustomer } };
      saveAuth(body.data.token, body.data.refreshToken, body.data.customer);
      setToken(body.data.token);
      setCustomer(body.data.customer);
    },
    []
  );

  const logout = useCallback(async () => {
    const rt = readRefreshToken();
    const currentToken = readToken();
    // Best-effort server-side revocation
    if (rt && currentToken) {
      fetch(`${API_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentToken}` },
        body: JSON.stringify({ refreshToken: rt }),
      }).catch(() => {});
    }
    clearAuth();
    setToken(null);
    setCustomer(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ customer, token, isLoggedIn: !!token && !!customer, login, register, logout, silentRefresh }}
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
