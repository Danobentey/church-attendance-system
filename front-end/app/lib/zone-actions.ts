"use server";

import { db } from "@/app/lib/db";
import { zones } from "@/app/lib/db/schema";
import { getProfile } from "@/app/lib/auth";

export type CreateZoneResult =
  | { ok: true; zone: { id: string; name: string } }
  | { ok: false; error: string };

/**
 * Creates a new zone. Only admin (super admin) can create zones.
 */
export async function createZoneAction(
  name: string,
  abbreviation: string
): Promise<CreateZoneResult> {
  try {
    const profile = await getProfile();
    if (!profile) {
      return { ok: false, error: "You must be logged in." };
    }
    if (profile.role !== "admin") {
      return { ok: false, error: "Only an admin can add zones." };
    }

    const trimmedName = name?.trim();
    const trimmedAbbr = abbreviation?.trim().toUpperCase();

    if (!trimmedName) {
      return { ok: false, error: "Zone name is required." };
    }
    if (!trimmedAbbr) {
      return { ok: false, error: "Abbreviation is required (e.g. EGB)." };
    }
    if (trimmedAbbr.length > 10) {
      return { ok: false, error: "Abbreviation must be 10 characters or less." };
    }

    const [zone] = await db
      .insert(zones)
      .values({
        name: trimmedName,
        abbreviation: trimmedAbbr,
      })
      .returning({ id: zones.id, name: zones.name });

    return { ok: true, zone: { id: zone.id, name: zone.name } };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to create zone.";
    return { ok: false, error: message };
  }
}
