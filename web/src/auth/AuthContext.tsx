import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi, type RegisterInput } from '../api/auth.api';
import { getToken, setToken } from '../api/http';
import type { AuthResult, Session } from '../api/types';

export type AuthState = {
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setSession)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback(({ token, ...rest }: AuthResult) => {
    setToken(token);
    setSession(rest);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      loading,
      isAdmin: session?.user.role === 'admin',
      login: async (email, password) => persist(await authApi.login(email, password)),
      register: async (input) => persist(await authApi.register(input)),
      logout: () => {
        setToken(null);
        setSession(null);
      },
    }),
    [session, loading, persist],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
