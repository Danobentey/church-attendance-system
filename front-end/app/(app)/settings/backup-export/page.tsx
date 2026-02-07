"use client";

import Link from "next/link";
import { useState } from "react";

export default function BackupExportSettingsPage() {
  const [schedule, setSchedule] = useState("Weekly");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs text-zinc-500">Settings</div>
          <h1 className="text-2xl font-semibold">Backup & Export</h1>
        </div>
        <Link
          href="/settings"
          className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-center text-sm font-semibold leading-10 hover:bg-zinc-50"
        >
          Back
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">Manual backup</div>
          <div className="mt-1 text-sm text-zinc-600">
            Create a backup snapshot (placeholder).
          </div>
          <button
            type="button"
            className="mt-4 h-10 w-full rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Create backup
          </button>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">Auto-backup schedule</div>
          <div className="mt-4 flex flex-col gap-2">
            <select
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm"
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
            <button
              type="button"
              className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold hover:bg-zinc-50"
            >
              Save schedule
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 lg:col-span-2">
          <div className="text-sm font-semibold">Download backups</div>
          <div className="mt-1 text-sm text-zinc-600">
            Available backups will appear here.
          </div>
          <div className="mt-4 rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
            No backups yet.
          </div>
        </div>
      </div>
    </div>
  );
}
