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

export const serviceOptions: ServiceOption[] = [
  { id: "sunday-0800", name: "Sunday Service", time: "08:00" },
  { id: "sunday-1030", name: "Sunday Service", time: "10:30" },
  { id: "midweek-1800", name: "Midweek", time: "18:00" },
  { id: "special", name: "Special" },
];

type SelectedServiceState = {
  selectedServiceId: string;
  setSelectedServiceId: (id: string) => void;
  selectedService: ServiceOption;
  options: ServiceOption[];
};

const SelectedServiceContext = createContext<SelectedServiceState | null>(null);

export function SelectedServiceProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const defaultId = serviceOptions[0]?.id ?? "";
  const [selectedServiceId, setSelectedServiceId] = useState(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      return stored || defaultId;
    } catch {
      return defaultId;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, selectedServiceId);
    } catch {
      // ignore
    }
  }, [selectedServiceId]);

  const selectedService = useMemo(() => {
    return (
      serviceOptions.find((o) => o.id === selectedServiceId) ?? serviceOptions[0]
    );
  }, [selectedServiceId]);

  const value = useMemo<SelectedServiceState>(() => {
    return {
      selectedServiceId,
      setSelectedServiceId,
      selectedService,
      options: serviceOptions,
    };
  }, [selectedService, selectedServiceId]);

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
