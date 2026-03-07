import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/app/lib/db";
import { attendance, events, users, zones } from "@/app/lib/db/schema";
import type { getProfile } from "@/app/lib/auth";

type Profile = Awaited<ReturnType<typeof getProfile>>;

export type WeeklyAttendanceRow = {
  eventName: string;
  eventDate: string;
  zoneName: string | null;
  total: number;
};

export async function getWeeklyAttendanceReport(
  profile: Profile,
  weekStartIso: string
): Promise<WeeklyAttendanceRow[]> {
  if (!profile) return [];
  const start = new Date(weekStartIso);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const weekEndIso = end.toISOString().slice(0, 10);

  const isZonalLeader = profile.role === "zonal_leader";
  const zoneId = profile.zoneId ?? null;

  const conditions = [gte(events.date, weekStartIso), lte(events.date, weekEndIso)];
  if (isZonalLeader && zoneId) {
    conditions.push(eq(attendance.zoneId, zoneId));
  }

  const rows = await db
    .select({
      eventName: events.name,
      eventDate: events.date,
      zoneName: zones.name,
      total: sql<number>`count(*)::int`.as("total"),
    })
    .from(attendance)
    .innerJoin(events, eq(attendance.eventId, events.id))
    .leftJoin(zones, eq(attendance.zoneId, zones.id))
    .where(and(...conditions))
    .groupBy(events.id, events.name, events.date, zones.id, zones.name)
    .orderBy(events.date, zones.name);

  return rows.map((r) => ({
    eventName: r.eventName ?? "—",
    eventDate: r.eventDate ?? "",
    zoneName: r.zoneName ?? null,
    total: r.total,
  }));
}

export type MonthlyGrowthRow = {
  metric: string;
  value: number;
};

export async function getMonthlyGrowthReport(
  profile: Profile,
  monthIso: string
): Promise<MonthlyGrowthRow[]> {
  if (!profile) return [];
  const [year, month] = monthIso.split("-").map(Number);
  const monthStart = `${monthIso}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const monthEnd = `${monthIso}-${String(lastDay).padStart(2, "0")}`;

  const isZonalLeader = profile.role === "zonal_leader";
  const zoneId = profile.zoneId ?? null;

  const memberConditions = [eq(users.role, "member"), eq(users.status, "active")];
  if (isZonalLeader && zoneId) {
    memberConditions.push(eq(users.zoneId, zoneId));
  }
  const totalMembersResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(and(...memberConditions));
  const totalMembers = totalMembersResult[0]?.count ?? 0;

  const newMembersConditions = [
    eq(users.role, "member"),
    gte(users.createdAt, new Date(monthStart)),
    lte(users.createdAt, new Date(monthEnd + "T23:59:59.999Z")),
  ];
  if (isZonalLeader && zoneId) {
    newMembersConditions.push(eq(users.zoneId, zoneId));
  }
  const newMembersResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(and(...newMembersConditions));
  const newMembers = newMembersResult[0]?.count ?? 0;

  const attConditions = [gte(events.date, monthStart), lte(events.date, monthEnd)];
  if (isZonalLeader && zoneId) {
    attConditions.push(eq(attendance.zoneId, zoneId));
  }
  const attendanceTotalResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(attendance)
    .innerJoin(events, eq(attendance.eventId, events.id))
    .where(and(...attConditions));
  const attendanceTotal = attendanceTotalResult[0]?.count ?? 0;

  return [
    { metric: "Total active members", value: totalMembers },
    { metric: "New members this month", value: newMembers },
    { metric: "Total attendance (month)", value: attendanceTotal },
  ];
}

export type DepartmentalRow = {
  zoneName: string;
  total: number;
};

export async function getDepartmentalReport(
  profile: Profile,
  dateFrom: string,
  dateTo: string
): Promise<DepartmentalRow[]> {
  if (!profile) return [];

  const isZonalLeader = profile.role === "zonal_leader";
  const zoneId = profile.zoneId ?? null;

  const conditions = [gte(events.date, dateFrom), lte(events.date, dateTo)];
  if (isZonalLeader && zoneId) {
    conditions.push(eq(attendance.zoneId, zoneId));
  }

  const rows = await db
    .select({
      zoneName: zones.name,
      total: sql<number>`count(*)::int`.as("total"),
    })
    .from(attendance)
    .innerJoin(events, eq(attendance.eventId, events.id))
    .leftJoin(zones, eq(attendance.zoneId, zones.id))
    .where(and(...conditions))
    .groupBy(zones.id, zones.name)
    .orderBy(zones.name);

  return rows.map((r) => ({
    zoneName: r.zoneName ?? "—",
    total: r.total,
  }));
}
