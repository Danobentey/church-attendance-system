"use client";

import Link from "next/link";
import { useState } from "react";

export default function ChurchProfileSettingsPage() {
  const [name, setName] = useState("COC Ikeja");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs text-zinc-500">Settings</div>
          <h1 className="text-2xl font-semibold">Church Profile</h1>
        </div>
        <Link
          href="/settings"
          className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-center text-sm font-semibold leading-10 hover:bg-zinc-50"
        >
          Back
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm font-medium" htmlFor="name">
              Church name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm font-medium" htmlFor="address">
              Address
            </label>
            <input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm font-medium" htmlFor="contact">
              Contact info
            </label>
            <input
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
              placeholder="Phone, email, website…"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Logo upload</label>
            <div className="mt-1">
              <input
                type="file"
                className="w-full rounded-md border border-zinc-300 bg-white p-2 text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={() => setSaved(true)}
              className="h-10 w-full rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Save
            </button>
          </div>

          {saved ? (
            <div className="sm:col-span-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              Saved (placeholder).
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
