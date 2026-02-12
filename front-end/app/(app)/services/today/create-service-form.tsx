"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/app/lib/events";
import type { EventCategory } from "@/app/lib/events";

type CreateServiceFormProps = {
  defaultDate: string;
};

export default function CreateServiceForm({ defaultDate }: CreateServiceFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const category: EventCategory =
    categoryIndex === 0
      ? "church_service"
      : categoryIndex === 1
        ? "church_service"
        : "other";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await createEvent({ name: name.trim(), category, date });
    setSubmitting(false);
    if (result.ok) {
      setName("");
      setDate(defaultDate);
      setCategoryIndex(0);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className="text-sm font-medium" htmlFor="serviceName">
          Service name
        </label>
        <input
          id="serviceName"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
          placeholder="Sunday Service"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="date">
          Date
        </label>
        <input
          id="date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className="text-sm font-medium" htmlFor="type">
          Service type
        </label>
        <select
          id="type"
          value={categoryIndex}
          onChange={(e) => setCategoryIndex(Number(e.target.value))}
          className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm"
        >
          <option value={0}>Sunday</option>
          <option value={1}>Midweek</option>
          <option value={2}>Special</option>
        </select>
      </div>

      {error ? (
        <p className="sm:col-span-2 text-sm text-red-600">{error}</p>
      ) : null}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="h-10 w-full rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create service"}
        </button>
      </div>
    </form>
  );
}
