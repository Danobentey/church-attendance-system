import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const zones = pgTable("zones", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  abbreviation: varchar("abbreviation", { length: 10 }).notNull().unique(),
  congregation: varchar("congregation", { length: 255 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
