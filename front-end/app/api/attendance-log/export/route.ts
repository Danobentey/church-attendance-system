import { NextRequest } from "next/server";
import { getProfile } from "@/app/lib/auth";
import { getAttendanceLog } from "@/app/lib/attendance-log";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function weekAgoIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const profile = await getProfile();
  if (!profile) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dateTo = searchParams.get("dateTo") || todayIso();
  const dateFrom = searchParams.get("dateFrom") || weekAgoIso();
  const eventId = searchParams.get("eventId") || "";
  const type = searchParams.get("type") || "";
  const search = searchParams.get("search") || "";

  const rows = await getAttendanceLog(profile, {
    dateFrom,
    dateTo,
    eventId: eventId || null,
    type: type === "member" ? "member" : type === "guest" ? "guest" : null,
    search: search || null,
  });

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
      "Content-Disposition": `attachment; filename="attendance-log-${dateFrom}-${dateTo}.csv"`,
    },
  });
}
