"use client";

import { useSelectedService } from "../selected-service";

export default function ServiceSelect() {
  const { options, selectedServiceId, setSelectedServiceId } =
    useSelectedService();

  return (
    <select
      value={selectedServiceId}
      onChange={(e) => setSelectedServiceId(e.target.value)}
      className="h-9 rounded-md border border-zinc-300 bg-white px-2 text-sm"
      aria-label="Selected service"
    >
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
          {o.time ? ` (${o.time})` : ""}
        </option>
      ))}
    </select>
  );
}
