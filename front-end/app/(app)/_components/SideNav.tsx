"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarPlus,
  UserCheck,
  UserPlus,
  Users,
  ClipboardList,
  Upload,
  BarChart3,
  FileText,
  BellRing,
  Settings,
  ShieldCheck,
} from "lucide-react";

const navGroups = [
  {
    label: "Service",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/services/today", label: "Create / Select Service", icon: CalendarPlus },
      { href: "/check-in", label: "Check-in", icon: UserCheck },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/people/new", label: "Add Member / Guest", icon: UserPlus },
      { href: "/members", label: "Member List", icon: Users },
      { href: "/follow-ups", label: "Follow-up List", icon: BellRing },
    ],
  },
  {
    label: "Data & Insights",
    items: [
      { href: "/attendance-log", label: "Attendance Log", icon: ClipboardList },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/reports", label: "Reports", icon: FileText },
      { href: "/import-export", label: "Import & Export", icon: Upload },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/settings", label: "Settings", icon: Settings, exact: true },
      { href: "/settings/users", label: "User Management", icon: ShieldCheck },
    ],
  },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {navGroups.map((group) => (
        <div key={group.label} className="mb-3">
          <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            {group.label}
          </div>
          {group.items.map((item) => {
            const active = "exact" in item && item.exact
              ? pathname === item.href
              : pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <item.icon
                  className={`h-4 w-4 shrink-0 ${active ? "opacity-100" : "opacity-60"}`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
