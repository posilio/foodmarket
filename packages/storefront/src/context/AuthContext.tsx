// Auth context — httpOnly cookie session with in-memory access token.
// Tokens are NEVER stored in localStorage; the refresh_token cookie
// (set by the backend) provides session persistence across page loads.
// On mount we call /auth/refresh (with credentials: 'include') to re-hydrate
// the in-memory access token from the httpOnly cookie session.
'use client';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

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

// ─── localStorage helpers (customer profile only — no tokens) ─────────────────

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

function saveCustomer(customer: AuthCustomer) {
  try { localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer)); } catch { /* ignore */ }
}

function clearCustomer(): void {
  try {
    localStorage.removeItem(CUSTOMER_KEY);
    // Remove any tokens that may have been stored by an older version of the app
    localStorage.removeItem('foodmarket_token_v1');
    localStorage.removeItem('foodmarket_refresh_token_v1');
  } catch { /* ignore */ }
}

// ─── Context value ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  customer: AuthCustomer | null;
  token: string | null;
  isLoggedIn: boolean;
  /** True while the initial cookie session check is in flight on mount. */
  hydrating: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Silently refresh the access token via the httpOnly refresh_token cookie. */
  silentRefresh: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // token is in-memory only — never written to localStorage
  const [token, setToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<AuthCustomer | null>(readCustomer);
  // hydrating is true while the mount-time /auth/refresh call is in flight
  const [hydrating, setHydrating] = useState(true);

  // On mount: restore session via the httpOnly refresh_token cookie.
  // The access token is returned in the response body and stored in memory.
  useEffect(() => {
    fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        if (!res.ok) {
          clearCustomer();
          setToken(null);
          setCustomer(null);
          return;
        }
        const body = await res.json() as { data: { token: string; customer: AuthCustomer } };
        saveCustomer(body.data.customer);
        setToken(body.data.token);
        setCustomer(body.data.customer);
      })
      .catch(() => {
        clearCustomer();
        setToken(null);
        setCustomer(null);
      })
      .finally(() => setHydrating(false));
  }, []);

  const silentRefresh = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        clearCustomer();
        setToken(null);
        setCustomer(null);
        return null;
      }
      const body = await res.json() as { data: { token: string; customer: AuthCustomer } };
      saveCustomer(body.data.customer);
      setToken(body.data.token);
      setCustomer(body.data.customer);
      return body.data.token;
    } catch {
      clearCustomer();
      setToken(null);
      setCustomer(null);
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
    const body = await res.json() as { data: { token: string; customer: AuthCustomer } };
    saveCustomer(body.data.customer);
    setToken(body.data.token);
    setCustomer(body.data.customer);
  }, []);

  const register = useCallback(
    async (firstName: string, lastName: string, email: string, password: string) => {
      const res = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        credentials: 'include', // backend sets httpOnly cookies
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? 'Registration failed');
      }
      const body = await res.json() as { data: { token: string; customer: AuthCustomer } };
      saveCustomer(body.data.customer);
      setToken(body.data.token);
      setCustomer(body.data.customer);
    },
    []
  );

  const logout = useCallback(async () => {
    // Best-effort server-side cookie clearing and refresh token revocation
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
    <AuthContext.Provider
      value={{
        customer,
        token,
        isLoggedIn: !!token && !!customer,
        hydrating,
        login,
        register,
        logout,
        silentRefresh,
      }}
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
