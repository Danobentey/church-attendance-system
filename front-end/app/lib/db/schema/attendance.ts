import {
  pgTable,
  uuid,
  timestamp,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { attendanceTypeEnum } from "./enums";
import { events } from "./events";
import { users } from "./users";
import { guests } from "./guests";
import { zones } from "./zones";

export const attendance = pgTable(
  "attendance",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id),
    userId: uuid("user_id").references(() => users.id),
    guestId: uuid("guest_id").references(() => guests.id),
    zoneId: uuid("zone_id")
      .notNull()
      .references(() => zones.id),
    attendanceType: attendanceTypeEnum("attendance_type")
      .notNull()
      .default("in_person"),
    timestamp: timestamp("timestamp", { withTimezone: true })
      .notNull()
      .defaultNow(),
    recordedBy: uuid("recorded_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("unique_event_user").on(table.eventId, table.userId),
    check(
      "user_or_guest_required",
      sql`${table.userId} IS NOT NULL OR ${table.guestId} IS NOT NULL`
    ),
  ]
);
