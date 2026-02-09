import { redirect } from "next/navigation";
import { getProfile } from "@/app/lib/auth";
import { getMembersZoneOptions } from "@/app/lib/members";
import { AddPersonForm } from "./_components/AddPersonForm";

export default async function AddPersonPage() {
  const profile = await getProfile();
  if (!profile) {
    redirect("/login");
  }

  const zoneOptions = await getMembersZoneOptions(profile);
  const canAddZone = profile.role === "admin";

  return (
    <AddPersonForm zoneOptions={zoneOptions} canAddZone={canAddZone} />
  );
}
