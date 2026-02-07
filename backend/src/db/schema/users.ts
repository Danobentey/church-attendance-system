import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { userRoleEnum, userStatusEnum } from "./enums";
import { zones } from "./zones";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  address: text("address"),
  dateOfBirth: date("date_of_birth"),
  nextOfKin: varchar("next_of_kin", { length: 255 }),
  role: userRoleEnum("role").notNull().default("member"),
  zoneId: uuid("zone_id").references(() => zones.id),
  zoneIdentifier: varchar("zone_identifier", { length: 50 }).unique(),
  status: userStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
