import {
  pgTable,
  uuid,
  varchar,
  integer,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { eventCategoryEnum } from "./enums";

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: eventCategoryEnum("category").notNull(),
  weekday: integer("weekday"),
  date: date("date").notNull(),
  congregation: varchar("congregation", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
