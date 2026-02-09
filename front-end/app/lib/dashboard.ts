import { and, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "@/app/lib/db";
import { attendance, events, guests, users } from "@/app/lib/db/schema";
import type { getProfile } from "@/app/lib/auth";

type Profile = Awaited<ReturnType<typeof getProfile>>;

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export type DashboardStats = {
  totalAttendanceToday: number;
  firstTimersToday: number;
  membersCount: number;
  guestsCount: number;
};

/**
 * Returns dashboard counts scoped by role: admin/secretariat see all;
 * zonal leader sees only their zone.
 */
export async function getDashboardStats(
  profile: Profile
): Promise<DashboardStats> {
  const today = todayIsoDate();
  const isZonalLeader = profile?.role === "zonal_leader";
  const zoneId = profile?.zoneId ?? null;

  // Total attendance today (attendance for events with date = today)
  const totalAttendanceTodayResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(attendance)
    .innerJoin(events, eq(attendance.eventId, events.id))
    .where(
      isZonalLeader && zoneId
        ? and(eq(events.date, today), eq(attendance.zoneId, zoneId))
        : eq(events.date, today)
    );
  const totalAttendanceToday = totalAttendanceTodayResult[0]?.count ?? 0;

  // First timers today (guest attendance for today's events)
  const firstTimersTodayResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(attendance)
    .innerJoin(events, eq(attendance.eventId, events.id))
    .where(
      isZonalLeader && zoneId
        ? and(
            eq(events.date, today),
            eq(attendance.zoneId, zoneId),
            isNotNull(attendance.guestId)
          )
        : and(eq(events.date, today), isNotNull(attendance.guestId))
    );
  const firstTimersToday = firstTimersTodayResult[0]?.count ?? 0;

  // Members count
  const membersResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(
      isZonalLeader && zoneId
        ? and(eq(users.role, "member"), eq(users.zoneId, zoneId))
        : eq(users.role, "member")
    );
  const membersCount = membersResult[0]?.count ?? 0;

  // Guests count (total; no zone on guests table)
  const guestsResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(guests);
  const guestsCount = guestsResult[0]?.count ?? 0;

  return {
    totalAttendanceToday,
    firstTimersToday,
    membersCount,
    guestsCount,
  };
}
