import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile } from "@/app/lib/auth";
import { getPersonAttendanceHistory } from "@/app/lib/person";

export default async function AttendanceHistoryPage({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  const { personId } = await params;
  const profile = await getProfile();
  const { person, history } = profile
    ? await getPersonAttendanceHistory(profile, personId)
    : { person: null, history: null };

  if (!person || !history) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs text-zinc-500">Attendance history</div>
          <h1 className="text-2xl font-semibold">{person.fullName}</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/people/${personId}`}
            className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-center text-sm font-semibold leading-10 hover:bg-zinc-50"
          >
            Back to profile
          </Link>
          <a
            href={`/api/export/person-attendance?personId=${encodeURIComponent(personId)}`}
            className="h-10 rounded-md bg-zinc-900 px-4 text-center text-sm font-semibold leading-10 text-white hover:bg-zinc-800"
          >
            Export
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 p-3">
            <div className="text-xs text-zinc-500">Frequency</div>
            <div className="text-sm font-semibold">{history.frequencyLabel}</div>
          </div>
          <div className="rounded-lg border border-zinc-200 p-3">
            <div className="text-xs text-zinc-500">Total attendances</div>
            <div className="text-sm font-semibold">{history.totalCount}</div>
          </div>
          <div className="rounded-lg border border-zinc-200 p-3">
            <div className="text-xs text-zinc-500">Last attended</div>
            <div className="text-sm font-semibold">{history.lastAttended ?? "—"}</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid grid-cols-12 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-600">
            <div className="col-span-4">Date</div>
            <div className="col-span-5">Service</div>
            <div className="col-span-3">Check-in time</div>
          </div>

          {history.entries.length === 0 ? (
            <div className="border-t border-zinc-200 px-3 py-6 text-center text-sm text-zinc-500">
              No attendance records yet.
            </div>
          ) : (
            history.entries.map((r, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 border-t border-zinc-200 px-3 py-2"
              >
                <div className="col-span-4 text-sm">{r.date}</div>
                <div className="col-span-5 text-sm">{r.serviceName}</div>
                <div className="col-span-3 text-sm">{r.checkInTime}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
