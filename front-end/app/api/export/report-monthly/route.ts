import { NextRequest } from "next/server";
import { getProfile } from "@/app/lib/auth";
import { getMonthlyGrowthReport } from "@/app/lib/reports";
import { logAuditEvent } from "@/app/lib/audit";

export async function GET(request: NextRequest) {
  const profile = await getProfile();
  if (!profile) return new Response("Unauthorized", { status: 401 });

  const month = request.nextUrl.searchParams.get("month");
  if (!month) return new Response("Missing month", { status: 400 });

  const rows = await getMonthlyGrowthReport(profile, month);
  await logAuditEvent(profile.id, "export", { targetType: "report_monthly", metadata: { month } });
  const header = "Metric,Value\n";
  const body = rows.map((r) => `"${r.metric.replace(/"/g, '""')}",${r.value}`).join("\n");
  const csv = header + body;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="monthly-growth-${month}.csv"`,
    },
  });
}
