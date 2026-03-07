import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "secretariat",
  "zonal_leader",
  "member",
]);

export const userStatusEnum = pgEnum("user_status", ["active", "inactive"]);

export const eventCategoryEnum = pgEnum("event_category", [
  "church_service",
  "seminar",
  "lecture",
  "other",
]);

export const attendanceTypeEnum = pgEnum("attendance_type", [
  "in_person",
  "online",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "login",
  "check_in",
  "member_created",
  "member_updated",
  "guest_created",
  "zone_created",
  "event_created",
  "export",
]);
