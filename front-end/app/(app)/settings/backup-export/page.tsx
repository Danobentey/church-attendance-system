import Link from "next/link";

export default function BackupExportSettingsPage() {
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
            Download all data (zones, members, events, guests, attendance, config) as JSON.
          </div>
          <a
            href="/api/backup"
            className="mt-4 inline-block h-10 w-full rounded-md bg-zinc-900 px-4 text-center text-sm font-semibold leading-10 text-white hover:bg-zinc-800"
          >
            Create backup
          </a>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">Auto-backup schedule</div>
          <div className="mt-1 text-sm text-zinc-600">
            Scheduled backups require a cron job or external service; use manual backup for now.
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 lg:col-span-2">
          <div className="text-sm font-semibold">Download backups</div>
          <div className="mt-1 text-sm text-zinc-600">
            Use the &quot;Create backup&quot; button above to download a full JSON snapshot.
          </div>
        </div>
      </div>
    </div>
  );
}
