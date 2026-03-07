"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateChurchConfig } from "@/app/lib/settings";
import { createEvent } from "@/app/lib/events";

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
    const today = new Date().toISOString().slice(0, 10);
    const result = await createEvent({
      name: trimmed,
      category: "church_service",
      date: today,
    });
    setPendingAdd(false);
    if (result.ok) {
      setNewName("");
      setMessage({ type: "success", text: `"${trimmed}" added for today.` });
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="text-sm font-semibold">Recurring services</div>

      <div className="mt-3 flex flex-col gap-2">
        {serviceNames.length === 0 ? (
          <p className="text-sm text-zinc-500">No services yet. Create one below.</p>
        ) : (
          serviceNames.map((name) => (
            <div
              key={name}
              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{name}</div>
                <div className="text-xs text-zinc-500">
                  {defaultServiceName === name ? "Default" : ""}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSetDefault(name)}
                disabled={pendingDefault !== null}
                className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold hover:bg-zinc-50 disabled:opacity-50"
              >
                {pendingDefault === name ? "Saving…" : "Set default"}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-5 border-t border-zinc-200 pt-4">
        <div className="mb-2 text-sm font-semibold">Create recurring service</div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-10 flex-1 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            placeholder="Service name"
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
