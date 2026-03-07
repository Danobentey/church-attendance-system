import Link from "next/link";
import { getProfile } from "@/app/lib/auth";
import {
  getAnalyticsStats,
  getAttendanceOverTime,
  getFirstTimersVsReturning,
  type DateRangeKey,
} from "@/app/lib/analytics";
import AnalyticsCharts from "./_components/AnalyticsCharts";

type Props = {
  searchParams: Promise<{ range?: string }>;
};

export default async function AnalyticsPage({ searchParams }: Props) {
  const params = await searchParams;
  const rangeParam = params.range;
  const range: DateRangeKey =
    rangeParam === "3months" || rangeParam === "ytd" ? rangeParam : "4weeks";

  const profile = await getProfile();
  const [stats, overTime, firstTimersVsReturning] = profile
    ? await Promise.all([
        getAnalyticsStats(profile, range),
        getAttendanceOverTime(profile, range),
        getFirstTimersVsReturning(profile, range),
      ])
    : [
        { averageAttendance: 0, growthTrendPercent: null, firstTimeVisitors: 0, retentionRatePercent: null },
        [],
        [],
      ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Data-driven insights for the selected period.
          </p>
        </div>

        <form method="get" action="/analytics" className="flex gap-2">
          <select
            name="range"
            defaultValue={range}
            className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm"
          >
            <option value="4weeks">Last 4 weeks</option>
            <option value="3months">Last 3 months</option>
            <option value="ytd">Year to date</option>
          </select>
          <button
            type="submit"
            className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Apply
          </button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-xs text-zinc-500">Average attendance</div>
          <div className="mt-1 text-2xl font-semibold">{stats.averageAttendance}</div>
          <div className="text-xs text-zinc-400">Per service</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-xs text-zinc-500">Growth trend</div>
          <div className="mt-1 text-2xl font-semibold">
            {stats.growthTrendPercent != null ? `${stats.growthTrendPercent}%` : "—"}
          </div>
          <div className="text-xs text-zinc-400">vs previous period</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-xs text-zinc-500">First-time visitors</div>
          <div className="mt-1 text-2xl font-semibold">{stats.firstTimeVisitors}</div>
          <div className="text-xs text-zinc-400">Guests in period</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-xs text-zinc-500">Retention rate</div>
          <div className="mt-1 text-2xl font-semibold">
            {stats.retentionRatePercent != null ? `${stats.retentionRatePercent}%` : "—"}
          </div>
          <div className="text-xs text-zinc-400">Members attended</div>
        </div>
      </div>

      <AnalyticsCharts overTime={overTime} firstTimersVsReturning={firstTimersVsReturning} />

      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4">
        <div>
          <div className="text-sm font-semibold">Need a formal summary?</div>
          <div className="text-sm text-zinc-600">Go to Reports for exports.</div>
        </div>
        <Link
          href="/reports"
          className="h-10 rounded-md bg-zinc-900 px-4 text-center text-sm font-semibold leading-10 text-white hover:bg-zinc-800"
        >
          View reports
        </Link>
      </div>
    </div>
  );
}
