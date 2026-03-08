"use server";

import { and, eq, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db";
import { events } from "@/app/lib/db/schema";
import { getProfile } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";

type Profile = Awaited<ReturnType<typeof getProfile>>;

export type EventCategory =
  | "church_service"
  | "seminar"
  | "lecture"
  | "other";

export type EventForList = {
  id: string;
  name: string;
  category: EventCategory;
  date: string;
  weekday: number | null;
};

/** Default service name and category by weekday (0=Sun .. 6=Sat). Thu/Fri = Zonal Fellowship. */
const DEFAULT_SERVICE_BY_WEEKDAY: Partial<
  Record<number, { name: string; category: EventCategory }>
> = {
  0: { name: "Sunday Service", category: "church_service" },
  1: { name: "Youth Class", category: "other" },
  3: { name: "Bible Study", category: "other" },
  4: { name: "Zonal Fellowship", category: "other" },
  5: { name: "Zonal Fellowship", category: "other" },
};

function getDefaultServiceForWeekday(
  weekday: number
): { name: string; category: EventCategory } | null {
  return DEFAULT_SERVICE_BY_WEEKDAY[weekday] ?? null;
}

/**
 * Given today's events and date, returns the event id to auto-select:
 * prefers church_config.defaultServiceName if set and matching, else default for weekday.
 */
export async function getPreferredEventIdForDate(
  eventsForDate: EventForList[],
  dateIso: string
): Promise<string | null> {
  if (eventsForDate.length === 0) return null;
  const { getDefaultServiceName } = await import("@/app/lib/settings");
  const configDefault = await getDefaultServiceName();
  if (configDefault?.trim()) {
    const match = eventsForDate.find(
      (e) => e.name.toLowerCase().trim() === configDefault.toLowerCase().trim()
    );
    if (match) return match.id;
  }
  const weekday = new Date(dateIso + "Z").getUTCDay();
  const def = getDefaultServiceForWeekday(weekday);
  if (def) {
    const match = eventsForDate.find(
      (e) => e.name.toLowerCase().trim() === def.name.toLowerCase().trim()
    );
    if (match) return match.id;
  }
  return eventsForDate[0]?.id ?? null;
}

/**
 * Returns events for today, auto-creating from recurring services config if none exist.
 * Falls back to weekday defaults if no recurring services are configured.
 * Note: This is called during render so it must NOT call revalidatePath.
 */
export async function getTodayEventsWithDefault(
  profile: Profile
): Promise<EventForList[]> {
  const today = new Date().toISOString().slice(0, 10);
  const weekday = new Date(today + "Z").getUTCDay();
  let list = await getEventsForDate(profile, today);
  if (list.length === 0) {
    const { getChurchConfig } = await import("@/app/lib/settings");
    const config = await getChurchConfig();
    const recurringNames = config?.recurringServiceNames ?? [];

    if (recurringNames.length > 0) {
      try {
        await db.insert(events).values(
          recurringNames.map((name) => ({
            name,
            category: "church_service" as EventCategory,
            date: today,
            weekday,
          }))
        );
        list = await getEventsForDate(profile, today);
      } catch {
        // Silently fail
      }
    } else {
      // Fall back to weekday defaults if no recurring services configured
      const def = getDefaultServiceForWeekday(weekday);
      if (def) {
        try {
          await db.insert(events).values({
            name: def.name,
            category: def.category,
            date: today,
            weekday,
          });
          list = await getEventsForDate(profile, today);
        } catch {
          // Silently fail
        }
      }
    }
  }
  return list;
}

/**
 * Returns events for a given date. Scoped by RLS (admin/secretariat/zonal_leader).
 */
export async function getEventsForDate(
  profile: Profile,
  date: string
): Promise<EventForList[]> {
  if (!profile) return [];

  const rows = await db
    .select({
      id: events.id,
      name: events.name,
      category: events.category,
      date: events.date,
      weekday: events.weekday,
    })
    .from(events)
    .where(eq(events.date, date))
    .orderBy(events.createdAt);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    date: r.date,
    weekday: r.weekday,
  }));
}

/**
 * Returns events in a date range (inclusive). For attendance log filter dropdown.
 */
export async function getEventsInDateRange(
  profile: Profile,
  dateFrom: string,
  dateTo: string
): Promise<EventForList[]> {
  if (!profile) return [];

  const rows = await db
    .select({
      id: events.id,
      name: events.name,
      category: events.category,
      date: events.date,
      weekday: events.weekday,
    })
    .from(events)
    .where(and(gte(events.date, dateFrom), lte(events.date, dateTo)))
    .orderBy(events.date, events.createdAt);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    date: r.date,
    weekday: r.weekday,
  }));
}

export type CreateEventInput = {
  name: string;
  category: EventCategory;
  date: string;
};

export type CreateEventResult =
  | { ok: true; eventId: string }
  | { ok: false; error: string };

/**
 * Creates an event. Only admin/secretariat/zonal_leader can create (enforced by RLS).
 */
export async function createEvent(
  input: CreateEventInput
): Promise<CreateEventResult> {
  const profile = await getProfile();
  if (!profile) {
    return { ok: false, error: "Not authenticated." };
  }

  const name = input.name?.trim();
  if (!name) {
    return { ok: false, error: "Service name is required." };
  }
  if (!input.date) {
    return { ok: false, error: "Date is required." };
  }

  const weekday = new Date(input.date + "Z").getUTCDay();

  const [event] = await db
    .insert(events)
    .values({
      name,
      category: input.category,
      date: input.date,
      weekday,
    })
    .returning({ id: events.id });

  if (!event) {
    return { ok: false, error: "Failed to create service." };
  }
  await logAuditEvent(profile.id, "event_created", { targetType: "event", targetId: event.id });
  revalidatePath("/services/today");
  revalidatePath("/");
  revalidatePath("/settings/services-setup");
  return { ok: true, eventId: event.id };
}

/**
 * Returns distinct event names (for services setup). Not profile-scoped.
 */
export async function getDistinctEventNames(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ name: events.name })
    .from(events)
    .orderBy(events.name);
  return rows.map((r) => r.name ?? "").filter(Boolean);
}
