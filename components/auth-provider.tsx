"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { UserRole } from "@/lib/types";

type AuthContextValue = {
  role: UserRole;
  setRole: (role: UserRole) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "opportunity-atlas-role";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("viewer");

  useEffect(() => {
    const savedRole = window.localStorage.getItem(STORAGE_KEY);
    if (savedRole === "admin" || savedRole === "viewer") {
      setRoleState(savedRole);
    }
  }, []);

  const setRole = (nextRole: UserRole) => {
    setRoleState(nextRole);
    window.localStorage.setItem(STORAGE_KEY, nextRole);
  };

  const value = useMemo(() => ({ role, setRole }), [role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

