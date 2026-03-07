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

  const [
    totalAttendanceTodayResult,
    firstTimersTodayResult,
    membersResult,
    guestsResult,
  ] = await Promise.all([
    // Total attendance today
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(attendance)
      .innerJoin(events, eq(attendance.eventId, events.id))
      .where(
        isZonalLeader && zoneId
          ? and(eq(events.date, today), eq(attendance.zoneId, zoneId))
          : eq(events.date, today)
      ),
    // First timers today (guest attendance)
    db
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
      ),
    // Members count
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(
        isZonalLeader && zoneId
          ? and(eq(users.role, "member"), eq(users.zoneId, zoneId))
          : eq(users.role, "member")
      ),
    // Guests count (total; no zone on guests table)
    db.select({ count: sql<number>`count(*)::int` }).from(guests),
  ]);

  return {
    totalAttendanceToday: totalAttendanceTodayResult[0]?.count ?? 0,
    firstTimersToday: firstTimersTodayResult[0]?.count ?? 0,
    membersCount: membersResult[0]?.count ?? 0,
    guestsCount: guestsResult[0]?.count ?? 0,
  };
}
