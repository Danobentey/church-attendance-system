import Link from "next/link";

const settingsItems = [
  {
    href: "/settings/church-profile",
    title: "Church Profile",
    description: "Church name, address, contact info, logo",
  },
  {
    href: "/settings/services-setup",
    title: "Services Setup",
    description: "Recurring services, default service, leaders",
  },
  {
    href: "/settings/backup-export",
    title: "Backup & Export",
    description: "Manual/auto backup and downloads",
  },
  {
    href: "/settings/audit-log",
    title: "Audit Log",
    description: "Read-only record of user actions",
  },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-zinc-600">Admin-only configuration.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {settingsItems.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50"
          >
            <div className="text-sm font-semibold">{s.title}</div>
            <div className="mt-1 text-sm text-zinc-600">{s.description}</div>
          </Link>
        ))}
      </div>

      <div className="text-xs text-zinc-500">
        Access control will be enforced when authentication is wired.
      </div>
    </div>
  );
}
