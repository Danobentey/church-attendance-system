"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type ZoneOption = { id: string; name: string };

type Props = {
  initialSearch: string;
  initialZoneId: string;
  zoneOptions: ZoneOption[];
};

const DEBOUNCE_MS = 300;

export default function MembersFilters({
  initialSearch,
  initialZoneId,
  zoneOptions,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialSearch);
  const [zoneId, setZoneId] = useState(initialZoneId);
  const zoneIdRef = useRef(zoneId);

  useEffect(() => {
    zoneIdRef.current = zoneId;
  }, [zoneId]);

  const updateUrl = useCallback(
    (searchValue: string, zoneValue: string) => {
      const params = new URLSearchParams();
      if (searchValue.trim()) params.set("search", searchValue.trim());
      if (zoneValue) params.set("zoneId", zoneValue);
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  // Debounced search only: update URL after user stops typing
  useEffect(() => {
    const t = window.setTimeout(() => {
      updateUrl(search, zoneIdRef.current);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [search, updateUrl]);

  // Zone change: update URL immediately (no debounce)
  function handleZoneChange(value: string) {
    setZoneId(value);
    updateUrl(search, value);
  }

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900 lg:col-span-1"
        placeholder="Search name or phone"
        aria-label="Search members by name or phone"
      />
      <select
        value={zoneId}
        onChange={(e) => handleZoneChange(e.target.value)}
        className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm"
        aria-label="Filter by zone"
      >
        <option value="">Zone (all)</option>
        {zoneOptions.map((z) => (
          <option key={z.id} value={z.id}>
            {z.name}
          </option>
        ))}
      </select>
      <div className="flex items-center text-xs text-zinc-500 lg:col-span-1">
        Filters update automatically
      </div>
    </div>
  );
}
