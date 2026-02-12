"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ServiceOption = {
  id: string;
  name: string;
  time?: string;
};

const storageKey = "ca_selected_service";

/** Fallback when no events are loaded from the server (e.g. before first load). */
export const serviceOptions: ServiceOption[] = [
  { id: "sunday-0800", name: "Sunday Service", time: "08:00" },
  { id: "sunday-1030", name: "Sunday Service", time: "10:30" },
  { id: "midweek-1800", name: "Midweek", time: "18:00" },
  { id: "special", name: "Special" },
];

type SelectedServiceState = {
  selectedServiceId: string;
  setSelectedServiceId: (id: string) => void;
  selectedService: ServiceOption | null;
  options: ServiceOption[];
};

const SelectedServiceContext = createContext<SelectedServiceState | null>(null);

type SelectedServiceProviderProps = Readonly<{
  children: React.ReactNode;
  /** Today's events from the server; when set, these are shown instead of static options. */
  initialOptions?: ServiceOption[] | null;
  /** Event id to auto-select (e.g. preferred service for today's weekday). */
  initialSelectedId?: string | null;
}>;

export function SelectedServiceProvider({
  children,
  initialOptions,
  initialSelectedId,
}: SelectedServiceProviderProps) {
  const options =
    initialOptions !== undefined && initialOptions !== null
      ? initialOptions
      : serviceOptions;
  const defaultId = options[0]?.id ?? "";
  const autoSelectId =
    initialSelectedId &&
    options.some((o) => o.id === initialSelectedId)
      ? initialSelectedId
      : null;

  const [selectedServiceId, setSelectedServiceId] = useState(() => {
    if (autoSelectId) return autoSelectId;
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored && options.some((o) => o.id === stored)) return stored;
      return defaultId;
    } catch {
      return defaultId;
    }
  });

  // When server sends a new preferred id (e.g. after creating default event), sync selection
  useEffect(() => {
    if (autoSelectId && autoSelectId !== selectedServiceId) {
      setSelectedServiceId(autoSelectId);
    }
  }, [autoSelectId]); // eslint-disable-line react-hooks/exhaustive-deps -- only when server preference changes

  // When initialOptions change (e.g. after nav), ensure selected id is in the new list
  const resolvedSelectedId = useMemo(() => {
    if (options.some((o) => o.id === selectedServiceId)) return selectedServiceId;
    return defaultId;
  }, [options, selectedServiceId, defaultId]);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, resolvedSelectedId);
    } catch {
      // ignore
    }
  }, [resolvedSelectedId]);

  const selectedService = useMemo(() => {
    return options.find((o) => o.id === resolvedSelectedId) ?? options[0] ?? null;
  }, [options, resolvedSelectedId]);

  const value = useMemo<SelectedServiceState>(() => {
    return {
      selectedServiceId: resolvedSelectedId,
      setSelectedServiceId,
      selectedService,
      options,
    };
  }, [resolvedSelectedId, selectedService, options]);

  return (
    <SelectedServiceContext.Provider value={value}>
      {children}
    </SelectedServiceContext.Provider>
  );
}

export function useSelectedService() {
  const ctx = useContext(SelectedServiceContext);
  if (!ctx) throw new Error("useSelectedService must be used within provider");
  return ctx;
}
