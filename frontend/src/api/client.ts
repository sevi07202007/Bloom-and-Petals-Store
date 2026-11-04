import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "../auth/tokenStorage";

export const API_URL = import.meta.env.VITE_API_URL ?? "/api";

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccess(): Promise<string | null> {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) return null;
  try {
    const { data } = await axios.post<{ access: string }>(`${API_URL}/auth/token/refresh/`, { refresh });
    tokenStorage.setAccess(data.access);
    return data.access;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

// One refresh-and-retry on 401, shared across concurrent requests.
api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean };
    if (error.response?.status === 401 && !original._retried && tokenStorage.getRefresh()) {
      original._retried = true;
      refreshing ??= refreshAccess().finally(() => (refreshing = null));
      const token = await refreshing;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as Record<string, unknown> | undefined;
    if (data?.detail) return String(data.detail);
    if (data) {
      const first = Object.entries(data)[0];
      if (first) return `${first[0]}: ${Array.isArray(first[1]) ? first[1].join(" ") : first[1]}`;
    }
    return err.message;
  }
  return "Something went wrong.";
}
