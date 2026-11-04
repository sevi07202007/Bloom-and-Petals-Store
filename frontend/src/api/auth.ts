import { api } from "./client";
import type { TokenPair, User } from "./types";

export interface RegisterInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<TokenPair>("/auth/token/", { email, password }).then((r) => r.data),
  register: (input: RegisterInput) =>
    api.post<TokenPair & { user: User }>("/auth/register/", input).then((r) => r.data),
  me: () => api.get<User>("/auth/me/").then((r) => r.data),
};
