"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCheck,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

const mobileNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/check-in", label: "Check-in", icon: UserCheck },
  { href: "/members", label: "Members", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-200 bg-white/95 backdrop-blur-sm md:hidden">
      <div className="grid grid-cols-5 h-16 px-1">
        {mobileNavItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg mx-0.5 my-1.5 transition-all duration-150 ${
                active
                  ? "text-zinc-900"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <div
                className={`flex items-center justify-center rounded-lg p-1.5 transition-all duration-150 ${
                  active ? "bg-zinc-100" : ""
                }`}
              >
                <item.icon
                  className={`h-5 w-5 transition-all duration-150 ${
                    active ? "stroke-[2.5]" : "stroke-[1.5]"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-medium leading-none ${
                  active ? "font-semibold" : ""
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
