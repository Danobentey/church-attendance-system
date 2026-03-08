import Link from "next/link";
import {
  Church,
  CalendarClock,
  DatabaseBackup,
  ScrollText,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

const settingsItems = [
  {
    href: "/settings/church-profile",
    title: "Church Profile",
    description: "Church name, address, contact info, and logo",
    icon: Church,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    href: "/settings/services-setup",
    title: "Services Setup",
    description: "Recurring services, default service, leaders",
    icon: CalendarClock,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    href: "/settings/users",
    title: "User Management",
    description: "Create and manage admins, secretariats, and zonal leaders",
    icon: ShieldCheck,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  {
    href: "/settings/backup-export",
    title: "Backup & Export",
    description: "Manual/auto backup and data downloads",
    icon: DatabaseBackup,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    href: "/settings/audit-log",
    title: "Audit Log",
    description: "Read-only record of all user actions",
    icon: ScrollText,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Admin-only configuration.</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {settingsItems.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.iconBg}`}>
              <s.icon className={`h-6 w-6 ${s.iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-900">{s.title}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{s.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-500" />
          </Link>
        ))}
      </div>

    </div>
  );
}
