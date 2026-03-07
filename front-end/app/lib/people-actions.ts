"use server";

import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db";
import { users, guests } from "@/app/lib/db/schema";
import { getProfile } from "@/app/lib/auth";
import { getPersonById } from "@/app/lib/person";
import { generateZoneIdentifier } from "@/app/lib/zone-identifier";
import { logAuditEvent } from "@/app/lib/audit";

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
    await logAuditEvent(profile.id, "member_created", { targetType: "member", targetId: user.id });
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
    await logAuditEvent(profile.id, "guest_created", { targetType: "guest", targetId: guest.id });
    return { ok: true, guestId: guest.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create guest.";
    return { ok: false, error: message };
  }
}

export type UpdatePersonInput = {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  congregation?: string;
  zoneId?: string;
};

export type UpdatePersonResult = { ok: true } | { ok: false; error: string };

/**
 * Updates a person (member or guest). Admin can edit anyone; secretariat can edit anyone;
 * zonal_leader can edit own-zone members and any guest.
 */
export async function updatePersonAction(
  personId: string,
  input: UpdatePersonInput
): Promise<UpdatePersonResult> {
  try {
    const profile = await getProfile();
    if (!profile) {
      return { ok: false, error: "You must be logged in to update a person." };
    }

    const person = await getPersonById(profile, personId);
    if (!person) {
      return { ok: false, error: "Person not found or you do not have permission to edit them." };
    }

    const firstName = input.firstName?.trim();
    const lastName = input.lastName?.trim();
    if (!firstName || !lastName) {
      return { ok: false, error: "First name and last name are required." };
    }

    if (person.type === "member") {
      const phoneNumber = input.phoneNumber?.trim();
      if (!phoneNumber) {
        return { ok: false, error: "Phone number is required for members." };
      }
      await db
        .update(users)
        .set({
          firstName,
          lastName,
          phoneNumber,
          email: input.email?.trim() || undefined,
          address: input.address?.trim() || undefined,
          zoneId: input.zoneId || person.zoneId || undefined,
        })
        .where(eq(users.id, personId));
    } else {
      await db
        .update(guests)
        .set({
          firstName,
          lastName,
          phoneNumber: input.phoneNumber?.trim() || undefined,
          email: input.email?.trim() || undefined,
          address: input.address?.trim() || undefined,
          congregation: input.congregation?.trim() || undefined,
        })
        .where(eq(guests.id, personId));
    }

    await logAuditEvent(profile.id, "member_updated", { targetType: person.type, targetId: personId });
    revalidatePath(`/people/${personId}`);
    revalidatePath(`/people/${personId}/edit`);
    revalidatePath("/members");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update person.";
    return { ok: false, error: message };
  }
}
