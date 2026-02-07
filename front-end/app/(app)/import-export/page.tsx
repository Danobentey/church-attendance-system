export default function ImportExportPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Import & Export</h1>
        <p className="mt-1 text-sm text-zinc-600">Bulk data management.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">Import members</div>
          <div className="mt-1 text-sm text-zinc-600">
            Upload a CSV/Excel file (validation + error reporting will be added).
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold hover:bg-zinc-50"
            >
              Download template
            </button>

            <input
              type="file"
              className="rounded-md border border-zinc-300 bg-white p-2 text-sm"
            />

            <button
              type="button"
              className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Import
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">Export</div>
          <div className="mt-1 text-sm text-zinc-600">
            Download data as CSV/Excel.
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Export members
            </button>
            <button
              type="button"
              className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Export attendance
            </button>
            <button
              type="button"
              className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800 sm:col-span-2"
            >
              Export guests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
