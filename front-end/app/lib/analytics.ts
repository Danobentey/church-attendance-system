import { and, eq, gte, isNotNull, lte, sql } from "drizzle-orm";
import { db } from "@/app/lib/db";
import { attendance, events, users } from "@/app/lib/db/schema";
import type { getProfile } from "@/app/lib/auth";

type Profile = Awaited<ReturnType<typeof getProfile>>;

export type DateRangeKey = "4weeks" | "3months" | "ytd";

function getDateRange(range: DateRangeKey): { from: string; to: string; prevFrom: string; prevTo: string } {
  const to = new Date();
  const toIso = to.toISOString().slice(0, 10);
  let from: Date;
  let prevFrom: Date;
  let prevTo: Date;

  if (range === "4weeks") {
    from = new Date(to);
    from.setDate(from.getDate() - 28);
    prevTo = new Date(from);
    prevTo.setDate(prevTo.getDate() - 1);
    prevFrom = new Date(prevTo);
    prevFrom.setDate(prevFrom.getDate() - 28);
  } else if (range === "3months") {
    from = new Date(to);
    from.setMonth(from.getMonth() - 3);
    prevTo = new Date(from);
    prevTo.setDate(prevTo.getDate() - 1);
    prevFrom = new Date(prevTo);
    prevFrom.setMonth(prevFrom.getMonth() - 3);
  } else {
    from = new Date(to.getFullYear(), 0, 1);
    prevTo = new Date(from);
    prevTo.setDate(prevTo.getDate() - 1);
    prevFrom = new Date(prevTo.getFullYear(), 0, 1);
  }

  return {
    from: from.toISOString().slice(0, 10),
    to: toIso,
    prevFrom: prevFrom.toISOString().slice(0, 10),
    prevTo: prevTo.toISOString().slice(0, 10),
  };
}

export type AnalyticsStats = {
  averageAttendance: number;
  growthTrendPercent: number | null;
  firstTimeVisitors: number;
  retentionRatePercent: number | null;
};

export async function getAnalyticsStats(
  profile: Profile,
  range: DateRangeKey
): Promise<AnalyticsStats> {
  if (!profile) {
    return { averageAttendance: 0, growthTrendPercent: null, firstTimeVisitors: 0, retentionRatePercent: null };
  }

  const { from, to, prevFrom, prevTo } = getDateRange(range);
  const isZonalLeader = profile.role === "zonal_leader";
  const zoneId = profile.zoneId ?? null;

  const baseConditions = [gte(events.date, from), lte(events.date, to)];
  if (isZonalLeader && zoneId) {
    baseConditions.push(eq(attendance.zoneId, zoneId));
  }

  // Per-event attendance counts
  const eventCounts = await db
    .select({
      eventId: attendance.eventId,
      count: sql<number>`count(*)::int`.as("cnt"),
    })
    .from(attendance)
    .innerJoin(events, eq(attendance.eventId, events.id))
    .where(and(...baseConditions))
    .groupBy(attendance.eventId);

  const totalAttendance = eventCounts.reduce((sum, r) => sum + r.count, 0);
  const averageAttendance =
    eventCounts.length > 0 ? Math.round(totalAttendance / eventCounts.length) : 0;

  // Previous period total
  const prevConditions = [gte(events.date, prevFrom), lte(events.date, prevTo)];
  if (isZonalLeader && zoneId) {
    prevConditions.push(eq(attendance.zoneId, zoneId));
  }
  const prevTotalResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(attendance)
    .innerJoin(events, eq(attendance.eventId, events.id))
    .where(and(...prevConditions));
  const prevTotal = prevTotalResult[0]?.count ?? 0;
  const growthTrendPercent =
    prevTotal > 0 ? Math.round(((totalAttendance - prevTotal) / prevTotal) * 100) : null;

  // First-time visitors (guest attendance in period)
  const guestConditions = [...baseConditions, isNotNull(attendance.guestId)];
  const firstTimersResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(attendance)
    .innerJoin(events, eq(attendance.eventId, events.id))
    .where(and(...guestConditions));
  const firstTimeVisitors = firstTimersResult[0]?.count ?? 0;

  // Retention: active members who attended at least once in period / total active members
  const memberConditions = [eq(users.role, "member"), eq(users.status, "active")];
  if (isZonalLeader && zoneId) {
    memberConditions.push(eq(users.zoneId, zoneId));
  }
  const totalMembersResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(and(...memberConditions));
  const totalMembers = totalMembersResult[0]?.count ?? 0;

  const attendedInPeriodResult = await db
    .select({
      distinctUsers: sql<number>`count(distinct ${attendance.userId})::int`.as("d"),
    })
    .from(attendance)
    .innerJoin(events, eq(attendance.eventId, events.id))
    .where(and(...baseConditions, isNotNull(attendance.userId)));
  const attendedCount = attendedInPeriodResult[0]?.distinctUsers ?? 0;
  const retentionRatePercent =
    totalMembers > 0 ? Math.round((attendedCount / totalMembers) * 100) : null;

  return {
    averageAttendance,
    growthTrendPercent,
    firstTimeVisitors,
    retentionRatePercent,
  };
}

export type WeekBar = { label: string; total: number };

export async function getAttendanceOverTime(
  profile: Profile,
  range: DateRangeKey
): Promise<WeekBar[]> {
  if (!profile) return [];

  const { from, to } = getDateRange(range);
  const isZonalLeader = profile.role === "zonal_leader";
  const zoneId = profile.zoneId ?? null;

  const conditions = [gte(events.date, from), lte(events.date, to)];
  if (isZonalLeader && zoneId) {
    conditions.push(eq(attendance.zoneId, zoneId));
  }

  const rows = await db
    .select({
      date: events.date,
      count: sql<number>`count(*)::int`.as("cnt"),
    })
    .from(attendance)
    .innerJoin(events, eq(attendance.eventId, events.id))
    .where(and(...conditions))
    .groupBy(events.date)
    .orderBy(events.date);

  return rows.map((r) => ({
    label: r.date ?? "",
    total: r.count,
  }));
}

export type FirstTimersVsReturningBar = { label: string; guests: number; members: number };

export async function getFirstTimersVsReturning(
  profile: Profile,
  range: DateRangeKey
): Promise<FirstTimersVsReturningBar[]> {
  if (!profile) return [];

  const { from, to } = getDateRange(range);
  const isZonalLeader = profile.role === "zonal_leader";
  const zoneId = profile.zoneId ?? null;

  const conditions = [gte(events.date, from), lte(events.date, to)];
  if (isZonalLeader && zoneId) {
    conditions.push(eq(attendance.zoneId, zoneId));
  }

  const rows = await db
    .select({
      date: events.date,
      guests: sql<number>`count(*) filter (where ${attendance.guestId} is not null)::int`.as("g"),
      members: sql<number>`count(*) filter (where ${attendance.userId} is not null)::int`.as("m"),
    })
    .from(attendance)
    .innerJoin(events, eq(attendance.eventId, events.id))
    .where(and(...conditions))
    .groupBy(events.date)
    .orderBy(events.date);

  return rows.map((r) => ({
    label: r.date ?? "",
    guests: r.guests,
    members: r.members,
  }));
}
