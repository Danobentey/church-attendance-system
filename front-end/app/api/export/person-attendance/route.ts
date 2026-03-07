import { NextRequest } from "next/server";
import { getProfile } from "@/app/lib/auth";
import { getPersonAttendanceHistory } from "@/app/lib/person";
import { logAuditEvent } from "@/app/lib/audit";

export async function GET(request: NextRequest) {
  const profile = await getProfile();
  if (!profile) {
    return new Response("Unauthorized", { status: 401 });
  }

  const personId = request.nextUrl.searchParams.get("personId");
  if (!personId) {
    return new Response("Missing personId", { status: 400 });
  }

  const { person, history } = await getPersonAttendanceHistory(profile, personId);
  if (!person || !history) {
    return new Response("Not found", { status: 404 });
  }
  await logAuditEvent(profile.id, "export", { targetType: "person_attendance", targetId: personId });

  const header = "Date,Service,Check-in time\n";
  const body = history.entries
    .map(
      (r) =>
        `${r.date},"${r.serviceName.replace(/"/g, '""')}",${r.checkInTime}`
    )
    .join("\n");
  const csv = header + body;

  const filename = `attendance-${person.fullName.replace(/\s+/g, "-")}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
