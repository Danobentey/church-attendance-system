import { NextRequest } from "next/server";
import { getProfile } from "@/app/lib/auth";
import { getDepartmentalReport } from "@/app/lib/reports";
import { logAuditEvent } from "@/app/lib/audit";

export async function GET(request: NextRequest) {
  const profile = await getProfile();
  if (!profile) return new Response("Unauthorized", { status: 401 });

  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  if (!from || !to) return new Response("Missing from or to", { status: 400 });

  const rows = await getDepartmentalReport(profile, from, to);
  await logAuditEvent(profile.id, "export", { targetType: "report_departmental", metadata: { from, to } });
  const header = "Zone,Total attendance\n";
  const body = rows
    .map((r) => `"${r.zoneName.replace(/"/g, '""')}",${r.total}`)
    .join("\n");
  const csv = header + body;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="departmental-${from}-${to}.csv"`,
    },
  });
}
