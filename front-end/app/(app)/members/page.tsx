import Link from "next/link";
import { getProfile } from "@/app/lib/auth";
import { getMembers, getMembersZoneOptions } from "@/app/lib/members";
import MembersFilters from "./_components/MembersFilters";

type Props = {
  searchParams: Promise<{ search?: string; zoneId?: string }>;
};

export default async function MemberListPage({ searchParams }: Props) {
  const params = await searchParams;
  const profile = await getProfile();
  const [members, zoneOptions] = await Promise.all([
    getMembers(profile, {
      search: params.search,
      zoneId: params.zoneId || undefined,
    }),
    getMembersZoneOptions(profile),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Member List</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Browse and manage members.
          </p>
        </div>
        <Link
          href="/people/new"
          className="shrink-0 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Add member
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <MembersFilters
          key={`${params.search ?? ""}-${params.zoneId ?? ""}`}
          initialSearch={params.search ?? ""}
          initialZoneId={params.zoneId ?? ""}
          zoneOptions={zoneOptions}
        />

        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid grid-cols-12 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-600">
            <div className="col-span-4">Name</div>
            <div className="col-span-3">Phone</div>
            <div className="col-span-3">Last attendance</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {members.length === 0 ? (
            <div className="border-t border-zinc-200 px-3 py-6 text-center text-sm text-zinc-500">
              No members match your filters.
            </div>
          ) : (
            members.map((m) => (
              <div
                key={m.id}
                className="grid grid-cols-12 items-center gap-2 border-t border-zinc-200 px-3 py-2"
              >
                <div className="col-span-4 text-sm font-semibold">
                  {m.firstName} {m.lastName}
                  {m.zoneIdentifier ? (
                    <span className="ml-1.5 text-zinc-500">
                      ({m.zoneIdentifier})
                    </span>
                  ) : null}
                </div>
                <div className="col-span-3 text-sm text-zinc-700">
                  {m.phoneNumber}
                </div>
                <div className="col-span-3 text-sm text-zinc-700">
                  {m.lastAttendance ?? "—"}
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <Link
                    href={`/people/${m.id}`}
                    className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-zinc-50"
                  >
                    View profile
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="text-xs text-zinc-500">
        Pagination / bulk actions can be added in a later phase.
      </div>
    </div>
  );
}
