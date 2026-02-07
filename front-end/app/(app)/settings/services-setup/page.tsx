"use client";

import Link from "next/link";
import { useState } from "react";

type Service = {
  id: string;
  name: string;
  default?: boolean;
};

const initial: Service[] = [
  { id: "s1", name: "Sunday Service", default: true },
  { id: "s2", name: "Midweek" },
];

export default function ServicesSetupPage() {
  const [services, setServices] = useState<Service[]>(initial);
  const [newName, setNewName] = useState("");

  function addService() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setServices((prev) => [...prev, { id: String(Date.now()), name: trimmed }]);
    setNewName("");
  }

  function setDefault(id: string) {
    setServices((prev) => prev.map((s) => ({ ...s, default: s.id === id })));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs text-zinc-500">Settings</div>
          <h1 className="text-2xl font-semibold">Services Setup</h1>
        </div>
        <Link
          href="/settings"
          className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-center text-sm font-semibold leading-10 hover:bg-zinc-50"
        >
          Back
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Recurring services</div>

        <div className="mt-3 flex flex-col gap-2">
          {services.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{s.name}</div>
                <div className="text-xs text-zinc-500">
                  {s.default ? "Default" : ""}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDefault(s.id)}
                  className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold hover:bg-zinc-50"
                >
                  Set default
                </button>
                <select className="h-9 rounded-md border border-zinc-300 bg-white px-2 text-sm">
                  <option>Assign leader…</option>
                  <option>Admin</option>
                  <option>Usher</option>
                  <option>Pastoral</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-zinc-200 pt-4">
          <div className="mb-2 text-sm font-semibold">Create recurring service</div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-10 flex-1 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
              placeholder="Service name"
            />
            <button
              type="button"
              onClick={addService}
              className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
