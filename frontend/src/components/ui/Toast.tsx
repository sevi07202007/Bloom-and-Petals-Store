import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ToastContext, type Toast } from "./toast-context";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((all) => [...all, { ...t, id }]);
    setTimeout(() => setToasts((all) => all.filter((x) => x.id !== id)), 3200);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[min(92vw,22rem)]" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`card p-4 animate-fadeUp border-l-4 ${t.tone === "error" ? "border-l-rose-600" : "border-l-sage-500"}`}>
            <p className="text-sm font-medium">{t.title}</p>
            {t.description && <p className="text-xs text-ink-500 mt-0.5">{t.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
