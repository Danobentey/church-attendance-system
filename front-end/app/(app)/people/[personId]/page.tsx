import Link from "next/link";

export default async function PersonProfilePage({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  const { personId } = await params;

  const name = `Person ${personId}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-xs text-zinc-500">Person Profile</div>
        <h1 className="text-2xl font-semibold">{name}</h1>
        <div className="mt-1 text-sm text-zinc-600">
          Status: <span className="font-medium">Member</span> • Contact: —
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-zinc-200" />
            <div>
              <div className="text-sm font-semibold">{name}</div>
              <div className="text-xs text-zinc-500">ID: {personId}</div>
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
            <div className="text-sm font-semibold">—</div>
          </div>
          <div className="rounded-lg border border-zinc-200 p-3">
            <div className="text-xs text-zinc-500">Email</div>
            <div className="text-sm font-semibold">—</div>
          </div>
          <div className="rounded-lg border border-zinc-200 p-3">
            <div className="text-xs text-zinc-500">Department / Unit</div>
            <div className="text-sm font-semibold">—</div>
          </div>
          <div className="rounded-lg border border-zinc-200 p-3">
            <div className="text-xs text-zinc-500">Last attendance</div>
            <div className="text-sm font-semibold">—</div>
          </div>
        </div>
      </div>

      <div className="text-xs text-zinc-500">
        This is a scaffolded profile page. Data wiring will be added later.
      </div>
    </div>
  );
}
