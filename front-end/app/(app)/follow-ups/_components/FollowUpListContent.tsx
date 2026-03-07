"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FollowUpItem } from "@/app/lib/follow-ups";

type FollowUpItemWithStatus = FollowUpItem & { status: "Pending" | "Contacted" };

type Props = {
  initialItems: FollowUpItem[];
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
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="mb-3 grid gap-3 lg:grid-cols-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm"
        >
          <option value="">Category (all)</option>
          <option value="first_timers">First timers</option>
          <option value="absent">Absent members</option>
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          placeholder="Search name"
          className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
        />
        <button
          type="button"
          onClick={applyFilters}
          className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Apply filters
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {filteredItems.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 px-3 py-6 text-center text-sm text-zinc-500">
            No follow-ups match your filters.
          </div>
        ) : (
          filteredItems.map((i) => (
            <div
              key={i.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2"
            >
              <div className="min-w-0">
                <Link
                  href={`/people/${i.personId}`}
                  className="truncate text-sm font-semibold hover:underline"
                >
                  {i.name}
                </Link>
                <div className="text-xs text-zinc-500">
                  {i.category}
                  {i.lastAttendance ? ` • Last: ${i.lastAttendance}` : ""} •{" "}
                  <span
                    className={
                      i.status === "Pending" ? "text-orange-600" : "text-green-700"
                    }
                  >
                    {i.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleStatus(i.id)}
                  className="h-9 rounded-md bg-zinc-900 px-3 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                  Toggle status
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 text-xs text-zinc-500">
        Status toggle is for local tracking only. Persistence can be added later.
      </div>
    </div>
  );
}
