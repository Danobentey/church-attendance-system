import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile } from "@/app/lib/auth";
import { getPersonById } from "@/app/lib/person";

export default async function PersonProfilePage({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  const { personId } = await params;
  const profile = await getProfile();
  const person = profile ? await getPersonById(profile, personId) : null;

  if (!person) {
    notFound();
  }

  const contactDisplay = [person.phoneNumber, person.email].filter(Boolean).join(" • ") || "—";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-xs text-zinc-500">Person Profile</div>
        <h1 className="text-2xl font-semibold">{person.fullName}</h1>
        <div className="mt-1 text-sm text-zinc-600">
          Status: <span className="font-medium">{person.type === "member" ? (person.status ?? "Active") : "Guest"}</span>
          {" • "}
          Contact: {contactDisplay}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-zinc-200" />
            <div>
              <div className="text-sm font-semibold">{person.fullName}</div>
              <div className="text-xs text-zinc-500">
                {person.zoneIdentifier ? `${person.zoneIdentifier}` : `ID: ${personId}`}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/people/${personId}/attendance-history`}
              className="h-10 rounded-md bg-zinc-900 px-4 text-center text-sm font-semibold leading-10 text-white hover:bg-zinc-800"
            >
              Attendance history
            </Link>
            <Link
              href={`/people/${personId}/notes`}
              className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-center text-sm font-semibold leading-10 hover:bg-zinc-50"
            >
              Notes
            </Link>
            <Link
              href={`/people/${personId}/edit`}
              className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-center text-sm font-semibold leading-10 hover:bg-zinc-50"
            >
              Edit profile
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 p-3">
            <div className="text-xs text-zinc-500">Phone</div>
            <div className="text-sm font-semibold">{person.phoneNumber ?? "—"}</div>
          </div>
          <div className="rounded-lg border border-zinc-200 p-3">
            <div className="text-xs text-zinc-500">Email</div>
            <div className="text-sm font-semibold">{person.email ?? "—"}</div>
          </div>
          <div className="rounded-lg border border-zinc-200 p-3">
            <div className="text-xs text-zinc-500">Department / Unit</div>
            <div className="text-sm font-semibold">{person.zoneName ?? "—"}</div>
          </div>
          <div className="rounded-lg border border-zinc-200 p-3">
            <div className="text-xs text-zinc-500">Last attendance</div>
            <div className="text-sm font-semibold">{person.lastAttendance ?? "—"}</div>
          </div>
          {person.type === "guest" && person.congregation ? (
            <div className="rounded-lg border border-zinc-200 p-3 sm:col-span-2">
              <div className="text-xs text-zinc-500">Congregation</div>
              <div className="text-sm font-semibold">{person.congregation}</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
