export default function ReportsPage() {
  const reportTypes = [
    {
      title: "Weekly attendance",
      description: "Summary of attendance for the week.",
    },
    {
      title: "Monthly growth",
      description: "Growth trends and retention.",
    },
    {
      title: "Departmental attendance",
      description: "Attendance broken down by department/unit.",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Formal summaries for leadership.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {reportTypes.map((r) => (
          <div key={r.title} className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-semibold">{r.title}</div>
            <div className="mt-1 text-sm text-zinc-600">{r.description}</div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="h-10 flex-1 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Generate
              </button>
              <button
                type="button"
                className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold hover:bg-zinc-50"
              >
                Export
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-zinc-500">
        One-click report generation + PDF/Excel export will be added later.
      </div>
    </div>
  );
}
