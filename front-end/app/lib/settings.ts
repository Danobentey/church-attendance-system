"use server";

import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/app/lib/db";
import { churchConfig } from "@/app/lib/db/schema";
import { getProfile } from "@/app/lib/auth";

export type ChurchConfigRow = {
  id: string;
  churchName: string | null;
  address: string | null;
  contactInfo: string | null;
  logoUrl: string | null;
  defaultServiceName: string | null;
};

// Cached per-request so layout calling getTodayEventsWithDefault and
// getPreferredEventIdForDate back-to-back only hits the DB once.
export const getChurchConfig = cache(async function getChurchConfig(): Promise<ChurchConfigRow | null> {
  const [row] = await db.select().from(churchConfig).limit(1);
  if (!row) return null;
  return {
    id: row.id,
    churchName: row.churchName,
    address: row.address,
    contactInfo: row.contactInfo,
    logoUrl: row.logoUrl,
    defaultServiceName: row.defaultServiceName,
  };
});

export type UpdateChurchConfigInput = {
  churchName?: string | null;
  address?: string | null;
  contactInfo?: string | null;
  logoUrl?: string | null;
  defaultServiceName?: string | null;
};

export async function updateChurchConfig(
  input: UpdateChurchConfigInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Not authenticated." };
  if (profile.role !== "admin") {
    return { ok: false, error: "Only admin can update church config." };
  }

  const existing = await db.select().from(churchConfig).limit(1);
  const payload = {
    churchName: input.churchName ?? undefined,
    address: input.address ?? undefined,
    contactInfo: input.contactInfo ?? undefined,
    logoUrl: input.logoUrl ?? undefined,
    defaultServiceName: input.defaultServiceName ?? undefined,
  };

  if (existing.length > 0) {
    await db.update(churchConfig).set(payload).where(eq(churchConfig.id, existing[0].id));
  } else {
    await db.insert(churchConfig).values(payload);
  }
  return { ok: true };
}

export async function getDefaultServiceName(): Promise<string | null> {
  const config = await getChurchConfig();
  return config?.defaultServiceName ?? null;
}
