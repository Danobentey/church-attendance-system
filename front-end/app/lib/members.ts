import { and, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/app/lib/db";
import { attendance, events, users, zones } from "@/app/lib/db/schema";
import type { getProfile } from "@/app/lib/auth";

type Profile = Awaited<ReturnType<typeof getProfile>>;

export type MemberRow = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  zoneIdentifier: string | null;
  zoneId: string | null;
  lastAttendance: string | null;
};

/**
 * Returns zones available for filter: all for admin/secretariat, only own zone for zonal leader.
 */
export async function getMembersZoneOptions(profile: Profile) {
  const isZonalLeader = profile?.role === "zonal_leader";
  const zoneId = profile?.zoneId ?? null;

  if (isZonalLeader && zoneId) {
    const list = await db
      .select({ id: zones.id, name: zones.name })
      .from(zones)
      .where(eq(zones.id, zoneId));
    return list;
  }

  return db
    .select({ id: zones.id, name: zones.name })
    .from(zones)
    .orderBy(zones.name);
}

/**
 * Returns members (role = 'member') with optional search and zone filter.
 * Scoped by profile: zonal leader only sees their zone.
 */
export async function getMembers(
  profile: Profile,
  options: { search?: string; zoneId?: string } = {}
): Promise<MemberRow[]> {
  const isZonalLeader = profile?.role === "zonal_leader";
  const profileZoneId = profile?.zoneId ?? null;
  const { search, zoneId: filterZoneId } = options;

  const baseConditions = [eq(users.role, "member")];
  if (isZonalLeader && profileZoneId) {
    baseConditions.push(eq(users.zoneId, profileZoneId));
  }
  if (filterZoneId) {
    baseConditions.push(eq(users.zoneId, filterZoneId));
  }

  const searchTrimmed = search?.trim();
  if (searchTrimmed) {
    const term = `%${searchTrimmed}%`;
    baseConditions.push(
      or(
        ilike(users.firstName, term),
        ilike(users.lastName, term),
        ilike(users.phoneNumber, term)
      )!
    );
  }

  const members = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      phoneNumber: users.phoneNumber,
      zoneIdentifier: users.zoneIdentifier,
      zoneId: users.zoneId,
    })
    .from(users)
    .where(and(...baseConditions))
    .orderBy(users.lastName, users.firstName);

  if (members.length === 0) {
    return [];
  }

  const userIds = members.map((m) => m.id);

  // Last attendance per user: max event date
  const lastAttendanceRows = await db
    .select({
      userId: attendance.userId,
      lastDate: sql<string>`max(${events.date})::text`.as("last_date"),
    })
    .from(attendance)
    .innerJoin(events, eq(attendance.eventId, events.id))
    .where(inArray(attendance.userId, userIds))
    .groupBy(attendance.userId);

  const lastByUser = new Map(
    lastAttendanceRows
      .filter((r) => r.userId != null)
      .map((r) => [r.userId!, r.lastDate ?? null])
  );

  return members.map((m) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    phoneNumber: m.phoneNumber,
    zoneIdentifier: m.zoneIdentifier,
    zoneId: m.zoneId,
    lastAttendance: lastByUser.get(m.id) ?? null,
  }));
}
