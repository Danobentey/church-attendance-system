import Link from "next/link";
import { getProfile } from "@/app/lib/auth";
import { getAuditLog } from "@/app/lib/audit";
import type { AuditAction } from "@/app/lib/audit";

function defaultDateFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}
function defaultDateTo(): string {
  return new Date().toISOString().slice(0, 10);
}

type Props = {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string; action?: string }>;
};

export default async function AuditLogPage({ searchParams }: Props) {
  const params = await searchParams;
  const profile = await getProfile();
  const dateFrom = params.dateFrom ?? defaultDateFrom();
  const dateTo = params.dateTo ?? defaultDateTo();
  const action = params.action as AuditAction | undefined;

  const rows = profile ? await getAuditLog(profile, { dateFrom, dateTo, action }) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs text-zinc-500">Settings</div>
          <h1 className="text-2xl font-semibold">Audit Log</h1>
          <p className="mt-1 text-sm text-zinc-600">Read-only user activity.</p>
        </div>
        <Link
          href="/settings"
          className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-center text-sm font-semibold leading-10 hover:bg-zinc-50"
        >
          Back
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <form method="get" action="/settings/audit-log" className="grid gap-3 lg:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="dateFrom" className="text-xs font-medium text-zinc-600">From</label>
            <input
              id="dateFrom"
              name="dateFrom"
              type="date"
              defaultValue={dateFrom}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="dateTo" className="text-xs font-medium text-zinc-600">To</label>
            <input
              id="dateTo"
              name="dateTo"
              type="date"
              defaultValue={dateTo}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="action" className="text-xs font-medium text-zinc-600">Action</label>
            <select
              id="action"
              name="action"
              defaultValue={action ?? ""}
              className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm"
            >
              <option value="">All</option>
              <option value="login">Login</option>
              <option value="check_in">Check-in</option>
              <option value="member_created">Member created</option>
              <option value="member_updated">Member updated</option>
              <option value="guest_created">Guest created</option>
              <option value="zone_created">Zone created</option>
              <option value="event_created">Event created</option>
              <option value="export">Export</option>
              <option value="user_created">User created</option>
              <option value="user_deactivated">User deactivated</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Apply
            </button>
          </div>
        </form>

        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid grid-cols-12 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-600">
            <div className="col-span-3">Action</div>
            <div className="col-span-3">User</div>
            <div className="col-span-3">Timestamp</div>
            <div className="col-span-3">IP</div>
          </div>

          {rows.length === 0 ? (
            <div className="border-t border-zinc-200 px-3 py-6 text-center text-sm text-zinc-500">
              No audit entries for this period.
            </div>
          ) : (
            rows.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-12 border-t border-zinc-200 px-3 py-2"
              >
                <div className="col-span-3 text-sm">{r.action}</div>
                <div className="col-span-3 text-sm">{r.userDisplay ?? "—"}</div>
                <div className="col-span-3 text-sm">
                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                </div>
                <div className="col-span-3 text-sm">{r.ipAddress ?? "—"}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
