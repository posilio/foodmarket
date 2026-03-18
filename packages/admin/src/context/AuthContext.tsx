// Admin auth context — httpOnly cookie session with in-memory access token.
// Tokens are NEVER stored in localStorage; the refresh_token cookie
// (set by the backend) provides session persistence across page loads.
// On mount we call /auth/refresh (with credentials: 'include') to re-hydrate
// the in-memory access token. isAdmin is verified before accepting the session.
'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CUSTOMER_KEY = 'foodmarket_admin_customer_v1';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface AdminCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

// ─── localStorage helpers (customer profile only — no tokens) ─────────────────

function readCustomer(): AdminCustomer | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CUSTOMER_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object' || parsed === null ||
      typeof (parsed as AdminCustomer).id !== 'string' ||
      typeof (parsed as AdminCustomer).email !== 'string'
    ) return null;
    return parsed as AdminCustomer;
  } catch { return null; }
}

function saveCustomer(customer: AdminCustomer) {
  try { localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer)); } catch { /* ignore */ }
}

function clearCustomer(): void {
  try {
    localStorage.removeItem(CUSTOMER_KEY);
    // Remove any tokens that may have been stored by an older version of the app
    localStorage.removeItem('foodmarket_admin_token_v1');
    localStorage.removeItem('foodmarket_admin_refresh_token_v1');
  } catch { /* ignore */ }
}

// ─── Context ────────────────────────────────────────────────────────────────

interface AuthContextValue {
  token: string | null;
  customer: AdminCustomer | null;
  isLoggedIn: boolean;
  /** True while the initial cookie session check is in flight on mount. */
  hydrating: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  silentRefresh: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<AdminCustomer | null>(readCustomer);
  const [hydrating, setHydrating] = useState(true);

  // On mount: restore session via the httpOnly refresh_token cookie.
  // Also validates that the restored session belongs to an admin account.
  useEffect(() => {
    fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        if (!res.ok) { clearCustomer(); setToken(null); setCustomer(null); return; }
        const body = await res.json() as { data: { token: string; customer: AdminCustomer } };
        if (!body.data.customer.isAdmin) {
          clearCustomer(); setToken(null); setCustomer(null); return;
        }
        saveCustomer(body.data.customer);
        setToken(body.data.token);
        setCustomer(body.data.customer);
      })
      .catch(() => { clearCustomer(); setToken(null); setCustomer(null); })
      .finally(() => setHydrating(false));
  }, []);

  const silentRefresh = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) { clearCustomer(); setToken(null); setCustomer(null); return null; }
      const body = await res.json() as { data: { token: string; customer: AdminCustomer } };
      if (!body.data.customer.isAdmin) {
        clearCustomer(); setToken(null); setCustomer(null); return null;
      }
      saveCustomer(body.data.customer);
      setToken(body.data.token);
      setCustomer(body.data.customer);
      return body.data.token;
    } catch {
      clearCustomer(); setToken(null); setCustomer(null);
      return null;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      credentials: 'include', // backend sets httpOnly cookies
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { message?: string }).message ?? 'Login failed');
    }
    const body = await res.json() as { data: { token: string; customer: AdminCustomer } };
    const newToken = body.data.token;

    // Verify admin flag via /auth/me before accepting the login
    const meRes = await fetch(`${API_URL}/api/v1/auth/me`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${newToken}` },
    });
    if (!meRes.ok) throw new Error('Could not verify account');
    const me = await meRes.json() as { data: AdminCustomer };
    if (!me.data.isAdmin) throw new Error('Not an admin account');

    saveCustomer(me.data);
    setToken(newToken);
    setCustomer(me.data);
  }, []);

  const logout = useCallback(() => {
    fetch(`${API_URL}/api/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include', // sends refresh_token cookie for server-side revocation
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }).catch(() => {});
    clearCustomer();
    setToken(null);
    setCustomer(null);
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, customer, isLoggedIn: !!token && !!customer, hydrating, login, logout, silentRefresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
