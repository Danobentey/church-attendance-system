import Link from "next/link";
import { getChurchConfig } from "@/app/lib/settings";
import ServicesSetupForm from "./_components/ServicesSetupForm";

export default async function ServicesSetupPage() {
  const config = await getChurchConfig();
  const recurringServiceNames = config?.recurringServiceNames ?? [];
  const defaultServiceName = config?.defaultServiceName ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs text-zinc-500">Settings</div>
          <h1 className="text-2xl font-semibold">Services Setup</h1>
        </div>
        <Link
          href="/settings"
          className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-center text-sm font-semibold leading-10 hover:bg-zinc-50"
        >
          Back
        </Link>
      </div>

      <ServicesSetupForm
        serviceNames={recurringServiceNames}
        defaultServiceName={defaultServiceName}
      />
    </div>
  );
}
