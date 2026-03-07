/**
 * One-off member import script.
 * Usage: npx tsx scripts/import-members.ts <path-to-csv>
 *
 * CSV format expected: Zone, Full Name, Address, Phonn No(s)., Emails Address
 */

import { config } from "dotenv";
config();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { randomUUID } from "crypto";
import { eq, sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import * as schema from "../src/db/schema/index.js";

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set.");
  process.exit(1);
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

// Zone name normalisation: CSV inconsistencies → canonical name
const ZONE_ALIASES: Record<string, string> = {
  Barrack: "Barracks",
};

// Shared / placeholder emails used by the data-entry team.
// These appear for multiple members and must NOT be stored as member emails.
const SHARED_EMAIL_PATTERNS = [
  "preciousmike97@gmail.com",
  "cocikeja2023@gmail.com",
  "christianboy66@gmail.com",
  "ogechukwuoji47@gmail.com",
  "emmaorlax@gmail.com",
  "adamaokeh@gmail.com",
  "freppos83@gmail.com",
  "ikejachurchofchrist@gmail.com",
  "uyimehumoh@gmail.com",
  "gokex009@gmail.com",
  "uforobrown4u@gmail.com",
];

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

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
}

function normalizePhone(raw: string): string | null {
  if (!raw || raw.trim().toLowerCase() === "nil" || raw.trim().toLowerCase() === "none") return null;

  // Split on common separators and take the first number
  const segments = raw.split(/[,\/&\n]/);
  let p = segments[0].trim();

  // Remove spaces, dashes, plus signs, and any non-digit chars
  p = p.replace(/[\s\-\(\)\.]/g, "");

  // Handle scientific notation like 2.35E+12 → skip
  if (/e\+/i.test(p)) return null;

  // Keep only digits
  p = p.replace(/\D/g, "");

  if (p.length === 0) return null;

  // Strip leading country code 234
  if (p.startsWith("234") && p.length >= 13) {
    p = "0" + p.slice(3);
  }

  // Add leading zero if missing (10 digits → 11)
  if (p.length === 10 && !p.startsWith("0")) {
    p = "0" + p;
  }

  // Truncate to 20 chars max (schema limit)
  if (p.length > 20) p = p.slice(0, 20);

  // Require at least 7 digits
  if (p.length < 7) return null;

  return p;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function generateAbbreviation(name: string): string {
  const skip = new Set(["the", "of", "and", "&", "/"]);
  const words = name
    .split(/[\s\-\/]+/)
    .filter((w) => w.length > 1 && !skip.has(w.toLowerCase()));

  if (words.length === 0) return name.slice(0, 4).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words
    .slice(0, 4)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

async function getOrCreateZone(
  zoneName: string,
  zoneByName: Map<string, (typeof schema.zones.$inferSelect)>
) {
  const canonical = ZONE_ALIASES[zoneName] ?? zoneName;
  if (zoneByName.has(canonical)) return zoneByName.get(canonical)!;

  // Generate a unique abbreviation
  let abbrev = generateAbbreviation(canonical);
  let counter = 1;
  while ([...zoneByName.values()].some((z) => z.abbreviation === abbrev)) {
    abbrev = generateAbbreviation(canonical) + counter++;
  }
  // Ensure max 10 chars
  abbrev = abbrev.slice(0, 10);

  const [newZone] = await db
    .insert(schema.zones)
    .values({ name: canonical, abbreviation: abbrev })
    .returning();

  zoneByName.set(canonical, newZone);
  console.log(`  [zone created] "${canonical}" (${abbrev})`);
  return newZone;
}

async function generateZoneIdentifier(zoneId: string): Promise<string> {
  const [zone] = await db
    .select({ abbreviation: schema.zones.abbreviation })
    .from(schema.zones)
    .where(eq(schema.zones.id, zoneId))
    .limit(1);

  if (!zone) throw new Error(`Zone not found: ${zoneId}`);

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.users)
    .where(eq(schema.users.zoneId, zoneId));

  const nextSeq = (result?.count ?? 0) + 1;
  return `${zone.abbreviation}${nextSeq.toString().padStart(3, "0")}`;
}

async function main() {
  const csvArg = process.argv[2];
  if (!csvArg) {
    console.error("Usage: npx tsx scripts/import-members.ts <path-to-csv>");
    process.exit(1);
  }

  const csvPath = path.resolve(csvArg);
  if (!fs.existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`);
    process.exit(1);
  }

  const csvText = fs.readFileSync(csvPath, "utf-8");
  const allLines = csvText.split(/\r?\n/).filter((l) => l.trim());

  if (allLines.length < 2) {
    console.error("CSV has no data rows.");
    process.exit(1);
  }

  console.log(`\nParsing ${allLines.length - 1} data rows from: ${csvPath}\n`);

  // Pre-scan to identify emails that appear more than once → shared/placeholder
  const emailCounts = new Map<string, number>();
  for (let i = 1; i < allLines.length; i++) {
    const cells = parseCsvLine(allLines[i]);
    const e = cells[4]?.trim().toLowerCase() ?? "";
    if (e) emailCounts.set(e, (emailCounts.get(e) ?? 0) + 1);
  }
  const repeatedEmails = new Set(
    [...emailCounts.entries()].filter(([, c]) => c > 1).map(([e]) => e)
  );
  const sharedEmails = new Set([
    ...SHARED_EMAIL_PATTERNS.map((e) => e.toLowerCase()),
    ...repeatedEmails,
  ]);
  console.log(`Identified ${sharedEmails.size} shared/placeholder emails (will be omitted).\n`);

  // Load existing zones
  const existingZones = await db.select().from(schema.zones);
  const zoneByName = new Map(existingZones.map((z) => [z.name, z]));
  console.log(`Found ${existingZones.length} existing zones in database.\n`);

  // Load existing phones & emails to avoid duplicates
  const existingUsers = await db
    .select({ email: schema.users.email, phone: schema.users.phoneNumber })
    .from(schema.users);
  const existingPhones = new Set(existingUsers.map((u) => u.phone));
  const existingEmails = new Set(
    existingUsers.map((u) => u.email?.toLowerCase()).filter(Boolean) as string[]
  );

  let created = 0;
  let skipped = 0;
  const warnings: string[] = [];
  const usedEmailsThisRun = new Set<string>();

  for (let i = 1; i < allLines.length; i++) {
    const rowNum = i + 1;
    const cells = parseCsvLine(allLines[i]);

    const zoneRaw = cells[0]?.trim() ?? "";
    const fullName = cells[1]?.trim() ?? "";
    const address = cells[2]?.trim() ?? "";
    const phoneRaw = cells[3]?.trim() ?? "";
    const emailRaw = cells[4]?.trim() ?? "";

    if (!fullName) {
      warnings.push(`Row ${rowNum}: empty name — skipped.`);
      skipped++;
      continue;
    }

    const { firstName, lastName } = splitFullName(fullName);

    const phone = normalizePhone(phoneRaw);
    if (!phone) {
      warnings.push(`Row ${rowNum}: "${fullName}" — could not parse phone "${phoneRaw}" — skipped.`);
      skipped++;
      continue;
    }

    if (existingPhones.has(phone)) {
      warnings.push(`Row ${rowNum}: "${fullName}" — phone ${phone} already in DB — skipped.`);
      skipped++;
      continue;
    }

    // Resolve email
    let email: string | undefined;
    const emailLower = emailRaw.toLowerCase();
    if (
      emailRaw &&
      emailLower !== "nil" &&
      emailLower !== "none" &&
      isValidEmail(emailRaw) &&
      !sharedEmails.has(emailLower) &&
      !existingEmails.has(emailLower) &&
      !usedEmailsThisRun.has(emailLower)
    ) {
      email = emailRaw.trim();
      usedEmailsThisRun.add(emailLower);
    }

    // Resolve zone
    let zoneId: string | undefined;
    const zoneKey = zoneRaw;
    if (zoneKey && zoneKey.toLowerCase() !== "unattached") {
      const zone = await getOrCreateZone(zoneKey, zoneByName);
      zoneId = zone.id;
    }

    const id = randomUUID();
    const zoneIdentifier = zoneId ? await generateZoneIdentifier(zoneId) : undefined;

    await db.insert(schema.users).values({
      id,
      firstName,
      lastName,
      phoneNumber: phone,
      email: email ?? undefined,
      address: address || undefined,
      zoneId: zoneId ?? undefined,
      zoneIdentifier: zoneIdentifier ?? undefined,
      role: "member",
      status: "active",
    });

    existingPhones.add(phone);
    if (email) existingEmails.add(emailLower);
    created++;

    const zoneLabel = zoneRaw || "(no zone)";
    console.log(`  ✓ [${created.toString().padStart(3)}] ${firstName} ${lastName} | ${phone} | zone: ${zoneLabel}`);
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`Import complete!`);
  console.log(`  Members created : ${created}`);
  console.log(`  Rows skipped    : ${skipped}`);

  if (warnings.length > 0) {
    console.log(`\nWarnings / Skipped rows (${warnings.length}):`);
    warnings.forEach((w) => console.log(`  - ${w}`));
  }

  await client.end();
}

main().catch((e) => {
  console.error("\nFatal error:", e);
  process.exit(1);
});
