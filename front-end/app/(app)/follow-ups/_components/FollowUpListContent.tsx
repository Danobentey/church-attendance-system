"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FollowUpItem } from "@/app/lib/follow-ups";
import {
  Search,
  CheckCircle2,
  Clock,
  BellRing,
  Users,
  Filter,
} from "lucide-react";

type FollowUpItemWithStatus = FollowUpItem & { status: "Pending" | "Contacted" };

type Props = {
  initialItems: FollowUpItem[];
};

const categoryStyles: Record<string, string> = {
  "First timer": "bg-amber-100 text-amber-700",
  Absent: "bg-blue-100 text-blue-700",
};

export default function FollowUpListContent({ initialItems }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusByKey, setStatusByKey] = useState<Record<string, "Pending" | "Contacted">>({});

  const itemsWithStatus: FollowUpItemWithStatus[] = useMemo(
    () =>
      initialItems.map((i) => ({
        ...i,
        status: statusByKey[i.id] ?? "Pending",
      })),
    [initialItems, statusByKey]
  );

  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const filteredItems = itemsWithStatus;

  const pendingCount = filteredItems.filter((i) => i.status === "Pending").length;
  const contactedCount = filteredItems.filter((i) => i.status === "Contacted").length;

  function applyFilters() {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (search.trim()) p.set("search", search.trim());
    router.push(`/follow-ups?${p.toString()}`);
  }

  function toggleStatus(id: string) {
    setStatusByKey((prev) => {
      const current = prev[id] ?? "Pending";
      return { ...prev, [id]: current === "Pending" ? "Contacted" : "Pending" };
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-500">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium">Total</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-900">{filteredItems.length}</div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-600">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Pending</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700">{pendingCount}</div>
        </div>
        <div className="col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:col-span-1">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium">Contacted</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">{contactedCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700">
          <Filter className="h-4 w-4" />
          Filters
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm focus:border-zinc-900 focus:bg-white focus:outline-none"
          >
            <option value="">Category (all)</option>
            <option value="first_timers">First timers</option>
            <option value="absent">Absent members</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Search name"
              className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-3 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={applyFilters}
            className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Apply filters
          </button>
        </div>
      </div>

      {/* Follow-up list */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
              <BellRing className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600">No follow-ups found</p>
              <p className="mt-0.5 text-xs text-zinc-400">Try adjusting your filters.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filteredItems.map((i) => (
              <div
                key={i.id}
                className={`flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-zinc-50 ${
                  i.status === "Contacted" ? "opacity-60" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/people/${i.personId}`}
                    className="truncate text-sm font-semibold text-zinc-900 hover:text-zinc-600 hover:underline"
                  >
                    {i.name}
                  </Link>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    {i.category && (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          categoryStyles[i.category] ?? "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {i.category}
                      </span>
                    )}
                    {i.lastAttendance && (
                      <span className="text-xs text-zinc-400">
                        Last: {i.lastAttendance}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${
                        i.status === "Pending" ? "text-amber-600" : "text-emerald-600"
                      }`}
                    >
                      {i.status === "Pending" ? (
                        <Clock className="h-3 w-3" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      {i.status}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleStatus(i.id)}
                  className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    i.status === "Pending"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {i.status === "Pending" ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark contacted
                    </>
                  ) : (
                    <>
                      <Clock className="h-3.5 w-3.5" />
                      Mark pending
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-400 text-center">
        Status toggles are session-only. Persistence can be added in a later phase.
      </p>
    </div>
  );
}
