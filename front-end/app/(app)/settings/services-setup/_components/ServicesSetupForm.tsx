"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateChurchConfig, addRecurringServiceName, removeRecurringServiceName } from "@/app/lib/settings";

type ServicesSetupFormProps = {
  serviceNames: string[];
  defaultServiceName: string | null;
};

export default function ServicesSetupForm({
  serviceNames,
  defaultServiceName,
}: ServicesSetupFormProps) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pendingDefault, setPendingDefault] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const [pendingAdd, setPendingAdd] = useState(false);

  async function handleSetDefault(name: string) {
    setMessage(null);
    setPendingDefault(name);
    const result = await updateChurchConfig({ defaultServiceName: name });
    setPendingDefault(null);
    if (result.ok) {
      setMessage({ type: "success", text: `"${name}" set as default service.` });
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  async function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setMessage(null);
    setPendingAdd(true);
    const result = await addRecurringServiceName(trimmed);
    setPendingAdd(false);
    if (result.ok) {
      setNewName("");
      setMessage({ type: "success", text: `"${trimmed}" added to recurring services.` });
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  async function handleRemove(name: string) {
    setMessage(null);
    setPendingRemove(name);
    const result = await removeRecurringServiceName(name);
    setPendingRemove(null);
    if (result.ok) {
      setMessage({ type: "success", text: `"${name}" removed.` });
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div>
        <div className="text-sm font-semibold">Recurring services</div>
        <p className="mt-0.5 text-xs text-zinc-500">
          These services are automatically created each day when the app loads.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {serviceNames.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center">
            <p className="text-sm text-zinc-500">No recurring services configured yet.</p>
            <p className="mt-1 text-xs text-zinc-400">Add one below to get started.</p>
          </div>
        ) : (
          serviceNames.map((name) => (
            <div
              key={name}
              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2.5"
            >
              <div className="min-w-0 flex items-center gap-2">
                <div className="truncate text-sm font-medium">{name}</div>
                {defaultServiceName === name && (
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                    Default
                  </span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {defaultServiceName !== name && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(name)}
                    disabled={pendingDefault !== null || pendingRemove !== null}
                    className="h-8 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                  >
                    {pendingDefault === name ? "Saving…" : "Set default"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(name)}
                  disabled={pendingRemove !== null || pendingDefault !== null}
                  className="h-8 rounded-md border border-red-100 bg-red-50 px-3 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  {pendingRemove === name ? "Removing…" : "Remove"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-5 border-t border-zinc-200 pt-4">
        <div className="mb-2 text-sm font-semibold">Add recurring service</div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="h-10 flex-1 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            placeholder="e.g. Sunday Service, Bible Study…"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={pendingAdd || !newName.trim()}
            className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {pendingAdd ? "Adding…" : "Add"}
          </button>
        </div>
      </div>

      {message && (
        <div
          role="alert"
          className={`mt-3 rounded-md border px-3 py-2 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
