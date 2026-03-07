"use server";

import { db } from "@/app/lib/db";
import { zones } from "@/app/lib/db/schema";
import { getProfile } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";
import { CreateZoneSchema, formatZodError } from "@/app/lib/validation";

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

    const parsed = CreateZoneSchema.safeParse({
      name: name?.trim() ?? "",
      abbreviation: abbreviation?.trim().toUpperCase() ?? "",
    });
    if (!parsed.success) {
      return { ok: false, error: formatZodError(parsed.error) };
    }

    const [zone] = await db
      .insert(zones)
      .values({
        name: parsed.data.name,
        abbreviation: parsed.data.abbreviation,
      })
      .returning({ id: zones.id, name: zones.name });
    await logAuditEvent(profile.id, "zone_created", { targetType: "zone", targetId: zone.id });
    return { ok: true, zone: { id: zone.id, name: zone.name } };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to create zone.";
    return { ok: false, error: message };
  }
}
