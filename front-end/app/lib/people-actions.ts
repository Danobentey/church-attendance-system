"use server";

import { randomUUID } from "crypto";
import { db } from "@/app/lib/db";
import { users, guests } from "@/app/lib/db/schema";
import { getProfile } from "@/app/lib/auth";
import { generateZoneIdentifier } from "@/app/lib/zone-identifier";

export type CreateMemberInput = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  zoneId: string;
  address?: string;
  dateOfBirth?: string;
  nextOfKin?: string;
};

export type CreateGuestInput = {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email?: string;
  congregation?: string;
  address?: string;
};

/**
 * Creates a member (no login). Inserts into public.users with a generated id and zone identifier.
 */
async function createMember(profile: CreateMemberInput) {
  const id = randomUUID();

  const zoneIdentifier = await generateZoneIdentifier(profile.zoneId);

  const [user] = await db
    .insert(users)
    .values({
      id,
      email: profile.email?.trim() || undefined,
      phoneNumber: profile.phoneNumber.trim(),
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      address: profile.address?.trim(),
      dateOfBirth: profile.dateOfBirth ?? undefined,
      nextOfKin: profile.nextOfKin?.trim(),
      role: "member",
      zoneId: profile.zoneId,
      zoneIdentifier,
      status: "active",
    })
    .returning();

  return user;
}

export type CreateMemberResult = { ok: true; userId: string } | { ok: false; error: string };
export type CreateGuestResult = { ok: true; guestId: string } | { ok: false; error: string };

/**
 * Server Action: create a new member. Zone is required for zone identifier.
 */
export async function createMemberAction(
  input: CreateMemberInput
): Promise<CreateMemberResult> {
  try {
    const profile = await getProfile();
    if (!profile) {
      return { ok: false, error: "You must be logged in to add a member." };
    }

    const firstName = input.firstName?.trim();
    const lastName = input.lastName?.trim();
    const phoneNumber = input.phoneNumber?.trim();

    if (!firstName || !lastName) {
      return { ok: false, error: "First name and last name are required." };
    }
    if (!phoneNumber) {
      return { ok: false, error: "Phone number is required." };
    }
    if (!input.zoneId) {
      return { ok: false, error: "Zone (Department / Unit) is required for members." };
    }

    const user = await createMember({
      ...input,
      firstName,
      lastName,
      phoneNumber,
    });

    return { ok: true, userId: user.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create member.";
    return { ok: false, error: message };
  }
}

/**
 * Server Action: create a new guest.
 */
export async function insertGuestAction(
  input: CreateGuestInput
): Promise<CreateGuestResult> {
  try {
    const profile = await getProfile();
    if (!profile) {
      return { ok: false, error: "You must be logged in to add a guest." };
    }

    const firstName = input.firstName?.trim();
    const lastName = input.lastName?.trim();

    if (!firstName || !lastName) {
      return { ok: false, error: "First name and last name are required." };
    }

    const [guest] = await db
      .insert(guests)
      .values({
        firstName,
        lastName,
        email: input.email?.trim() || undefined,
        phoneNumber: input.phoneNumber?.trim() || undefined,
        congregation: input.congregation?.trim() || undefined,
        address: input.address?.trim() || undefined,
      })
      .returning();

    return { ok: true, guestId: guest.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create guest.";
    return { ok: false, error: message };
  }
}
