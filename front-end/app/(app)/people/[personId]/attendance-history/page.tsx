import Link from "next/link";

const rows = [
  { date: "—", service: "Sunday Service", time: "—" },
  { date: "—", service: "Midweek", time: "—" },
];

export default async function AttendanceHistoryPage({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  const { personId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs text-zinc-500">Attendance history</div>
          <h1 className="text-2xl font-semibold">Person {personId}</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/people/${personId}`}
            className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-center text-sm font-semibold leading-10 hover:bg-zinc-50"
          >
            Back to profile
          </Link>
          <button
            type="button"
            className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Export
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 p-3">
            <div className="text-xs text-zinc-500">Frequency</div>
            <div className="text-sm font-semibold">—</div>
          </div>
          <div className="rounded-lg border border-zinc-200 p-3">
            <div className="text-xs text-zinc-500">Consistent / Irregular</div>
            <div className="text-sm font-semibold">—</div>
          </div>
          <div className="rounded-lg border border-zinc-200 p-3">
            <div className="text-xs text-zinc-500">Last attended</div>
            <div className="text-sm font-semibold">—</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid grid-cols-12 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-600">
            <div className="col-span-4">Date</div>
            <div className="col-span-5">Service</div>
            <div className="col-span-3">Check-in time</div>
          </div>

          {rows.map((r, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 border-t border-zinc-200 px-3 py-2"
            >
              <div className="col-span-4 text-sm">{r.date}</div>
              <div className="col-span-5 text-sm">{r.service}</div>
              <div className="col-span-3 text-sm">{r.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
