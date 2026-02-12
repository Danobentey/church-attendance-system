"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelectedService } from "../../selected-service";
import { useToast } from "../../_components/Toast";
import { recordAttendance } from "@/app/lib/check-in-actions";
import type { CheckInPerson } from "@/app/lib/check-in";

function personKey(p: CheckInPerson): string {
  return `${p.status}-${p.id}`;
}

type CheckInContentProps = {
  initialMembers: CheckInPerson[];
  initialGuests: CheckInPerson[];
};

export default function CheckInContent({
  initialMembers,
  initialGuests,
}: CheckInContentProps) {
  const { selectedService, selectedServiceId } = useSelectedService();
  const { showToast } = useToast();
  const [tab, setTab] = useState<"Members" | "Guests">("Members");
  const [query, setQuery] = useState("");
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(() => new Set());
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    setCheckedInIds(new Set());
  }, [selectedServiceId]);

  const results = useMemo(() => {
    const list = tab === "Members" ? initialMembers : initialGuests;
    const notCheckedIn = list.filter((p) => !checkedInIds.has(personKey(p)));
    const q = query.trim().toLowerCase();
    if (!q) return notCheckedIn;
    return notCheckedIn.filter((p) => {
      const hay = `${p.name} ${p.phone ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, tab, initialMembers, initialGuests, checkedInIds]);

  const checkIn = useCallback(
    async (person: CheckInPerson) => {
      if (!selectedServiceId) {
        showToast("Select a service first.");
        return;
      }
      const key = personKey(person);
      setSubmittingId(key);
      const result = await recordAttendance(selectedServiceId, person);
      setSubmittingId(null);
      if (result.ok) {
        showToast(`${person.name} checked in`);
        setCheckedInIds((prev) => new Set(prev).add(key));
      } else {
        showToast(result.error);
      }
    },
    [selectedServiceId, showToast]
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Check-in</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Search and check in quickly during service.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs text-zinc-500">Selected service</div>
            <div className="text-sm font-semibold">
              {selectedService?.name ?? "No service selected"}
              {selectedService?.time ? ` (${selectedService.time})` : ""}
            </div>
          </div>
          <Link
            href="/services/today"
            className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold hover:bg-zinc-50"
          >
            Change service
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab("Members")}
              className={`h-9 rounded-md px-3 text-sm font-semibold ${
                tab === "Members"
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              Members
            </button>
            <button
              type="button"
              onClick={() => setTab("Guests")}
              className={`h-9 rounded-md px-3 text-sm font-semibold ${
                tab === "Guests"
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              Guests
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/people/new"
              className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold hover:bg-zinc-50"
            >
              Add new member/guest
            </Link>
            <Link
              href="/people/new?type=guest"
              className="h-9 rounded-md bg-zinc-900 px-3 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Add new guest
            </Link>
          </div>
        </div>

        <div className="mt-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or phone number"
            className="h-12 w-full rounded-md border border-zinc-300 px-4 text-base outline-none focus:border-zinc-900"
          />
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {results.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
              No results. Try a different search or add a new{" "}
              {tab === "Members" ? "member" : "guest"}.
            </div>
          ) : (
            results.map((p) => (
              <div
                key={`${p.status}-${p.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{p.name}</div>
                  <div className="text-xs text-zinc-500">
                    {p.status}
                    {p.phone ? ` • ${p.phone}` : ""}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => checkIn(p)}
                  disabled={!selectedServiceId || submittingId === personKey(p)}
                  className="shrink-0 rounded-md bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  {submittingId === personKey(p) ? "Checking in…" : "Check in"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="text-xs text-zinc-500">
        Tip: this page is optimized for fast keyboard search and big buttons.
      </div>
    </div>
  );
}
