import { createContext } from "react";

export interface Toast { id: number; title: string; description?: string; tone?: "success" | "error" }
export interface ToastApi { toast: (t: Omit<Toast, "id">) => void }

export const ToastContext = createContext<ToastApi | null>(null);
