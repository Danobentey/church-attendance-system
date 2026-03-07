import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/app/lib/auth";
import { getPersonById } from "@/app/lib/person";
import { getMembersZoneOptions } from "@/app/lib/members";
import EditPersonForm from "./_components/EditPersonForm";

export default async function EditPersonPage({
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

  const zoneOptions = person.type === "member" ? await getMembersZoneOptions(profile!) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs text-zinc-500">Edit profile</div>
          <h1 className="text-2xl font-semibold">{person.fullName}</h1>
        </div>
        <Link
          href={`/people/${personId}`}
          className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-center text-sm font-semibold leading-10 hover:bg-zinc-50"
        >
          Back to profile
        </Link>
      </div>

      <EditPersonForm
        personId={personId}
        person={person}
        zoneOptions={zoneOptions}
      />
    </div>
  );
}
