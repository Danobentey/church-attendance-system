import Link from "next/link";
import { getProfile } from "@/app/lib/auth";
import { getMembers, getMembersZoneOptions } from "@/app/lib/members";
import MembersFilters from "./_components/MembersFilters";
import { UserPlus, ChevronRight, CalendarDays } from "lucide-react";

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
          <h1 className="text-2xl font-semibold tracking-tight">Member List</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Browse and manage members.
          </p>
        </div>
        <Link
          href="/people/new"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
        >
          <UserPlus className="h-4 w-4" />
          Add member
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-4 py-3">
          <MembersFilters
            key={`${params.search ?? ""}-${params.zoneId ?? ""}`}
            initialSearch={params.search ?? ""}
            initialZoneId={params.zoneId ?? ""}
            zoneOptions={zoneOptions}
          />
        </div>

        {/* Table header */}
        <div className="grid grid-cols-12 bg-zinc-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          <div className="col-span-5">Name</div>
          <div className="col-span-3 hidden sm:block">Phone</div>
          <div className="col-span-2 hidden sm:block">Last attendance</div>
          <div className="col-span-7 sm:col-span-2 text-right">Actions</div>
        </div>

        {members.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
              <UserPlus className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600">No members found</p>
              <p className="mt-0.5 text-xs text-zinc-400">
                Try adjusting your filters or add a new member.
              </p>
            </div>
            <Link
              href="/people/new"
              className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              <UserPlus className="h-4 w-4" />
              Add member
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {members.map((m) => (
              <Link
                key={m.id}
                href={`/people/${m.id}`}
                className="grid grid-cols-12 items-center gap-2 px-4 py-3 transition-colors hover:bg-zinc-50 group"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600 group-hover:bg-zinc-200 transition-colors">
                    {(m.firstName?.[0] ?? "").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {m.firstName} {m.lastName}
                    </p>
                    {m.zoneIdentifier && (
                      <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                        {m.zoneIdentifier}
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-3 hidden sm:block text-sm text-zinc-600">
                  {m.phoneNumber}
                </div>
                <div className="col-span-2 hidden sm:flex items-center gap-1.5 text-sm text-zinc-500">
                  {m.lastAttendance ? (
                    <>
                      <CalendarDays className="h-3.5 w-3.5 text-zinc-400" />
                      {m.lastAttendance}
                    </>
                  ) : (
                    <span className="text-zinc-300">—</span>
                  )}
                </div>
                <div className="col-span-7 sm:col-span-2 flex items-center justify-end gap-1 text-zinc-400 group-hover:text-zinc-600 transition-colors">
                  <span className="text-xs font-medium hidden sm:block">View profile</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
