import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/app/lib/db";
import { auditLog, users } from "@/app/lib/db/schema";
import type { getProfile } from "@/app/lib/auth";

type Profile = Awaited<ReturnType<typeof getProfile>>;

export type AuditAction =
  | "login"
  | "check_in"
  | "member_created"
  | "member_updated"
  | "guest_created"
  | "zone_created"
  | "event_created"
  | "export"
  | "user_created"
  | "user_deactivated";

export async function logAuditEvent(
  userId: string | null,
  action: AuditAction,
  options?: {
    targetType?: string;
    targetId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
  }
): Promise<void> {
  try {
    await db.insert(auditLog).values({
      userId: userId ?? undefined,
      action,
      targetType: options?.targetType ?? undefined,
      targetId: options?.targetId ?? undefined,
      metadata: options?.metadata ?? undefined,
      ipAddress: options?.ipAddress ?? undefined,
    });
  } catch {
    // Don't fail the main action if audit write fails
  }
}

/**
 * Call after successful login to record the login event. Used from client after signInWithPassword.
 */

export type AuditLogRow = {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  userDisplay: string | null;
  createdAt: string;
  ipAddress: string | null;
};

export type AuditLogFilters = {
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  action?: AuditAction;
};

export async function getAuditLog(
  profile: Profile,
  filters: AuditLogFilters = {}
): Promise<AuditLogRow[]> {
  if (!profile) return [];
  if (profile.role !== "admin") return [];

  const conditions = [sql`1=1`];
  if (filters.dateFrom) {
    conditions.push(gte(auditLog.createdAt, new Date(filters.dateFrom + "T00:00:00Z")));
  }
  if (filters.dateTo) {
    conditions.push(lte(auditLog.createdAt, new Date(filters.dateTo + "T23:59:59.999Z")));
  }
  if (filters.userId) {
    conditions.push(eq(auditLog.userId, filters.userId));
  }
  if (filters.action) {
    conditions.push(eq(auditLog.action, filters.action));
  }

  const rows = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      targetType: auditLog.targetType,
      targetId: auditLog.targetId,
      createdAt: auditLog.createdAt,
      ipAddress: auditLog.ipAddress,
      userId: auditLog.userId,
      userFirstName: users.firstName,
      userLastName: users.lastName,
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(auditLog.createdAt))
    .limit(500);

  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    targetType: r.targetType,
    targetId: r.targetId,
    userDisplay:
      r.userFirstName != null && r.userLastName != null
        ? `${r.userFirstName} ${r.userLastName}`.trim()
        : r.userId ?? "—",
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : "",
    ipAddress: r.ipAddress ?? null,
  }));
}
