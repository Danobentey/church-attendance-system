/**
 * Shared Zod schemas for server action input validation.
 * All string inputs are expected to be pre-trimmed at the action layer.
 */
import { z } from "zod";

// ── Primitives ──────────────────────────────────────────────────────────────

const nonEmptyString = (max: number, label: string) =>
  z.string().min(1, `${label} is required`).max(max, `${label} must be ${max} characters or less`);

const optionalString = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

// ── Person schemas ───────────────────────────────────────────────────────────

export const CreateMemberSchema = z.object({
  firstName: nonEmptyString(100, "First name"),
  lastName: nonEmptyString(100, "Last name"),
  phoneNumber: z
    .string()
    .min(7, "Phone number must be at least 7 characters")
    .max(20, "Phone number must be 20 characters or less")
    .regex(/^[\d\s+\-()/]+$/, "Phone number contains invalid characters"),
  email: z.string().email("Invalid email address").max(255).optional().or(z.literal("")),
  zoneId: z.string().uuid("Invalid zone"),
  address: optionalString(500),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional()
    .or(z.literal("")),
  nextOfKin: optionalString(255),
});

export const CreateGuestSchema = z.object({
  firstName: nonEmptyString(100, "First name"),
  lastName: nonEmptyString(100, "Last name"),
  phoneNumber: z
    .string()
    .max(20, "Phone number must be 20 characters or less")
    .regex(/^[\d\s+\-()/]+$/, "Phone number contains invalid characters")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Invalid email address").max(255).optional().or(z.literal("")),
  congregation: optionalString(255),
  address: optionalString(500),
});

export const UpdatePersonSchema = z.object({
  firstName: nonEmptyString(100, "First name"),
  lastName: nonEmptyString(100, "Last name"),
  phoneNumber: z
    .string()
    .max(20)
    .regex(/^[\d\s+\-()/]*$/, "Phone number contains invalid characters")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Invalid email address").max(255).optional().or(z.literal("")),
  address: optionalString(500),
  congregation: optionalString(255),
  zoneId: z.string().uuid("Invalid zone").optional().or(z.literal("")),
});

// ── Zone schema ──────────────────────────────────────────────────────────────

export const CreateZoneSchema = z.object({
  name: nonEmptyString(100, "Zone name"),
  abbreviation: z
    .string()
    .min(1, "Abbreviation is required")
    .max(10, "Abbreviation must be 10 characters or less")
    .regex(/^[A-Za-z0-9]+$/, "Abbreviation must contain only letters and numbers"),
});

// ── Church config schema ─────────────────────────────────────────────────────

export const UpdateChurchConfigSchema = z.object({
  churchName: optionalString(200),
  address: optionalString(500),
  contactInfo: optionalString(500),
  logoUrl: z
    .string()
    .url("Logo URL must be a valid URL")
    .regex(/^https?:\/\//, "Logo URL must use http or https")
    .max(2048)
    .optional()
    .or(z.literal(""))
    .or(z.null()),
  defaultServiceName: optionalString(200),
});

// ── Loginable user schema ────────────────────────────────────────────────────

export const CreateLoginableUserSchema = z.object({
  firstName: nonEmptyString(100, "First name"),
  lastName: nonEmptyString(100, "Last name"),
  email: z.string().email("Invalid email address").max(255, "Email must be 255 characters or less"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be 72 characters or less"),
  phoneNumber: z
    .string()
    .min(7, "Phone number must be at least 7 characters")
    .max(20, "Phone number must be 20 characters or less")
    .regex(/^[\d\s+\-()/]+$/, "Phone number contains invalid characters"),
  role: z.enum(["admin", "secretariat", "zonal_leader"] as const, {
    error: "Role must be admin, secretariat, or zonal_leader",
  }),
  zoneId: z.string().uuid("Invalid zone").optional().or(z.literal("")),
});

// ── Import schema ────────────────────────────────────────────────────────────

/** Max CSV size: 500 KB (roughly ~5,000 members at ~100 bytes each with headroom). */
export const MAX_CSV_BYTES = 500 * 1024;

export const ImportCsvSchema = z.object({
  csvText: z
    .string()
    .min(1, "CSV content is required")
    .max(MAX_CSV_BYTES, `CSV must be smaller than ${MAX_CSV_BYTES / 1024} KB`),
});

// ── Helper ───────────────────────────────────────────────────────────────────

/** Formats the first Zod error into a single readable string. */
export function formatZodError(error: z.ZodError): string {
  const issues = error.issues;
  if (issues.length === 0) return "Validation failed.";
  return issues.map((i) => i.message).join(". ");
}
