import { getProfile } from "@/app/lib/auth";
import {
  getWeeklyAttendanceReport,
  getMonthlyGrowthReport,
  getDepartmentalReport,
} from "@/app/lib/reports";
import ReportsContent from "./_components/ReportsContent";

function getWeekStart(d: Date): string {
  const day = d.getDay();
  const diff = d.getDate() - day;
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
}

type Props = {
  searchParams: Promise<{
    weeklyWeek?: string;
    monthlyMonth?: string;
    deptFrom?: string;
    deptTo?: string;
  }>;
};

export default async function ReportsPage({ searchParams }: Props) {
  const params = await searchParams;
  const profile = await getProfile();

  const defaultWeekStart = getWeekStart(new Date());
  const defaultMonth = new Date().toISOString().slice(0, 7);
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const defaultDeptFrom = monthAgo.toISOString().slice(0, 10);

  const weeklyWeek = params.weeklyWeek ?? defaultWeekStart;
  const monthlyMonth = params.monthlyMonth ?? defaultMonth;
  const deptFrom = params.deptFrom ?? defaultDeptFrom;
  const deptTo = params.deptTo ?? today;

  const [weeklyData, monthlyData, departmentalData] = profile
    ? await Promise.all([
        getWeeklyAttendanceReport(profile, weeklyWeek),
        getMonthlyGrowthReport(profile, monthlyMonth),
        getDepartmentalReport(profile, deptFrom, deptTo),
      ])
    : [[], [], []];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Formal summaries for leadership.
        </p>
      </div>

      <ReportsContent
        weeklyWeek={weeklyWeek}
        monthlyMonth={monthlyMonth}
        deptFrom={deptFrom}
        deptTo={deptTo}
        defaultWeekStart={defaultWeekStart}
        defaultMonth={defaultMonth}
        defaultDeptFrom={defaultDeptFrom}
        today={today}
        weeklyData={weeklyData}
        monthlyData={monthlyData}
        departmentalData={departmentalData}
      />
    </div>
  );
}
