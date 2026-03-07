"use server";

import { randomUUID } from "crypto";
import { db } from "@/app/lib/db";
import { users, zones } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";
import { getProfile } from "@/app/lib/auth";
import { generateZoneIdentifier } from "@/app/lib/zone-identifier";

export type ImportMembersResult =
  | { ok: true; created: number; errors: string[] }
  | { ok: false; error: string };

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (inQuotes) {
      current += c;
    } else if (c === ",") {
      result.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Import members from CSV text. Expected columns: first_name, last_name, phone_number, email, zone_name.
 * Zone name is matched against zones.name (case-sensitive). Returns count created and per-row errors.
 */
export async function importMembersAction(
  csvText: string
): Promise<ImportMembersResult> {
  try {
    const profile = await getProfile();
    if (!profile) {
      return { ok: false, error: "You must be logged in to import members." };
    }
    if (profile.role !== "admin" && profile.role !== "secretariat") {
      return { ok: false, error: "Only admin or secretariat can import members." };
    }

    const zoneRows = await db
      .select({ id: zones.id, name: zones.name })
      .from(zones);
    const zoneByName = new Map(zoneRows.map((z) => [z.name, z.id]));

    const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      return { ok: true, created: 0, errors: ["CSV has no data rows."] };
    }

    const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));
    const firstIdx = header.indexOf("first_name");
    const lastIdx = header.indexOf("last_name");
    const phoneIdx = header.indexOf("phone_number");
    const emailIdx = header.indexOf("email");
    const zoneIdx = header.indexOf("zone_name");

    if (firstIdx === -1 || lastIdx === -1 || phoneIdx === -1) {
      return { ok: false, error: "CSV must have columns: first_name, last_name, phone_number." };
    }

    const errors: string[] = [];
    let created = 0;

    for (let i = 1; i < lines.length; i++) {
      const cells = parseCsvLine(lines[i]);
      const firstName = (cells[firstIdx] ?? "").trim();
      const lastName = (cells[lastIdx] ?? "").trim();
      const phoneNumber = (cells[phoneIdx] ?? "").trim();
      const email = emailIdx >= 0 ? (cells[emailIdx] ?? "").trim() : "";
      const zoneName = zoneIdx >= 0 ? (cells[zoneIdx] ?? "").trim() : "";

      if (!firstName || !lastName) {
        errors.push(`Row ${i + 1}: First name and last name required.`);
        continue;
      }
      if (!phoneNumber) {
        errors.push(`Row ${i + 1}: Phone number required.`);
        continue;
      }

      let zoneId: string | null = null;
      if (zoneName) {
        zoneId = zoneByName.get(zoneName) ?? null;
        if (!zoneId) {
          errors.push(`Row ${i + 1}: Unknown zone "${zoneName}".`);
          continue;
        }
      }
      const id = randomUUID();
      const zoneIdentifier = zoneId ? await generateZoneIdentifier(zoneId) : undefined;

      await db.insert(users).values({
        id,
        firstName,
        lastName,
        phoneNumber,
        email: email || undefined,
        zoneId: zoneId ?? undefined,
        zoneIdentifier: zoneIdentifier ?? undefined,
        role: "member",
        status: "active",
      });
      created++;
    }

    return { ok: true, created, errors };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Import failed.";
    return { ok: false, error: message };
  }
}
