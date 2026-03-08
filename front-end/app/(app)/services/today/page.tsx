import Link from "next/link";
import ServiceCards from "./service-cards";

export default function ServiceTodayPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Today's Services</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Select a service to record attendance against.
          </p>
        </div>
        <Link
          href="/settings/services-setup"
          className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-center text-sm font-semibold leading-10 hover:bg-zinc-50"
        >
          Manage recurring services
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <ServiceCards />
      </div>
    </div>
  );
}
