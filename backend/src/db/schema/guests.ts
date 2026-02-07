import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const guests = pgTable("guests", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  congregation: varchar("congregation", { length: 255 }),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
