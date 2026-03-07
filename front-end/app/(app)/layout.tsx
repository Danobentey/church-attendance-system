import { redirect } from "next/navigation";
import LogoutButton from "./_components/LogoutButton";
import ServiceSelect from "./_components/ServiceSelect";
import SideNav from "./_components/SideNav";
import MobileNav from "./_components/MobileNav";
import { ToastProvider } from "./_components/Toast";
import { SelectedServiceProvider } from "./selected-service";
import { getProfile } from "@/app/lib/auth";
import {
  getPreferredEventIdForDate,
  getTodayEventsWithDefault,
} from "@/app/lib/events";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

const roleConfig: Record<string, { label: string; className: string }> = {
  system_admin: {
    label: "System Admin",
    className: "bg-purple-100 text-purple-700 border border-purple-200",
  },
  secretariat: {
    label: "Secretariat",
    className: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  zonal_leader: {
    label: "Zonal Leader",
    className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  },
};

function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getProfile();
  if (!profile) {
    redirect("/login");
  }
  const today = todayIsoDate();
  const todayEvents = profile ? await getTodayEventsWithDefault(profile) : [];
  const serviceOptions = todayEvents.map((e) => ({
    id: e.id,
    name: e.name,
    time: undefined as string | undefined,
  }));
  const preferredEventId =
    todayEvents.length > 0
      ? await getPreferredEventIdForDate(todayEvents, today)
      : null;

  const roleInfo = profile?.role ? roleConfig[profile.role] : null;
  const initials = profile
    ? getInitials(profile.firstName ?? "", profile.lastName ?? "")
    : "?";

  return (
    <SelectedServiceProvider
      initialOptions={serviceOptions}
      initialSelectedId={preferredEventId ?? undefined}
    >
      <ToastProvider>
        <div className="min-h-screen bg-zinc-50 text-zinc-900">
          <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-200 bg-white md:flex">
              <div className="border-b border-zinc-100 px-4 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-white shadow-sm">
                    C
                  </div>
                  <div>
                    <div className="text-sm font-semibold leading-tight">COC Ikeja</div>
                    <div className="text-xs text-zinc-400">Attendance System</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-4">
                <SideNav />
              </div>

              <div className="border-t border-zinc-100 px-3 py-3">
                <LogoutButton />
              </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
              {/* Top Header */}
              <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
                  {/* Mobile branding */}
                  <div className="flex items-center gap-2.5 md:hidden">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white">
                      C
                    </div>
                    <span className="text-sm font-semibold">COC Ikeja</span>
                  </div>

                  {/* Desktop: spacer so service select stays right */}
                  <div className="hidden md:block" />

                  <div className="flex items-center gap-3">
                    <span className="hidden text-xs text-zinc-400 sm:block">Today</span>
                    <ServiceSelect />

                    {profile && (
                      <div className="flex items-center gap-2">
                        <div className="hidden flex-col items-end sm:flex">
                          <span className="text-xs font-medium text-zinc-700">
                            {profile.firstName} {profile.lastName}
                          </span>
                          {roleInfo && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold leading-tight ${roleInfo.className}`}
                            >
                              {roleInfo.label}
                            </span>
                          )}
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white shadow-sm">
                          {initials}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </header>

              {/* Page content */}
              <main className="mx-auto w-full max-w-6xl flex-1 p-4 pb-24 sm:p-6 sm:pb-24 md:pb-6">
                {children}
              </main>
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileNav />
        </div>
      </ToastProvider>
    </SelectedServiceProvider>
  );
}
