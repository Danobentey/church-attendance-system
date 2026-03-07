"use server";

import { db } from "@/app/lib/db";
import { attendance, zones } from "@/app/lib/db/schema";
import { getProfile } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";
import type { CheckInPerson } from "@/app/lib/check-in";

export type RecordAttendanceResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Records attendance for one person at the selected event.
 * Member: uses person.id as userId and person.zoneId. Guest: uses person.id as guestId and recorder's zone.
 */
export async function recordAttendance(
  eventId: string,
  person: CheckInPerson
): Promise<RecordAttendanceResult> {
  const profile = await getProfile();
  if (!profile) {
    return { ok: false, error: "Not authenticated." };
  }
  if (!eventId) {
    return { ok: false, error: "No service selected." };
  }

  let zoneId: string;
  let userId: string | null = null;
  let guestId: string | null = null;

  if (person.status === "Member") {
    if (!person.zoneId) {
      return { ok: false, error: "Member zone is required." };
    }
    zoneId = person.zoneId;
    userId = person.id;
  } else {
    zoneId = profile.zoneId ?? (await getFirstZoneId()) ?? "";
    if (!zoneId) {
      return { ok: false, error: "Zone required for guest check-in." };
    }
    guestId = person.id;
  }

  try {
    await db.insert(attendance).values({
      eventId,
      userId: userId ?? undefined,
      guestId: guestId ?? undefined,
      zoneId,
      recordedBy: profile.id,
    });
    await logAuditEvent(profile.id, "check_in", {
      targetType: person.status === "Member" ? "member" : "guest",
      targetId: person.id,
    });
    return { ok: true };
  } catch (e) {
    const err = e as { code?: string };
    if (err?.code === "23505") {
      return { ok: false, error: "Already checked in for this service." };
    }
    const msg = e instanceof Error ? e.message : "Failed to record attendance.";
    return { ok: false, error: msg };
  }
}

async function getFirstZoneId(): Promise<string | null> {
  const [row] = await db
    .select({ id: zones.id })
    .from(zones)
    .limit(1);
  return row?.id ?? null;
}
