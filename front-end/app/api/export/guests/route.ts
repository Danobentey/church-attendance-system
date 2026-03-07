import { getProfile } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { guests } from "@/app/lib/db/schema";
import { logAuditEvent } from "@/app/lib/audit";

export async function GET() {
  const profile = await getProfile();
  if (!profile) return new Response("Unauthorized", { status: 401 });
  await logAuditEvent(profile.id, "export", { targetType: "guests" });

  const rows = await db
    .select({
      firstName: guests.firstName,
      lastName: guests.lastName,
      email: guests.email,
      phoneNumber: guests.phoneNumber,
      congregation: guests.congregation,
      address: guests.address,
    })
    .from(guests)
    .orderBy(guests.lastName, guests.firstName);

  const header = "First name,Last name,Email,Phone,Congregation,Address\n";
  const body = rows
    .map((r) =>
      [
        (r.firstName ?? "").replace(/"/g, '""'),
        (r.lastName ?? "").replace(/"/g, '""'),
        (r.email ?? "").replace(/"/g, '""'),
        (r.phoneNumber ?? "").replace(/"/g, '""'),
        (r.congregation ?? "").replace(/"/g, '""'),
        (r.address ?? "").replace(/"/g, '""'),
      ].map((c) => `"${c}"`).join(",")
    )
    .join("\n");
  const csv = header + body;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="guests-export.csv"',
    },
  });
}
