import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { users } from "../db/schema";
import { createAdminClient } from "./supabase";
import { generateZoneIdentifier } from "./zone-identifier";

const LOGINABLE_ROLES = ["admin", "secretariat", "zonal_leader"] as const;
type LoginableRole = (typeof LOGINABLE_ROLES)[number];

function isLoginableRole(role: string): role is LoginableRole {
  return LOGINABLE_ROLES.includes(role as LoginableRole);
}

export type CreateLoginableUserProfile = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  zoneId?: string;
  address?: string;
  dateOfBirth?: string;
  nextOfKin?: string;
};

export type CreateMemberProfile = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  zoneId?: string;
  address?: string;
  dateOfBirth?: string;
  nextOfKin?: string;
};

/**
 * Creates a user who can log in (admin, secretariat, or zonal_leader).
 * Creates the Supabase Auth account then inserts a row into public.users with the same id.
 */
export async function createLoginableUser(
  email: string,
  password: string,
  role: "admin" | "secretariat" | "zonal_leader",
  profile: CreateLoginableUserProfile
) {
  if (!isLoginableRole(role)) {
    throw new Error(
      `Role must be one of: ${LOGINABLE_ROLES.join(", ")}. Got: ${role}`
    );
  }

  const supabase = createAdminClient();

  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) {
    throw new Error(`Failed to create auth user: ${authError.message}`);
  }

  if (!authUser.user) {
    throw new Error("Auth user not returned");
  }

  const id = authUser.user.id;

  let zoneIdentifier: string | undefined;
  if (profile.zoneId) {
    zoneIdentifier = await generateZoneIdentifier(profile.zoneId);
  }

  const [user] = await db
    .insert(users)
    .values({
      id,
      email,
      phoneNumber: profile.phoneNumber,
      firstName: profile.firstName,
      lastName: profile.lastName,
      address: profile.address,
      dateOfBirth: profile.dateOfBirth ?? undefined,
      nextOfKin: profile.nextOfKin,
      role,
      zoneId: profile.zoneId,
      zoneIdentifier,
      status: "active",
    })
    .returning();

  return user;
}

/**
 * Creates a member (no login). Inserts only into public.users with a generated id.
 */
export async function createMember(profile: CreateMemberProfile) {
  const id = randomUUID();

  let zoneIdentifier: string | undefined;
  if (profile.zoneId) {
    zoneIdentifier = await generateZoneIdentifier(profile.zoneId);
  }

  const [user] = await db
    .insert(users)
    .values({
      id,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      firstName: profile.firstName,
      lastName: profile.lastName,
      address: profile.address,
      dateOfBirth: profile.dateOfBirth ?? undefined,
      nextOfKin: profile.nextOfKin,
      role: "member",
      zoneId: profile.zoneId,
      zoneIdentifier,
      status: "active",
    })
    .returning();

  return user;
}

/**
 * Fetches the user profile from public.users by auth user id (e.g. JWT sub).
 */
export async function getUserProfile(authUserId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUserId))
    .limit(1);

  return user ?? null;
}

/**
 * Removes a loginable user from both Supabase Auth and public.users.
 */
export async function deleteLoginableUser(userId: string) {
  const supabase = createAdminClient();

  const { error: authError } = await supabase.auth.admin.deleteUser(userId);

  if (authError) {
    throw new Error(`Failed to delete auth user: ${authError.message}`);
  }

  await db.delete(users).where(eq(users.id, userId));
}
