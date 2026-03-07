import { and, eq } from "drizzle-orm";
import { getProfile } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { users, zones } from "@/app/lib/db/schema";
import { logAuditEvent } from "@/app/lib/audit";

export async function GET() {
  const profile = await getProfile();
  if (!profile) return new Response("Unauthorized", { status: 401 });
  await logAuditEvent(profile.id, "export", { targetType: "members" });

  const isZonalLeader = profile.role === "zonal_leader";
  const zoneId = profile.zoneId ?? null;
  const conditions = [eq(users.role, "member")];
  if (isZonalLeader && zoneId) {
    conditions.push(eq(users.zoneId, zoneId));
  }

  const members = await db
    .select({
      firstName: users.firstName,
      lastName: users.lastName,
      phoneNumber: users.phoneNumber,
      email: users.email,
      zoneId: users.zoneId,
      zoneName: zones.name,
      status: users.status,
    })
    .from(users)
    .leftJoin(zones, eq(users.zoneId, zones.id))
    .where(and(...conditions))
    .orderBy(users.lastName, users.firstName);

  const header = "First name,Last name,Phone,Email,Zone,Status\n";
  const body = members
    .map((m) => {
      const zoneName = m.zoneName ?? "";
      return `"${(m.firstName ?? "").replace(/"/g, '""')}","${(m.lastName ?? "").replace(/"/g, '""')}","${(m.phoneNumber ?? "").replace(/"/g, '""')}","${(m.email ?? "").replace(/"/g, '""')}","${zoneName.replace(/"/g, '""')}","${m.status ?? "active"}"`;
    })
    .join("\n");
  const csv = header + body;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="members-export.csv"',
    },
  });
}
