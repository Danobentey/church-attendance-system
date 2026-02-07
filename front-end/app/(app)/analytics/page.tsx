import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Data-driven insights (charts will be wired later).
          </p>
        </div>

        <select className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm">
          <option>Last 4 weeks</option>
          <option>Last 3 months</option>
          <option>Year to date</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-xs text-zinc-500">Average attendance</div>
          <div className="mt-1 text-2xl font-semibold">—</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-xs text-zinc-500">Growth trend</div>
          <div className="mt-1 text-2xl font-semibold">—</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-xs text-zinc-500">First-time visitors</div>
          <div className="mt-1 text-2xl font-semibold">—</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-xs text-zinc-500">Retention rate</div>
          <div className="mt-1 text-2xl font-semibold">—</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">Attendance over time</div>
          <div className="mt-3 h-48 rounded-lg border border-dashed border-zinc-300 bg-zinc-50" />
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">First-timers vs returning</div>
          <div className="mt-3 h-48 rounded-lg border border-dashed border-zinc-300 bg-zinc-50" />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4">
        <div>
          <div className="text-sm font-semibold">Need a formal summary?</div>
          <div className="text-sm text-zinc-600">Go to Reports for exports.</div>
        </div>
        <Link
          href="/reports"
          className="h-10 rounded-md bg-zinc-900 px-4 text-center text-sm font-semibold leading-10 text-white hover:bg-zinc-800"
        >
          View reports
        </Link>
      </div>
    </div>
  );
}
