import { and, desc, eq, gte, ilike, isNotNull, lte, or } from "drizzle-orm";
import { db } from "@/app/lib/db";
import { attendance, events, guests, users } from "@/app/lib/db/schema";
import type { getProfile } from "@/app/lib/auth";

type Profile = Awaited<ReturnType<typeof getProfile>>;

export type AttendanceLogRow = {
  id: string;
  name: string;
  type: "Member" | "Guest";
  personId: string;
  service: string;
  eventDate: string;
  checkInTime: string;
  eventId: string;
};

export type AttendanceLogFilters = {
  dateFrom: string;
  dateTo: string;
  eventId?: string | null;
  type?: "member" | "guest" | null;
  search?: string | null;
};

/**
 * Returns attendance records for the log. Scoped by RLS; zonal_leader sees only their zone.
 */
export async function getAttendanceLog(
  profile: Profile,
  filters: AttendanceLogFilters
): Promise<AttendanceLogRow[]> {
  if (!profile) return [];

  const isZonalLeader = profile.role === "zonal_leader";
  const zoneId = profile.zoneId ?? null;

  const conditions = [
    gte(events.date, filters.dateFrom),
    lte(events.date, filters.dateTo),
  ];
  if (isZonalLeader && zoneId) {
    conditions.push(eq(attendance.zoneId, zoneId));
  }
  if (filters.eventId) {
    conditions.push(eq(attendance.eventId, filters.eventId));
  }
  if (filters.type === "member") {
    conditions.push(isNotNull(attendance.userId));
  }
  if (filters.type === "guest") {
    conditions.push(isNotNull(attendance.guestId));
  }

  const searchTrimmed = filters.search?.trim();
  if (searchTrimmed) {
    const term = `%${searchTrimmed}%`;
    conditions.push(
      or(
        ilike(users.firstName, term),
        ilike(users.lastName, term),
        ilike(guests.firstName, term),
        ilike(guests.lastName, term)
      )!
    );
  }

  const rows = await db
    .select({
      id: attendance.id,
      eventId: attendance.eventId,
      eventName: events.name,
      eventDate: events.date,
      timestamp: attendance.timestamp,
      userId: attendance.userId,
      guestId: attendance.guestId,
      userFirstName: users.firstName,
      userLastName: users.lastName,
      guestFirstName: guests.firstName,
      guestLastName: guests.lastName,
    })
    .from(attendance)
    .innerJoin(events, eq(attendance.eventId, events.id))
    .leftJoin(users, eq(attendance.userId, users.id))
    .leftJoin(guests, eq(attendance.guestId, guests.id))
    .where(and(...conditions))
    .orderBy(desc(events.date), desc(attendance.timestamp));

  return rows.map((r) => {
    const isMember = r.userId != null;
    const name = isMember
      ? `${r.userFirstName ?? ""} ${r.userLastName ?? ""}`.trim() || "—"
      : `${r.guestFirstName ?? ""} ${r.guestLastName ?? ""}`.trim() || "—";
    return {
      id: r.id,
      name,
      type: isMember ? ("Member" as const) : ("Guest" as const),
      personId: (r.userId ?? r.guestId) ?? "",
      service: r.eventName ?? "—",
      eventDate: r.eventDate ?? "",
      checkInTime: r.timestamp
        ? new Date(r.timestamp).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
      eventId: r.eventId ?? "",
    };
  });
}
