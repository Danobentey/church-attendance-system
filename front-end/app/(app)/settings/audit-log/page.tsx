import Link from "next/link";

const rows = [
  { id: "l1", action: "Login", user: "Admin", time: "—", ip: "—" },
  { id: "l2", action: "Check-in", user: "Usher", time: "—", ip: "—" },
];

export default function AuditLogPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs text-zinc-500">Settings</div>
          <h1 className="text-2xl font-semibold">Audit Log</h1>
          <p className="mt-1 text-sm text-zinc-600">Read-only user activity.</p>
        </div>
        <Link
          href="/settings"
          className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-center text-sm font-semibold leading-10 hover:bg-zinc-50"
        >
          Back
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-4">
          <input
            className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            placeholder="Date range"
          />
          <input
            className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            placeholder="User"
          />
          <input
            className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            placeholder="Action"
          />
          <input
            className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            placeholder="IP/device"
          />
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid grid-cols-12 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-600">
            <div className="col-span-3">Action</div>
            <div className="col-span-3">User</div>
            <div className="col-span-3">Timestamp</div>
            <div className="col-span-3">IP/device</div>
          </div>

          {rows.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-12 border-t border-zinc-200 px-3 py-2"
            >
              <div className="col-span-3 text-sm">{r.action}</div>
              <div className="col-span-3 text-sm">{r.user}</div>
              <div className="col-span-3 text-sm">{r.time}</div>
              <div className="col-span-3 text-sm">{r.ip}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-zinc-500">
        Audit log is read-only and supports advanced filters (to be wired).
      </div>
    </div>
  );
}
