"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { apiFetch } from "@/lib/api-client";
import type { CurrentUser, UserRole } from "@/lib/types";

type AuthContextValue = {
  role: UserRole;
  user: CurrentUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const response = await apiFetch<CurrentUser>("/api/auth/me");
    setUser(response.data.role === "viewer" && response.data.id === "anonymous" ? null : response.data);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await apiFetch<CurrentUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await apiFetch<{ success: boolean }>("/api/auth/logout", {
      method: "POST"
    });
    setUser(null);
  }, []);

  useEffect(() => {
    refresh()
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [refresh]);

  const value = useMemo(
    () => ({
      role: user?.role ?? "viewer",
      user,
      loading,
      login,
      logout,
      refresh
    }),
    [loading, login, logout, refresh, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
