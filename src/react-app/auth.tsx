import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type AuthUser = {
  email: string;
  name?: string;
  picture?: string;
  approved: boolean;
  approvedAt?: string | null;
  unlimited: boolean;
  bookLimit: number | null;
  booksUsed: number;
  booksRemaining: number | null;
  credits: number;
};

type AuthContextValue = {
  user: AuthUser | null;
  isPending: boolean;
  googleClientId: string | null;
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  loginGoogle: (credential: string) => Promise<void>;
  refetch: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    headers: init?.body ? { 'Content-Type': 'application/json', ...init.headers } : init?.headers,
    ...init,
  });
  const text = await response.text();
  let data: any = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = { error: text.slice(0, 160) }; }
  }
  if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
  return data as T;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isPending, setIsPending] = useState(true);
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      const current = await request<AuthUser>('/api/users/me');
      setUser(current);
      return current;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    Promise.all([
      refetch(),
      request<{ googleClientId: string | null }>('/api/auth/config')
        .then((config) => setGoogleClientId(config.googleClientId))
        .catch(() => setGoogleClientId(null)),
    ]).finally(() => setIsPending(false));
  }, [refetch]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isPending,
    googleClientId,
    sendOTP: async (email) => {
      await request('/api/send-otp', { method: 'POST', body: JSON.stringify({ email }) });
    },
    verifyOTP: async (email, otp) => {
      await request('/api/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) });
      await refetch();
    },
    loginGoogle: async (credential) => {
      const result = await request<{ user: AuthUser }>('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential }),
      });
      setUser(result.user);
    },
    refetch,
    logout: async () => {
      await request('/api/logout');
      setUser(null);
    },
  }), [googleClientId, isPending, refetch, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
