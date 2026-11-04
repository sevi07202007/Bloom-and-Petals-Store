import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi, type RegisterInput } from "../api/auth";
import type { User } from "../api/types";
import { tokenStorage } from "./tokenStorage";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // On boot, if we have a refresh token, try to restore the session.
  useEffect(() => {
    if (!tokenStorage.getRefresh()) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await authApi.login(email, password);
      tokenStorage.setAccess(tokens.access);
      tokenStorage.setRefresh(tokens.refresh);
      setUser(await authApi.me());
    },
    [],
  );

  const register = useCallback(async (input: RegisterInput) => {
    const data = await authApi.register(input);
    tokenStorage.setAccess(data.access);
    tokenStorage.setRefresh(data.refresh);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
