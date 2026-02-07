import Link from "next/link";

const rows = [
  { id: "a1", name: "John Doe", type: "Member", service: "Sunday Service", time: "—" },
  { id: "a2", name: "Samuel Guest", type: "Guest", service: "Sunday Service", time: "—" },
];

export default function AttendanceLogPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Attendance Log</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Global view of attendance records.
          </p>
        </div>
        <button
          type="button"
          className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Export (CSV/Excel)
        </button>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-4">
          <input
            className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            placeholder="Date range (e.g., this week)"
          />
          <select className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm">
            <option>Service (all)</option>
            <option>Sunday Service</option>
            <option>Midweek</option>
            <option>Special</option>
          </select>
          <select className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm">
            <option>Member/Guest (all)</option>
            <option>Members</option>
            <option>Guests</option>
          </select>
          <input
            className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            placeholder="Search name"
          />
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid grid-cols-12 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-600">
            <div className="col-span-4">Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-4">Service</div>
            <div className="col-span-2">Check-in time</div>
          </div>

          {rows.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-12 items-center border-t border-zinc-200 px-3 py-2"
            >
              <div className="col-span-4">
                <Link
                  href={`/people/${r.type === "Member" ? "m-001" : "g-001"}`}
                  className="text-sm font-semibold hover:underline"
                >
                  {r.name}
                </Link>
              </div>
              <div className="col-span-2 text-sm text-zinc-700">{r.type}</div>
              <div className="col-span-4 text-sm text-zinc-700">{r.service}</div>
              <div className="col-span-2 text-sm text-zinc-700">{r.time}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-zinc-500">Defaults to today (to be wired).</div>
    </div>
  );
}
