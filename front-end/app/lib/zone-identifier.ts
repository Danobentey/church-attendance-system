import { eq, sql } from "drizzle-orm";
import { db } from "@/app/lib/db";
import { users, zones } from "@/app/lib/db/schema";

/**
 * Generates the next zone identifier for a given zone (e.g. EGB001, EGB002).
 * Uses the zone's abbreviation and the current member count + 1.
 */
export async function generateZoneIdentifier(zoneId: string): Promise<string> {
  const zone = await db
    .select({ abbreviation: zones.abbreviation })
    .from(zones)
    .where(eq(zones.id, zoneId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!zone) {
    throw new Error(`Zone not found: ${zoneId}`);
  }

  const result = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(users)
    .where(eq(users.zoneId, zoneId))
    .then((rows) => rows[0]);

  const nextSeq = (result?.count ?? 0) + 1;
  return `${zone.abbreviation}${nextSeq.toString().padStart(3, "0")}`;
}
