"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelectedService } from "../../selected-service";
import { useToast } from "../../_components/Toast";
import { recordAttendance } from "@/app/lib/check-in-actions";
import type { CheckInPerson } from "@/app/lib/check-in";
import {
  AlertTriangle,
  CalendarPlus,
  Search,
  UserPlus,
  CheckCircle2,
  Loader2,
  Users,
  Heart,
} from "lucide-react";

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
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Check-in</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Search and check in quickly during service.
        </p>
      </div>

      {/* Service warning banner */}
      {!selectedServiceId ? (
        <div className="flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-900">No service selected</p>
            <p className="text-xs text-amber-700">
              Create or select today&apos;s service to enable check-ins.
            </p>
          </div>
          <Link
            href="/services/today"
            className="shrink-0 flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            <CalendarPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Select service</span>
          </Link>
        </div>
      ) : (
        /* Active service card */
        <div className="flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-emerald-600 font-medium">Active service</p>
            <p className="text-sm font-semibold text-emerald-900">
              {selectedService?.name}
              {selectedService?.time ? ` · ${selectedService.time}` : ""}
            </p>
          </div>
          <Link
            href="/services/today"
            className="shrink-0 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
          >
            Change
          </Link>
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        {/* Tabs + action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3">
          <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1">
            <button
              type="button"
              onClick={() => setTab("Members")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-all ${
                tab === "Members"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Members
            </button>
            <button
              type="button"
              onClick={() => setTab("Guests")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-all ${
                tab === "Guests"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Heart className="h-3.5 w-3.5" />
              Guests
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/people/new"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              <UserPlus className="h-3.5 w-3.5" />
              New member
            </Link>
            <Link
              href="/people/new?type=guest"
              className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
            >
              <UserPlus className="h-3.5 w-3.5" />
              New guest
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or phone number"
              className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* People list */}
        <div className="px-4 pb-4">
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-200 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                <Search className="h-5 w-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-600">No results found</p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Try a different search or add a new{" "}
                  {tab === "Members" ? "member" : "guest"}.
                </p>
              </div>
              <Link
                href={tab === "Members" ? "/people/new" : "/people/new?type=guest"}
                className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                <UserPlus className="h-4 w-4" />
                Add {tab === "Members" ? "member" : "guest"}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-zinc-100">
              {results.map((p) => {
                const key = personKey(p);
                const isSubmitting = submittingId === key;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {p.name}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {p.status}
                        {p.phone ? ` · ${p.phone}` : ""}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => checkIn(p)}
                      disabled={!selectedServiceId || isSubmitting}
                      className="shrink-0 flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      {isSubmitting ? "Checking in…" : "Check in"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-zinc-400 text-center">
        Tip: this page is optimized for fast keyboard search and large touch targets.
      </p>
    </div>
  );
}
