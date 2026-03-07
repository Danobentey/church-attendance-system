import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/app/lib/db";
import { attendance, events, guests, users, zones } from "@/app/lib/db/schema";
import type { getProfile } from "@/app/lib/auth";

type Profile = Awaited<ReturnType<typeof getProfile>>;

export type PersonProfile = {
  id: string;
  type: "member" | "guest";
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string | null;
  email: string | null;
  address: string | null;
  zoneId: string | null;
  zoneName: string | null;
  zoneIdentifier: string | null;
  role: string | null;
  status: string | null;
  congregation: string | null;
  lastAttendance: string | null;
};

/**
 * Returns a person by ID (member from users or guest from guests).
 * Enforces permission: admin/secretariat see all; zonal_leader sees own-zone members and any guest.
 */
export async function getPersonById(
  profile: Profile,
  personId: string
): Promise<PersonProfile | null> {
  if (!profile) return null;

  const isZonalLeader = profile.role === "zonal_leader";
  const zoneId = profile.zoneId ?? null;

  // Try users (members + staff) first
  const userRows = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      phoneNumber: users.phoneNumber,
      email: users.email,
      address: users.address,
      zoneId: users.zoneId,
      zoneName: zones.name,
      zoneIdentifier: users.zoneIdentifier,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .leftJoin(zones, eq(users.zoneId, zones.id))
    .where(eq(users.id, personId))
    .limit(1);

  if (userRows.length > 0) {
    const u = userRows[0];
    if (isZonalLeader && zoneId && u.zoneId !== zoneId) {
      return null;
    }
    const lastDate = await db
      .select({
        lastDate: sql<string>`max(${events.date})::text`.as("last_date"),
      })
      .from(attendance)
      .innerJoin(events, eq(attendance.eventId, events.id))
      .where(eq(attendance.userId, personId))
      .then((rows) => rows[0]?.lastDate ?? null);

    return {
      id: u.id,
      type: "member",
      firstName: u.firstName,
      lastName: u.lastName,
      fullName: `${u.firstName} ${u.lastName}`.trim(),
      phoneNumber: u.phoneNumber,
      email: u.email ?? null,
      address: u.address ?? null,
      zoneId: u.zoneId ?? null,
      zoneName: u.zoneName ?? null,
      zoneIdentifier: u.zoneIdentifier ?? null,
      role: u.role,
      status: u.status,
      congregation: null,
      lastAttendance: lastDate,
    };
  }

  // Try guests
  const guestRows = await db
    .select({
      id: guests.id,
      firstName: guests.firstName,
      lastName: guests.lastName,
      phoneNumber: guests.phoneNumber,
      email: guests.email,
      address: guests.address,
      congregation: guests.congregation,
    })
    .from(guests)
    .where(eq(guests.id, personId))
    .limit(1);

  if (guestRows.length > 0) {
    const g = guestRows[0];
    const lastDate = await db
      .select({
        lastDate: sql<string>`max(${events.date})::text`.as("last_date"),
      })
      .from(attendance)
      .innerJoin(events, eq(attendance.eventId, events.id))
      .where(eq(attendance.guestId, personId))
      .then((rows) => rows[0]?.lastDate ?? null);

    return {
      id: g.id,
      type: "guest",
      firstName: g.firstName,
      lastName: g.lastName,
      fullName: `${g.firstName} ${g.lastName}`.trim(),
      phoneNumber: g.phoneNumber ?? null,
      email: g.email ?? null,
      address: g.address ?? null,
      zoneId: null,
      zoneName: null,
      zoneIdentifier: null,
      role: null,
      status: null,
      congregation: g.congregation ?? null,
      lastAttendance: lastDate,
    };
  }

  return null;
}

export type AttendanceHistoryEntry = {
  date: string;
  serviceName: string;
  checkInTime: string;
};

export type PersonAttendanceHistory = {
  entries: AttendanceHistoryEntry[];
  totalCount: number;
  lastAttended: string | null;
  frequencyLabel: string;
};

/**
 * Returns attendance history for a person (member or guest). Permission same as getPersonById.
 */
export async function getPersonAttendanceHistory(
  profile: Profile,
  personId: string
): Promise<{ person: PersonProfile | null; history: PersonAttendanceHistory | null }> {
  const person = await getPersonById(profile, personId);
  if (!person) return { person: null, history: null };

  const isMember = person.type === "member";
  const rows = await db
    .select({
      eventDate: events.date,
      eventName: events.name,
      timestamp: attendance.timestamp,
    })
    .from(attendance)
    .innerJoin(events, eq(attendance.eventId, events.id))
    .where(
      isMember ? eq(attendance.userId, personId) : eq(attendance.guestId, personId)
    )
    .orderBy(desc(events.date), desc(attendance.timestamp));

  const entries: AttendanceHistoryEntry[] = rows.map((r) => ({
    date: r.eventDate ?? "",
    serviceName: r.eventName ?? "—",
    checkInTime: r.timestamp
      ? new Date(r.timestamp).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—",
  }));

  const totalCount = entries.length;
  const lastAttended = person.lastAttendance;
  let frequencyLabel = "—";
  if (totalCount > 0 && lastAttended) {
    if (totalCount >= 4) frequencyLabel = "Regular";
    else if (totalCount >= 2) frequencyLabel = "Occasional";
    else frequencyLabel = "Once";
  }

  return {
    person,
    history: {
      entries,
      totalCount,
      lastAttended,
      frequencyLabel,
    },
  };
}
