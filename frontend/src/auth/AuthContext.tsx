import { createContext, useContext, useState, type ReactNode } from "react";
import { authApi } from "../api/endpoints";
import type { AuthResponseDto, LoginDto } from "../api/types";

interface AuthContextValue {
  auth: AuthResponseDto | null;
  login: (dto: LoginDto) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
  isClientOnly: boolean;
  isTechnicienOnly: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadAuth(): AuthResponseDto | null {
  const raw = localStorage.getItem("auth");
  return raw ? (JSON.parse(raw) as AuthResponseDto) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthResponseDto | null>(loadAuth());

  const login = async (dto: LoginDto) => {
    const result = await authApi.login(dto);
    localStorage.setItem("token", result.token);
    localStorage.setItem("auth", JSON.stringify(result));
    setAuth(result);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
    setAuth(null);
  };

  const hasRole = (...roles: string[]) => !!auth && roles.some((r) => auth.roles.includes(r));
  const isClientOnly = !!auth && auth.roles.length === 1 && auth.roles[0] === "Client";
  const isTechnicienOnly = !!auth && auth.roles.length === 1 && auth.roles[0] === "Technicien";

  return (
    <AuthContext.Provider value={{ auth, login, logout, hasRole, isClientOnly, isTechnicienOnly }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
