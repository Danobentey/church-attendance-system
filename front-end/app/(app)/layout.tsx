import Link from "next/link";
import LogoutButton from "./_components/LogoutButton";
import ServiceSelect from "./_components/ServiceSelect";
import { SelectedServiceProvider } from "./selected-service";
import { getProfile } from "@/app/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/services/today", label: "Create / Select Service" },
  { href: "/check-in", label: "Check-in" },
  { href: "/people/new", label: "Add Member / Guest" },
  { href: "/members", label: "Member List" },
  { href: "/attendance-log", label: "Attendance Log" },
  { href: "/import-export", label: "Import & Export" },
  { href: "/analytics", label: "Analytics" },
  { href: "/reports", label: "Reports" },
  { href: "/follow-ups", label: "Follow-up List" },
  { href: "/settings", label: "Settings" },
];

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getProfile();

  return (
    <SelectedServiceProvider>
      <div className="min-h-screen bg-zinc-50 text-zinc-900">
        <div className="flex min-h-screen">
          <aside className="hidden w-72 shrink-0 border-r border-zinc-200 bg-white p-4 md:block">
            <div className="mb-4">
              <div className="text-sm font-medium text-zinc-500">
                Church Attendance
              </div>
              <div className="text-lg font-semibold">COC Ikeja</div>
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 border-t border-zinc-200 pt-4">
              <LogoutButton />
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-zinc-900" />
                  <div>
                    <div className="text-sm font-semibold">COC Ikeja</div>
                    <div className="text-xs text-zinc-500">Attendance</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden text-xs text-zinc-500 sm:block">
                    Today
                  </div>
                  <ServiceSelect />
                  <div className="flex items-center gap-2">
                    {profile ? (
                      <>
                        <span className="text-xs text-zinc-600">
                          {profile.firstName} {profile.lastName}
                        </span>
                        <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
                          {profile.role}
                        </span>
                      </>
                    ) : null}
                    <div className="h-9 w-9 rounded-full bg-zinc-200" />
                  </div>
                </div>
              </div>
            </header>

            <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SelectedServiceProvider>
  );
}
