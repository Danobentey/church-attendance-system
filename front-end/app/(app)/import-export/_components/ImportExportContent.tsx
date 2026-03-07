"use client";

import { useRef, useState } from "react";
import { importMembersAction } from "@/app/lib/import-actions";

export default function ImportExportContent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<
    { created: number; errors: string[] } | { error: string } | null
  >(null);
  const [importing, setImporting] = useState(false);

  async function handleImport() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setImportResult({ error: "Please select a CSV file." });
      return;
    }
    setImportResult(null);
    setImporting(true);
    try {
      const text = await file.text();
      const result = await importMembersAction(text);
      setImporting(false);
      if (result.ok) {
        setImportResult({ created: result.created, errors: result.errors });
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setImportResult({ error: result.error });
      }
    } catch {
      setImporting(false);
      setImportResult({ error: "Failed to read file." });
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Import members</div>
        <div className="mt-1 text-sm text-zinc-600">
          Upload a CSV with columns: first_name, last_name, phone_number, email, zone_name.
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <a
            href="/api/export/members-template"
            className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-center text-sm font-semibold leading-10 hover:bg-zinc-50"
          >
            Download template
          </a>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="rounded-md border border-zinc-300 bg-white p-2 text-sm"
          />

          <button
            type="button"
            onClick={handleImport}
            disabled={importing}
            className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {importing ? "Importing…" : "Import"}
          </button>
        </div>

        {importResult && (
          <div
            role="alert"
            className={`mt-3 rounded-md border px-3 py-2 text-sm ${
              "error" in importResult
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {"error" in importResult ? (
              importResult.error
            ) : (
              <>
                <strong>Created {importResult.created} member(s).</strong>
                {importResult.errors.length > 0 && (
                  <ul className="mt-1 list-inside list-disc text-amber-800">
                    {importResult.errors.slice(0, 5).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li>… and {importResult.errors.length - 5} more</li>
                    )}
                  </ul>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Export</div>
        <div className="mt-1 text-sm text-zinc-600">
          Download data as CSV.
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <a
            href="/api/export/members"
            className="h-10 rounded-md bg-zinc-900 px-4 text-center text-sm font-semibold leading-10 text-white hover:bg-zinc-800"
          >
            Export members
          </a>
          <a
            href="/api/export/attendance"
            className="h-10 rounded-md bg-zinc-900 px-4 text-center text-sm font-semibold leading-10 text-white hover:bg-zinc-800"
          >
            Export attendance
          </a>
          <a
            href="/api/export/guests"
            className="h-10 rounded-md bg-zinc-900 px-4 text-center text-sm font-semibold leading-10 text-white hover:bg-zinc-800 sm:col-span-2"
          >
            Export guests
          </a>
        </div>
      </div>
    </div>
  );
}
