"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Search,
  UserPlus,
} from "lucide-react";
import type { MemberRow } from "@/app/lib/members";

type ZoneOption = { id: string; name: string };

type Props = {
  members: MemberRow[];
  zoneOptions: ZoneOption[];
  initialZoneId: string;
};

export default function MembersListClient({
  members,
  zoneOptions,
  initialZoneId,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [zoneId, setZoneId] = useState(initialZoneId);

  function handleZoneChange(value: string) {
    setZoneId(value);
    const params = new URLSearchParams();
    if (value) params.set("zoneId", value);
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => {
      const hay =
        `${m.firstName} ${m.lastName} ${m.phoneNumber ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [search, members]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      {/* Filters */}
      <div className="border-b border-zinc-100 px-4 py-3">
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-md border border-zinc-300 pl-9 pr-3 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              placeholder="Search name or phone"
              aria-label="Search members by name or phone"
              autoComplete="off"
            />
          </div>
          <select
            value={zoneId}
            onChange={(e) => handleZoneChange(e.target.value)}
            className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-900"
            aria-label="Filter by zone"
          >
            <option value="">Zone (all)</option>
            {zoneOptions.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 lg:col-span-1">
            <Search className="h-3 w-3" />
            {filtered.length} of {members.length} member
            {members.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-12 bg-zinc-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        <div className="col-span-5">Name</div>
        <div className="col-span-3 hidden sm:block">Phone</div>
        <div className="col-span-2 hidden sm:block">Last attendance</div>
        <div className="col-span-7 text-right sm:col-span-2">Actions</div>
      </div>

      {/* Member rows */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
            <UserPlus className="h-5 w-5 text-zinc-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-600">No members found</p>
            <p className="mt-0.5 text-xs text-zinc-400">
              {search.trim()
                ? "Try a different search term."
                : "Try adjusting your filters or add a new member."}
            </p>
          </div>
          {!search.trim() && (
            <Link
              href="/people/new"
              className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              <UserPlus className="h-4 w-4" />
              Add member
            </Link>
          )}
        </div>
      ) : (
        <div className="divide-y divide-zinc-100">
          {filtered.map((m) => (
            <Link
              key={m.id}
              href={`/people/${m.id}`}
              className="group grid grid-cols-12 items-center gap-2 px-4 py-3 transition-colors hover:bg-zinc-50"
            >
              <div className="col-span-5 flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600 transition-colors group-hover:bg-zinc-200">
                  {(m.firstName?.[0] ?? "").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {m.firstName} {m.lastName}
                  </p>
                  {m.zoneIdentifier && (
                    <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                      {m.zoneIdentifier}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-3 hidden text-sm text-zinc-600 sm:block">
                {m.phoneNumber}
              </div>
              <div className="col-span-2 hidden items-center gap-1.5 text-sm text-zinc-500 sm:flex">
                {m.lastAttendance ? (
                  <>
                    <CalendarDays className="h-3.5 w-3.5 text-zinc-400" />
                    {m.lastAttendance}
                  </>
                ) : (
                  <span className="text-zinc-300">—</span>
                )}
              </div>
              <div className="col-span-7 flex items-center justify-end gap-1 text-zinc-400 transition-colors group-hover:text-zinc-600 sm:col-span-2">
                <span className="hidden text-xs font-medium sm:block">
                  View profile
                </span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
