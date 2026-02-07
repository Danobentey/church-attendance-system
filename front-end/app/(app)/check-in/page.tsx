"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelectedService } from "../selected-service";

type Person = {
  id: string;
  name: string;
  phone?: string;
  status: "Member" | "Guest";
};

const seedPeople: Person[] = [
  { id: "m-001", name: "John Doe", phone: "0801 234 5678", status: "Member" },
  { id: "m-002", name: "Mary Johnson", phone: "0802 111 2222", status: "Member" },
  { id: "g-001", name: "Samuel Guest", phone: "0703 444 5555", status: "Guest" },
];

export default function CheckInPage() {
  const router = useRouter();
  const { selectedService } = useSelectedService();
  const [tab, setTab] = useState<"Members" | "Guests">("Members");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filteredByTab = seedPeople.filter((p) =>
      tab === "Members" ? p.status === "Member" : p.status === "Guest"
    );

    if (!q) return filteredByTab;

    return filteredByTab.filter((p) => {
      const hay = `${p.name} ${p.phone ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, tab]);

  function checkIn(person: Person) {
    const params = new URLSearchParams({ name: person.name, id: person.id });
    router.push(`/check-in/confirmation?${params.toString()}`);
  }

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
              {selectedService.name}
              {selectedService.time ? ` (${selectedService.time})` : ""}
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
              No results. Try a different search or add a new guest.
            </div>
          ) : (
            results.map((p) => (
              <div
                key={p.id}
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
                  className="shrink-0 rounded-md bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
                >
                  Check in
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
