"use server";

import { eq, inArray, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db";
import { users, zones } from "@/app/lib/db/schema";
import { getProfile } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { generateZoneIdentifier } from "@/app/lib/zone-identifier";
import { CreateLoginableUserSchema, formatZodError } from "@/app/lib/validation";

export type LoginableRole = "admin" | "secretariat" | "zonal_leader";

export type CreateLoginableUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: LoginableRole;
  zoneId?: string;
};

export type UserListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string;
  role: string;
  status: string;
  zoneName: string | null;
  createdAt: string | null;
};

export type CreateUserResult = { ok: true; userId: string } | { ok: false; error: string };
export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Server Action: list all loginable users (admin, secretariat, zonal_leader).
 * Admin-only.
 */
export async function listLoginableUsersAction(): Promise<UserListItem[]> {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") return [];

  const rows = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      phoneNumber: users.phoneNumber,
      role: users.role,
      status: users.status,
      zoneId: users.zoneId,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(inArray(users.role, ["admin", "secretariat", "zonal_leader"]))
    .orderBy(desc(users.createdAt));

  const zoneIds = [...new Set(rows.map((r) => r.zoneId).filter(Boolean))] as string[];
  const zoneMap: Record<string, string> = {};

  if (zoneIds.length > 0) {
    const zoneRows = await db
      .select({ id: zones.id, name: zones.name })
      .from(zones)
      .where(inArray(zones.id, zoneIds));
    zoneRows.forEach((z) => (zoneMap[z.id] = z.name));
  }

  return rows.map((r) => ({
    id: r.id,
    firstName: r.firstName,
    lastName: r.lastName,
    email: r.email ?? null,
    phoneNumber: r.phoneNumber,
    role: r.role,
    status: r.status,
    zoneName: r.zoneId ? (zoneMap[r.zoneId] ?? null) : null,
    createdAt: r.createdAt ? r.createdAt.toISOString() : null,
  }));
}

/**
 * Server Action: create a new loginable user (admin, secretariat, zonal_leader).
 * Admin-only. Creates both the Supabase Auth account and the public.users row.
 */
export async function createLoginableUserAction(
  input: CreateLoginableUserInput
): Promise<CreateUserResult> {
  try {
    const profile = await getProfile();
    if (!profile) return { ok: false, error: "You must be logged in." };
    if (profile.role !== "admin") return { ok: false, error: "Only admins can create users." };

    const trimmed = {
      firstName: input.firstName?.trim() ?? "",
      lastName: input.lastName?.trim() ?? "",
      email: input.email?.trim() ?? "",
      password: input.password ?? "",
      phoneNumber: input.phoneNumber?.trim() ?? "",
      role: input.role,
      zoneId: input.zoneId?.trim() ?? "",
    };

    const parsed = CreateLoginableUserSchema.safeParse(trimmed);
    if (!parsed.success) {
      return { ok: false, error: formatZodError(parsed.error) };
    }

    const supabase = createAdminClient();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
    });

    if (authError) {
      return { ok: false, error: authError.message };
    }
    if (!authData.user) {
      return { ok: false, error: "Failed to create auth account." };
    }

    const id = authData.user.id;
    const zoneId = parsed.data.zoneId || undefined;

    let zoneIdentifier: string | undefined;
    if (zoneId) {
      zoneIdentifier = await generateZoneIdentifier(zoneId);
    }

    const [user] = await db
      .insert(users)
      .values({
        id,
        email: parsed.data.email,
        phoneNumber: parsed.data.phoneNumber,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        role: parsed.data.role,
        zoneId: zoneId || null,
        zoneIdentifier,
        status: "active",
      })
      .returning({ id: users.id });

    await logAuditEvent(profile.id, "user_created", { targetType: "user", targetId: user.id });
    revalidatePath("/settings/users");
    return { ok: true, userId: user.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create user.";
    return { ok: false, error: message };
  }
}

/**
 * Server Action: deactivate a loginable user.
 * Admin-only. Also revokes their active sessions.
 */
export async function deactivateUserAction(userId: string): Promise<ActionResult> {
  try {
    const profile = await getProfile();
    if (!profile) return { ok: false, error: "You must be logged in." };
    if (profile.role !== "admin") return { ok: false, error: "Only admins can deactivate users." };
    if (userId === profile.id) return { ok: false, error: "You cannot deactivate your own account." };

    const supabase = createAdminClient();
    await supabase.auth.admin.signOut(userId, "others");

    await db.update(users).set({ status: "inactive" }).where(eq(users.id, userId));

    await logAuditEvent(profile.id, "user_deactivated", { targetType: "user", targetId: userId });
    revalidatePath("/settings/users");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to deactivate user.";
    return { ok: false, error: message };
  }
}

/**
 * Server Action: reactivate a previously deactivated user.
 * Admin-only.
 */
export async function reactivateUserAction(userId: string): Promise<ActionResult> {
  try {
    const profile = await getProfile();
    if (!profile) return { ok: false, error: "You must be logged in." };
    if (profile.role !== "admin") return { ok: false, error: "Only admins can reactivate users." };

    await db.update(users).set({ status: "active" }).where(eq(users.id, userId));

    revalidatePath("/settings/users");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to reactivate user.";
    return { ok: false, error: message };
  }
}
