import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const churchConfig = pgTable("church_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  churchName: varchar("church_name", { length: 255 }),
  address: text("address"),
  contactInfo: text("contact_info"),
  logoUrl: text("logo_url"),
  defaultServiceName: varchar("default_service_name", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
