import type { WeekBar } from "@/app/lib/analytics";
import type { FirstTimersVsReturningBar } from "@/app/lib/analytics";

type AnalyticsChartsProps = {
  overTime: WeekBar[];
  firstTimersVsReturning: FirstTimersVsReturningBar[];
};

function maxTotal(bars: WeekBar[]): number {
  if (bars.length === 0) return 1;
  return Math.max(1, ...bars.map((b) => b.total));
}

function maxCombined(bars: FirstTimersVsReturningBar[]): number {
  if (bars.length === 0) return 1;
  return Math.max(1, ...bars.map((b) => b.guests + b.members));
}

export default function AnalyticsCharts({
  overTime,
  firstTimersVsReturning,
}: AnalyticsChartsProps) {
  const maxOverTime = maxTotal(overTime);
  const maxCombinedVal = maxCombined(firstTimersVsReturning);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Attendance over time</div>
        <div className="mt-3 flex h-48 items-end gap-0.5">
          {overTime.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-500">
              No data for this period
            </div>
          ) : (
            overTime.slice(-14).map((bar, i) => (
              <div
                key={bar.label + i}
                className="flex flex-1 flex-col items-center gap-0.5"
                title={`${bar.label}: ${bar.total}`}
              >
                <div
                  className="w-full min-w-[4px] rounded-t bg-zinc-800"
                  style={{ height: `${(bar.total / maxOverTime) * 100}%`, minHeight: bar.total ? "4px" : 0 }}
                />
                <span className="hidden text-[10px] text-zinc-500 truncate max-w-full sm:inline">
                  {bar.label.slice(5)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">First-timers vs returning</div>
        <div className="mt-3 flex h-48 items-end gap-0.5">
          {firstTimersVsReturning.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-500">
              No data for this period
            </div>
          ) : (
            firstTimersVsReturning.slice(-14).map((bar, i) => {
              const total = bar.guests + bar.members;
              const pct = total / maxCombinedVal;
              return (
                <div
                  key={bar.label + i}
                  className="flex flex-1 flex-col items-center gap-0.5"
                  title={`${bar.label}: ${bar.guests} guests, ${bar.members} members`}
                >
                  <div
                    className="flex w-full flex-1 flex-col-reverse rounded-t"
                    style={{ height: `${pct * 100}%`, minHeight: total ? "8px" : 0 }}
                  >
                    <div
                      className="w-full bg-amber-600"
                      style={{
                        height: total ? `${(bar.guests / total) * 100}%` : 0,
                        minHeight: bar.guests ? "2px" : 0,
                      }}
                    />
                    <div
                      className="w-full bg-zinc-700"
                      style={{
                        height: total ? `${(bar.members / total) * 100}%` : 0,
                        minHeight: bar.members ? "2px" : 0,
                      }}
                    />
                  </div>
                  <span className="hidden text-[10px] text-zinc-500 truncate max-w-full sm:inline">
                    {bar.label.slice(5)}
                  </span>
                </div>
              );
            })
          )}
        </div>
        <div className="mt-2 flex gap-4 text-xs text-zinc-600">
          <span className="flex items-center gap-1">
            <span className="h-2 w-3 rounded bg-amber-600" /> Guests
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-3 rounded bg-zinc-700" /> Members
          </span>
        </div>
      </div>
    </div>
  );
}
