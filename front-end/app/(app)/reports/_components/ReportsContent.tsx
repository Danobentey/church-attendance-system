import type { WeeklyAttendanceRow, MonthlyGrowthRow, DepartmentalRow } from "@/app/lib/reports";

type ReportsContentProps = {
  weeklyWeek: string;
  monthlyMonth: string;
  deptFrom: string;
  deptTo: string;
  defaultWeekStart: string;
  defaultMonth: string;
  defaultDeptFrom: string;
  today: string;
  weeklyData: WeeklyAttendanceRow[];
  monthlyData: MonthlyGrowthRow[];
  departmentalData: DepartmentalRow[];
};

export default function ReportsContent({
  weeklyWeek,
  monthlyMonth,
  deptFrom,
  deptTo,
  defaultWeekStart,
  defaultMonth,
  defaultDeptFrom,
  today,
  weeklyData,
  monthlyData,
  departmentalData,
}: ReportsContentProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-1">
      {/* Weekly attendance */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Weekly attendance</div>
        <div className="mt-1 text-sm text-zinc-600">Summary of attendance for the week.</div>
        <form method="get" action="/reports" className="mt-3 flex flex-wrap items-end gap-2">
          <input type="hidden" name="monthlyMonth" value={monthlyMonth} />
          <input type="hidden" name="deptFrom" value={deptFrom} />
          <input type="hidden" name="deptTo" value={deptTo} />
          <div className="flex flex-col gap-1">
            <label htmlFor="weeklyWeek" className="text-xs font-medium text-zinc-600">Week starting</label>
            <input
              id="weeklyWeek"
              name="weeklyWeek"
              type="date"
              defaultValue={weeklyWeek}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm"
            />
          </div>
          <button
            type="submit"
            className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Generate
          </button>
          <a
            href={`/api/export/report-weekly?week=${encodeURIComponent(weeklyWeek)}`}
            className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-center text-sm font-semibold leading-10 hover:bg-zinc-50"
          >
            Export CSV
          </a>
        </form>
        {weeklyData.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 text-left text-xs font-semibold text-zinc-600">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Service</th>
                  <th className="px-3 py-2">Zone</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {weeklyData.map((r, i) => (
                  <tr key={i} className="border-t border-zinc-200">
                    <td className="px-3 py-2">{r.eventDate}</td>
                    <td className="px-3 py-2">{r.eventName}</td>
                    <td className="px-3 py-2">{r.zoneName ?? "—"}</td>
                    <td className="px-3 py-2 text-right">{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Monthly growth */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Monthly growth</div>
        <div className="mt-1 text-sm text-zinc-600">Growth trends and retention.</div>
        <form method="get" action="/reports" className="mt-3 flex flex-wrap items-end gap-2">
          <input type="hidden" name="weeklyWeek" value={weeklyWeek} />
          <input type="hidden" name="deptFrom" value={deptFrom} />
          <input type="hidden" name="deptTo" value={deptTo} />
          <div className="flex flex-col gap-1">
            <label htmlFor="monthlyMonth" className="text-xs font-medium text-zinc-600">Month</label>
            <input
              id="monthlyMonth"
              name="monthlyMonth"
              type="month"
              defaultValue={monthlyMonth}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm"
            />
          </div>
          <button
            type="submit"
            className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Generate
          </button>
          <a
            href={`/api/export/report-monthly?month=${encodeURIComponent(monthlyMonth)}`}
            className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-center text-sm font-semibold leading-10 hover:bg-zinc-50"
          >
            Export CSV
          </a>
        </form>
        {monthlyData.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 text-left text-xs font-semibold text-zinc-600">
                  <th className="px-3 py-2">Metric</th>
                  <th className="px-3 py-2 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((r, i) => (
                  <tr key={i} className="border-t border-zinc-200">
                    <td className="px-3 py-2">{r.metric}</td>
                    <td className="px-3 py-2 text-right">{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Departmental */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Departmental attendance</div>
        <div className="mt-1 text-sm text-zinc-600">Attendance broken down by department/unit.</div>
        <form method="get" action="/reports" className="mt-3 flex flex-wrap items-end gap-2">
          <input type="hidden" name="weeklyWeek" value={weeklyWeek} />
          <input type="hidden" name="monthlyMonth" value={monthlyMonth} />
          <div className="flex flex-col gap-1">
            <label htmlFor="deptFrom" className="text-xs font-medium text-zinc-600">From</label>
            <input
              id="deptFrom"
              name="deptFrom"
              type="date"
              defaultValue={deptFrom}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="deptTo" className="text-xs font-medium text-zinc-600">To</label>
            <input
              id="deptTo"
              name="deptTo"
              type="date"
              defaultValue={deptTo}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm"
            />
          </div>
          <button
            type="submit"
            className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Generate
          </button>
          <a
            href={`/api/export/report-departmental?from=${encodeURIComponent(deptFrom)}&to=${encodeURIComponent(deptTo)}`}
            className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-center text-sm font-semibold leading-10 hover:bg-zinc-50"
          >
            Export CSV
          </a>
        </form>
        {departmentalData.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 text-left text-xs font-semibold text-zinc-600">
                  <th className="px-3 py-2">Zone</th>
                  <th className="px-3 py-2 text-right">Total attendance</th>
                </tr>
              </thead>
              <tbody>
                {departmentalData.map((r, i) => (
                  <tr key={i} className="border-t border-zinc-200">
                    <td className="px-3 py-2">{r.zoneName}</td>
                    <td className="px-3 py-2 text-right">{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
