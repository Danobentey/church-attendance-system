"use client";

import { useRouter } from "next/navigation";
import { useSelectedService } from "../../selected-service";

export default function ServiceCards() {
  const router = useRouter();
  const { options, setSelectedServiceId, selectedServiceId } =
    useSelectedService();

  if (options.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center">
        <p className="text-sm text-zinc-500">No services scheduled for today.</p>
        <p className="mt-1 text-xs text-zinc-400">
          Add recurring services in{" "}
          <button
            type="button"
            onClick={() => router.push("/settings/services-setup")}
            className="underline underline-offset-2 hover:text-zinc-600"
          >
            Services Setup
          </button>{" "}
          to auto-create them each day.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {options.map((s) => (
        <div
          key={s.id}
          className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2"
        >
          <div>
            <div className="text-sm font-semibold">{s.name}</div>
            <div className="text-xs text-zinc-500">
              {s.time ? `Start: ${s.time}` : ""}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedServiceId(s.id);
              router.push("/check-in");
            }}
            className={`rounded-md px-3 py-2 text-xs font-semibold ${
              selectedServiceId === s.id
                ? "bg-zinc-900 text-white"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            {selectedServiceId === s.id ? "Selected" : "Select"}
          </button>
        </div>
      ))}
    </div>
  );
}
