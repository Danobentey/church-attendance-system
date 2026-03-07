import { and, eq, gte, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/app/lib/db";
import { attendance, events, guests, users } from "@/app/lib/db/schema";
import type { getProfile } from "@/app/lib/auth";

type Profile = Awaited<ReturnType<typeof getProfile>>;

export type FollowUpItem = {
  id: string;
  name: string;
  category: "First timer" | "Absent";
  lastAttendance: string | null;
  phone: string | null;
  /** For linking to profile */
  personId: string;
};

export type FollowUpFilters = {
  category?: "first_timers" | "absent" | null;
  search?: string | null;
};

/**
 * First timers: guests who attended in the last 7 days.
 * Absent members: active members (in profile's scope) with no attendance in the last 2 weeks.
 */
export async function getFollowUpList(
  profile: Profile,
  filters: FollowUpFilters = {}
): Promise<FollowUpItem[]> {
  if (!profile) return [];

  const isZonalLeader = profile.role === "zonal_leader";
  const zoneId = profile.zoneId ?? null;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysIso = sevenDaysAgo.toISOString().slice(0, 10);
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const twoWeeksIso = twoWeeksAgo.toISOString().slice(0, 10);

  const items: FollowUpItem[] = [];

  // First timers: distinct guests with attendance in last 7 days
  if (filters.category !== "absent") {
    const guestConditions = [gte(events.date, sevenDaysIso)];
    if (isZonalLeader && zoneId) {
      guestConditions.push(eq(attendance.zoneId, zoneId));
    }
    const firstTimerGuests = await db
      .select({
        guestId: attendance.guestId,
        lastDate: sql<string>`max(${events.date})::text`.as("last_date"),
      })
      .from(attendance)
      .innerJoin(events, eq(attendance.eventId, events.id))
      .where(and(...guestConditions, sql`${attendance.guestId} is not null`))
      .groupBy(attendance.guestId);

    const guestIds = firstTimerGuests.map((r) => r.guestId!).filter(Boolean);
    if (guestIds.length > 0) {
      const guestRows = await db
        .select({
          id: guests.id,
          firstName: guests.firstName,
          lastName: guests.lastName,
          phoneNumber: guests.phoneNumber,
        })
        .from(guests)
        .where(inArray(guests.id, guestIds));

      const lastByGuest = new Map(firstTimerGuests.map((r) => [r.guestId!, r.lastDate ?? null]));
      for (const g of guestRows) {
        items.push({
          id: `guest-${g.id}`,
          personId: g.id,
          name: `${g.firstName} ${g.lastName}`.trim(),
          category: "First timer",
          lastAttendance: lastByGuest.get(g.id) ?? null,
          phone: g.phoneNumber ?? null,
        });
      }
    }
  }

  // Absent: members with no attendance in last 2 weeks
  if (filters.category !== "first_timers") {
    const memberConditions = [eq(users.role, "member"), eq(users.status, "active")];
    if (isZonalLeader && zoneId) {
      memberConditions.push(eq(users.zoneId, zoneId));
    }
    const [allMembers, attendedRows] = await Promise.all([
      db
        .select({ id: users.id, firstName: users.firstName, lastName: users.lastName, phoneNumber: users.phoneNumber })
        .from(users)
        .where(and(...memberConditions)),
      db
        .select({ userId: attendance.userId })
        .from(attendance)
        .innerJoin(events, eq(attendance.eventId, events.id))
        .where(gte(events.date, twoWeeksIso)),
    ]);
    const attendedInTwoWeeks = new Set(attendedRows.map((r) => r.userId).filter(Boolean));

    for (const m of allMembers) {
      if (attendedInTwoWeeks.has(m.id)) continue;
      items.push({
        id: `member-${m.id}`,
        personId: m.id,
        name: `${m.firstName} ${m.lastName}`.trim(),
        category: "Absent",
        lastAttendance: null,
        phone: m.phoneNumber ?? null,
      });
    }
  }

  // Apply search filter
  const search = filters.search?.trim().toLowerCase();
  if (search) {
    return items.filter((i) => i.name.toLowerCase().includes(search));
  }
  return items;
}
