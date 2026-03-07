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
import {
  CreateMemberSchema,
  CreateGuestSchema,
  UpdatePersonSchema,
  formatZodError,
} from "@/app/lib/validation";

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

    // Trim before validation so length checks are accurate
    const trimmed = {
      firstName: input.firstName?.trim() ?? "",
      lastName: input.lastName?.trim() ?? "",
      phoneNumber: input.phoneNumber?.trim() ?? "",
      email: input.email?.trim() ?? "",
      zoneId: input.zoneId?.trim() ?? "",
      address: input.address?.trim() ?? "",
      dateOfBirth: input.dateOfBirth?.trim() ?? "",
      nextOfKin: input.nextOfKin?.trim() ?? "",
    };

    const parsed = CreateMemberSchema.safeParse(trimmed);
    if (!parsed.success) {
      return { ok: false, error: formatZodError(parsed.error) };
    }

    const user = await createMember({
      ...input,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phoneNumber: parsed.data.phoneNumber,
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

    const trimmed = {
      firstName: input.firstName?.trim() ?? "",
      lastName: input.lastName?.trim() ?? "",
      phoneNumber: input.phoneNumber?.trim() ?? "",
      email: input.email?.trim() ?? "",
      congregation: input.congregation?.trim() ?? "",
      address: input.address?.trim() ?? "",
    };

    const parsed = CreateGuestSchema.safeParse(trimmed);
    if (!parsed.success) {
      return { ok: false, error: formatZodError(parsed.error) };
    }

    const [guest] = await db
      .insert(guests)
      .values({
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email || undefined,
        phoneNumber: parsed.data.phoneNumber || undefined,
        congregation: parsed.data.congregation || undefined,
        address: parsed.data.address || undefined,
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

    // Validate personId is a UUID to prevent path traversal / injection
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(personId)) {
      return { ok: false, error: "Invalid person ID." };
    }

    const person = await getPersonById(profile, personId);
    if (!person) {
      return { ok: false, error: "Person not found or you do not have permission to edit them." };
    }

    const trimmed = {
      firstName: input.firstName?.trim() ?? "",
      lastName: input.lastName?.trim() ?? "",
      phoneNumber: input.phoneNumber?.trim() ?? "",
      email: input.email?.trim() ?? "",
      address: input.address?.trim() ?? "",
      congregation: input.congregation?.trim() ?? "",
      zoneId: input.zoneId?.trim() ?? "",
    };

    const parsed = UpdatePersonSchema.safeParse(trimmed);
    if (!parsed.success) {
      return { ok: false, error: formatZodError(parsed.error) };
    }

    if (person.type === "member") {
      if (!parsed.data.phoneNumber) {
        return { ok: false, error: "Phone number is required for members." };
      }
      await db
        .update(users)
        .set({
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          phoneNumber: parsed.data.phoneNumber,
          email: parsed.data.email || undefined,
          address: parsed.data.address || undefined,
          zoneId: parsed.data.zoneId || person.zoneId || undefined,
        })
        .where(eq(users.id, personId));
    } else {
      await db
        .update(guests)
        .set({
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          phoneNumber: parsed.data.phoneNumber || undefined,
          email: parsed.data.email || undefined,
          address: parsed.data.address || undefined,
          congregation: parsed.data.congregation || undefined,
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
