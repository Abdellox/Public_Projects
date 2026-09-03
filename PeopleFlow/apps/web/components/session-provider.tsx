"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";

export interface Me {
  user: { id: string; email: string; name: string; avatarUrl?: string | null };
  organization: { id: string; name: string; slug: string };
  role: { name: string };
  isOwner: boolean;
  permissions: string[];
  employeeId: string | null;
}

interface SessionValue {
  me: Me | null;
  loading: boolean;
  refresh: () => Promise<void>;
  can: (permission: string) => boolean;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionValue>({
  me: null,
  loading: true,
  refresh: async () => {},
  can: () => false,
  logout: async () => {},
});

export function useSession(): SessionValue {
  return useContext(SessionContext);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api<Me>("/me");
      setMe(data);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const can = useCallback(
    (permission: string) => {
      if (!me) return false;
      return me.permissions.includes("*") || me.permissions.includes(permission);
    },
    [me],
  );

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    setMe(null);
    window.location.href = "/login";
  }, []);

  return (
    <SessionContext.Provider value={{ me, loading, refresh, can, logout }}>{children}</SessionContext.Provider>
  );
}
