import { getProfile } from "@/app/lib/auth";
import ImportExportContent from "./_components/ImportExportContent";

export default async function ImportExportPage() {
  await getProfile();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Import & Export</h1>
        <p className="mt-1 text-sm text-zinc-600">Bulk data management.</p>
      </div>

      <ImportExportContent />
    </div>
  );
}
