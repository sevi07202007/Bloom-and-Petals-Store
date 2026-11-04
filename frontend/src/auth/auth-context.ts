import { createContext } from "react";
import type { RegisterInput } from "../api/auth";
import type { User } from "../api/types";

export interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthState | null>(null);
