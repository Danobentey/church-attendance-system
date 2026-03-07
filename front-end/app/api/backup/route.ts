import { getProfile } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";
import { db } from "@/app/lib/db";
import {
  attendance,
  churchConfig,
  events,
  guests,
  users,
  zones,
} from "@/app/lib/db/schema";

export async function GET() {
  const profile = await getProfile();
  if (!profile) return new Response("Unauthorized", { status: 401 });
  if (profile.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }
  await logAuditEvent(profile.id, "export", { targetType: "backup" });

  const [zonesRows, usersRows, eventsRows, guestsRows, attendanceRows, configRows] =
    await Promise.all([
      db.select().from(zones),
      db.select().from(users),
      db.select().from(events),
      db.select().from(guests),
      db.select().from(attendance),
      db.select().from(churchConfig),
    ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    zones: zonesRows,
    users: usersRows,
    events: eventsRows,
    guests: guestsRows,
    attendance: attendanceRows,
    church_config: configRows,
  };

  const json = JSON.stringify(backup, null, 2);
  const filename = `backup-${new Date().toISOString().slice(0, 10)}.json`;

  return new Response(json, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
