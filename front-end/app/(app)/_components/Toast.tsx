"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type ToastState = {
  message: string;
  visible: boolean;
};

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 3000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ToastState>({ message: "", visible: false });

  const showToast = useCallback((message: string) => {
    setState({ message, visible: true });
  }, []);

  useEffect(() => {
    if (!state.visible) return;
    const t = window.setTimeout(() => {
      setState((s) => ({ ...s, visible: false }));
    }, TOAST_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [state.visible, state.message]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {state.visible && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          {state.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
