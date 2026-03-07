"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

type ToastState = {
  message: string;
  variant: ToastVariant;
  visible: boolean;
  id: number;
};

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 3500;

const variantConfig: Record<
  ToastVariant,
  { icon: React.ElementType; className: string }
> = {
  success: {
    icon: CheckCircle2,
    className: "bg-zinc-900 text-white",
  },
  error: {
    icon: AlertCircle,
    className: "bg-red-600 text-white",
  },
  info: {
    icon: Info,
    className: "bg-zinc-700 text-white",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ToastState>({
    message: "",
    variant: "success",
    visible: false,
    id: 0,
  });

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      setState((s) => ({
        message,
        variant,
        visible: true,
        id: s.id + 1,
      }));
    },
    []
  );

  useEffect(() => {
    if (!state.visible) return;
    const t = window.setTimeout(() => {
      setState((s) => ({ ...s, visible: false }));
    }, TOAST_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [state.visible, state.id]);

  const config = variantConfig[state.variant];
  const Icon = config.icon;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`fixed bottom-20 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 md:bottom-6 ${
          state.visible
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg ${config.className}`}
          style={{ minWidth: "240px", maxWidth: "90vw" }}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-sm font-medium">{state.message}</span>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setState((s) => ({ ...s, visible: false }))}
            className="ml-1 rounded-md p-0.5 opacity-70 hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
