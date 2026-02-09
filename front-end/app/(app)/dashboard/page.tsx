import Link from "next/link";
import { getProfile } from "@/app/lib/auth";
import { getDashboardStats } from "@/app/lib/dashboard";

export default async function DashboardPage() {
  const profile = await getProfile();
  const stats = await getDashboardStats(profile);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Quick overview and fast access to today’s service.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-xs text-zinc-500">Total attendance</div>
          <div className="mt-1 text-2xl font-semibold">
            {stats.totalAttendanceToday}
          </div>
          <div className="text-xs text-zinc-400">Today</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-xs text-zinc-500">First timers</div>
          <div className="mt-1 text-2xl font-semibold">
            {stats.firstTimersToday}
          </div>
          <div className="text-xs text-zinc-400">Guests today</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-xs text-zinc-500">Members</div>
          <div className="mt-1 text-2xl font-semibold">
            {stats.membersCount}
          </div>
          <div className="text-xs text-zinc-400">
            {profile?.role === "zonal_leader" ? "In your zone" : "Total"}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-xs text-zinc-500">Guests</div>
          <div className="mt-1 text-2xl font-semibold">
            {stats.guestsCount}
          </div>
          <div className="text-xs text-zinc-400">Registered</div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-3 text-sm font-semibold">Quick actions</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/services/today"
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold hover:bg-zinc-100"
          >
            Create / Select Service (Today)
          </Link>
          <Link
            href="/check-in"
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold hover:bg-zinc-100"
          >
            Check-in
          </Link>
          <Link
            href="/people/new"
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold hover:bg-zinc-100"
          >
            Add Member / Guest
          </Link>
        </div>
      </div>
    </div>
  );
}
