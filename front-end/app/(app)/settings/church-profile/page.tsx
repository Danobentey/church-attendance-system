import Link from "next/link";
import { getChurchConfig } from "@/app/lib/settings";
import ChurchProfileForm from "./_components/ChurchProfileForm";

export default async function ChurchProfileSettingsPage() {
  const config = await getChurchConfig();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs text-zinc-500">Settings</div>
          <h1 className="text-2xl font-semibold">Church Profile</h1>
        </div>
        <Link
          href="/settings"
          className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-center text-sm font-semibold leading-10 hover:bg-zinc-50"
        >
          Back
        </Link>
      </div>

      <ChurchProfileForm initialConfig={config} />
    </div>
  );
}
