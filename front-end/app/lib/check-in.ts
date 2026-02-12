import { db } from "@/app/lib/db";
import { guests } from "@/app/lib/db/schema";
import { getProfile } from "@/app/lib/auth";
import { getMembers } from "@/app/lib/members";

export type CheckInPerson = {
  id: string;
  name: string;
  phone?: string;
  status: "Member" | "Guest";
  /** Required for members (their zone). Not set for guests; server uses recorder zone. */
  zoneId?: string;
};

/**
 * Returns members for the check-in list. Scoped by profile (zonal leader sees only their zone).
 */
export async function getCheckInMembers(): Promise<CheckInPerson[]> {
  const profile = await getProfile();
  if (!profile) return [];
  const rows = await getMembers(profile, {});
  return rows.map((m) => ({
    id: m.id,
    name: `${m.firstName} ${m.lastName}`.trim(),
    phone: m.phoneNumber ?? undefined,
    status: "Member" as const,
    zoneId: m.zoneId ?? undefined,
  }));
}

/**
 * Returns guests for the check-in list. All guests (no zone on guest record).
 */
export async function getCheckInGuests(): Promise<CheckInPerson[]> {
  const profile = await getProfile();
  if (!profile) return [];
  const rows = await db
    .select({
      id: guests.id,
      firstName: guests.firstName,
      lastName: guests.lastName,
      phoneNumber: guests.phoneNumber,
    })
    .from(guests)
    .orderBy(guests.lastName, guests.firstName);

  return rows.map((g) => ({
    id: g.id,
    name: `${g.firstName} ${g.lastName}`.trim(),
    phone: g.phoneNumber ?? undefined,
    status: "Guest" as const,
  }));
}
