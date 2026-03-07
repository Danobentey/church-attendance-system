import Link from "next/link";
import { getProfile } from "@/app/lib/auth";
import { getDashboardStats } from "@/app/lib/dashboard";
import {
  Users,
  UserCheck,
  UserPlus,
  Heart,
  CalendarPlus,
  ClipboardCheck,
  ChevronRight,
} from "lucide-react";

const statCards = [
  {
    key: "totalAttendanceToday" as const,
    label: "Total Attendance",
    sublabel: "Today's service",
    icon: ClipboardCheck,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    key: "firstTimersToday" as const,
    label: "First Timers",
    sublabel: "Guests today",
    icon: UserPlus,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    key: "membersCount" as const,
    label: "Members",
    sublabel: null,
    icon: Users,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    key: "guestsCount" as const,
    label: "Registered Guests",
    sublabel: "All time",
    icon: Heart,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
];

const quickActions = [
  {
    href: "/services/today",
    label: "Create / Select Service",
    description: "Set up today's service",
    icon: CalendarPlus,
    accent: "bg-zinc-900 text-white hover:bg-zinc-800",
    iconBg: "bg-white/10",
  },
  {
    href: "/check-in",
    label: "Check-in",
    description: "Mark attendance quickly",
    icon: UserCheck,
    accent: "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50",
    iconBg: "bg-zinc-100",
  },
  {
    href: "/people/new",
    label: "Add Member / Guest",
    description: "Register a new person",
    icon: UserPlus,
    accent: "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50",
    iconBg: "bg-zinc-100",
  },
];

export default async function DashboardPage() {
  const profile = await getProfile();
  const stats = await getDashboardStats(profile);

  const statValues: Record<string, number> = {
    totalAttendanceToday: stats.totalAttendanceToday,
    firstTimersToday: stats.firstTimersToday,
    membersCount: stats.membersCount,
    guestsCount: stats.guestsCount,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Quick overview and fast access to today&apos;s service.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-zinc-500">{card.label}</p>
              <div className={`rounded-lg p-2 ${card.iconBg}`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
              {statValues[card.key]}
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              {card.key === "membersCount"
                ? profile?.role === "zonal_leader"
                  ? "In your zone"
                  : "Total registered"
                : card.sublabel}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="mb-4 text-sm font-semibold text-zinc-700">Quick actions</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`group flex items-center gap-4 rounded-xl px-4 py-4 transition-all ${action.accent}`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.iconBg}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{action.label}</div>
                <div className="mt-0.5 truncate text-xs opacity-60">
                  {action.description}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-40 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
