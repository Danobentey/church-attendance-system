import Link from "next/link";
import { getProfile } from "@/app/lib/auth";
import { getAttendanceLog } from "@/app/lib/attendance-log";
import { getEventsInDateRange } from "@/app/lib/events";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function weekAgoIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

export default async function AttendanceLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const profile = await getProfile();
  const params = await searchParams;

  const dateTo = (params.dateTo as string) || todayIso();
  const dateFrom = (params.dateFrom as string) || weekAgoIso();
  const eventId = (params.eventId as string) || "";
  const type = (params.type as string) || "";
  const search = (params.search as string) || "";

  const [rows, eventOptions] =
    profile ?
      await Promise.all([
        getAttendanceLog(profile, {
          dateFrom,
          dateTo,
          eventId: eventId || null,
          type:
            type === "member" ? "member" : type === "guest" ? "guest" : null,
          search: search || null,
        }),
        getEventsInDateRange(profile, dateFrom, dateTo),
      ])
    : [[], []];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Attendance Log</h1>
          <p className="mt-1 text-sm text-zinc-600">
            View attendance records by date range and service.
          </p>
        </div>
        <a
          href={`/api/attendance-log/export?${new URLSearchParams({
            dateFrom,
            dateTo,
            ...(eventId && { eventId }),
            ...(type && { type }),
            ...(search && { search }),
          }).toString()}`}
          className="h-10 shrink-0 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800 inline-flex items-center justify-center"
        >
          Export (CSV)
        </a>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <form method="get" action="/attendance-log" className="grid gap-3 lg:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="dateFrom" className="text-xs font-medium text-zinc-600">
              From date
            </label>
            <input
              id="dateFrom"
              name="dateFrom"
              type="date"
              defaultValue={dateFrom}
              className="h-10 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="dateTo" className="text-xs font-medium text-zinc-600">
              To date
            </label>
            <input
              id="dateTo"
              name="dateTo"
              type="date"
              defaultValue={dateTo}
              className="h-10 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="eventId" className="text-xs font-medium text-zinc-600">
              Service
            </label>
            <select
              id="eventId"
              name="eventId"
              defaultValue={eventId}
              className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm"
            >
              <option value="">All services</option>
              {eventOptions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.date})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="type" className="text-xs font-medium text-zinc-600">
              Type
            </label>
            <select
              id="type"
              name="type"
              defaultValue={type}
              className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm"
            >
              <option value="">All</option>
              <option value="member">Members</option>
              <option value="guest">Guests</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 lg:col-span-3">
            <label htmlFor="search" className="text-xs font-medium text-zinc-600">
              Search by name
            </label>
            <input
              id="search"
              name="search"
              type="search"
              defaultValue={search}
              placeholder="Search by name"
              className="h-10 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>
          <div>
            <button
              type="submit"
              className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Apply filters
            </button>
          </div>
        </form>

        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid grid-cols-12 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-600">
            <div className="col-span-4">Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-4">Service</div>
            <div className="col-span-2">Check-in time</div>
          </div>

          {rows.length === 0 ? (
            <div className="border-t border-zinc-200 px-3 py-6 text-center text-sm text-zinc-500">
              No attendance records match the selected filters.
            </div>
          ) : (
            rows.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-12 items-center border-t border-zinc-200 px-3 py-2"
              >
                <div className="col-span-4">
                  <Link
                    href={`/people/${r.personId}`}
                    className="text-sm font-semibold hover:underline"
                  >
                    {r.name}
                  </Link>
                </div>
                <div className="col-span-2 text-sm text-zinc-700">{r.type}</div>
                <div className="col-span-4 text-sm text-zinc-700">{r.service}</div>
                <div className="col-span-2 text-sm text-zinc-700">
                  {r.eventDate} {r.checkInTime}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
