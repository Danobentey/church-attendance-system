"use client";

import { useState } from "react";

type FollowUpItem = {
  id: string;
  name: string;
  category: "First timer" | "Absent";
  status: "Pending" | "Contacted";
};

const seed: FollowUpItem[] = [
  { id: "f1", name: "Samuel Guest", category: "First timer", status: "Pending" },
  { id: "f2", name: "Mary Johnson", category: "Absent", status: "Pending" },
];

export default function FollowUpListPage() {
  const [items, setItems] = useState<FollowUpItem[]>(seed);

  function toggleStatus(id: string) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: i.status === "Pending" ? "Contacted" : "Pending" }
          : i
      )
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Follow-up List</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Ensure no one falls through the cracks.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-3 grid gap-3 lg:grid-cols-3">
          <select className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm">
            <option>Category (all)</option>
            <option>First timers</option>
            <option>Absent members</option>
          </select>
          <select className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm">
            <option>Status (all)</option>
            <option>Pending</option>
            <option>Contacted</option>
          </select>
          <input
            className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            placeholder="Search name"
          />
        </div>

        <div className="flex flex-col gap-2">
          {items.map((i) => (
            <div
              key={i.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{i.name}</div>
                <div className="text-xs text-zinc-500">
                  {i.category} •{" "}
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
                <select className="h-9 rounded-md border border-zinc-300 bg-white px-2 text-sm">
                  <option>Assign to…</option>
                  <option>Admin</option>
                  <option>Usher</option>
                  <option>Pastoral</option>
                </select>
                <button
                  type="button"
                  onClick={() => toggleStatus(i.id)}
                  className="h-9 rounded-md bg-zinc-900 px-3 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                  Toggle status
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-zinc-500">
        Color-coded urgency and inline notes can be added later.
      </div>
    </div>
  );
}
