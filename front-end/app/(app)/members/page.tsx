import Link from "next/link";
import { getProfile } from "@/app/lib/auth";
import { getMembers, getMembersZoneOptions } from "@/app/lib/members";
import MembersListClient from "./_components/MembersListClient";
import { UserPlus } from "lucide-react";

type Props = {
  searchParams: Promise<{ zoneId?: string }>;
};

export default async function MemberListPage({ searchParams }: Props) {
  const params = await searchParams;
  const profile = await getProfile();
  const [members, zoneOptions] = await Promise.all([
    getMembers(profile, { zoneId: params.zoneId || undefined }),
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

      <MembersListClient
        members={members}
        zoneOptions={zoneOptions}
        initialZoneId={params.zoneId ?? ""}
      />
    </div>
  );
}
