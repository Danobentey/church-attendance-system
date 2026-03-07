import { NextRequest } from "next/server";
import { getProfile } from "@/app/lib/auth";
import { getWeeklyAttendanceReport } from "@/app/lib/reports";
import { logAuditEvent } from "@/app/lib/audit";

export async function GET(request: NextRequest) {
  const profile = await getProfile();
  if (!profile) return new Response("Unauthorized", { status: 401 });

  const week = request.nextUrl.searchParams.get("week");
  if (!week) return new Response("Missing week", { status: 400 });

  const rows = await getWeeklyAttendanceReport(profile, week);
  await logAuditEvent(profile.id, "export", { targetType: "report_weekly", metadata: { week } });
  const header = "Date,Service,Zone,Total\n";
  const body = rows
    .map((r) => `${r.eventDate},"${r.eventName.replace(/"/g, '""')}","${(r.zoneName ?? "").replace(/"/g, '""')}",${r.total}`)
    .join("\n");
  const csv = header + body;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="weekly-attendance-${week}.csv"`,
    },
  });
}
