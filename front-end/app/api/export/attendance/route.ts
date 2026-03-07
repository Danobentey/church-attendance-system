import { NextRequest } from "next/server";
import { getProfile } from "@/app/lib/auth";
import { getAttendanceLog } from "@/app/lib/attendance-log";
import { logAuditEvent } from "@/app/lib/audit";

function monthAgoIso(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const profile = await getProfile();
  if (!profile) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("dateFrom") ?? monthAgoIso();
  const dateTo = searchParams.get("dateTo") ?? todayIso();

  const rows = await getAttendanceLog(profile, {
    dateFrom,
    dateTo,
    eventId: null,
    type: null,
    search: null,
  });
  await logAuditEvent(profile.id, "export", { targetType: "attendance", metadata: { dateFrom, dateTo } });

  const header = "Name,Type,Service,Date,Check-in time\n";
  const body = rows
    .map(
      (r) =>
        `"${r.name.replace(/"/g, '""')}",${r.type},"${r.service.replace(/"/g, '""')}",${r.eventDate},${r.checkInTime}`
    )
    .join("\n");
  const csv = header + body;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="attendance-${dateFrom}-${dateTo}.csv"`,
    },
  });
}
