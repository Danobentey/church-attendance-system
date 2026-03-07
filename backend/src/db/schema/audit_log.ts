import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { jsonb } from "drizzle-orm/pg-core";
import { auditActionEnum } from "./enums";
import { users } from "./users";

export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  action: auditActionEnum("action").notNull(),
  targetType: varchar("target_type", { length: 50 }),
  targetId: uuid("target_id"),
  metadata: jsonb("metadata"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
