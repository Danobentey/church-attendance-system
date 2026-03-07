"use client";

import { useState } from "react";
import { updateChurchConfig } from "@/app/lib/settings";
import type { ChurchConfigRow } from "@/app/lib/settings";

type ChurchProfileFormProps = {
  initialConfig: ChurchConfigRow | null;
};

export default function ChurchProfileForm({ initialConfig }: ChurchProfileFormProps) {
  const [churchName, setChurchName] = useState(initialConfig?.churchName ?? "");
  const [address, setAddress] = useState(initialConfig?.address ?? "");
  const [contactInfo, setContactInfo] = useState(initialConfig?.contactInfo ?? "");
  const [logoUrl, setLogoUrl] = useState(initialConfig?.logoUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    const result = await updateChurchConfig({
      churchName: churchName.trim() || null,
      address: address.trim() || null,
      contactInfo: contactInfo.trim() || null,
      logoUrl: logoUrl.trim() || null,
    });
    setSaving(false);
    if (result.ok) {
      setMessage({ type: "success", text: "Saved." });
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="name">
            Church name
          </label>
          <input
            id="name"
            value={churchName}
            onChange={(e) => setChurchName(e.target.value)}
            className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="address">
            Address
          </label>
          <input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="contact">
            Contact info
          </label>
          <input
            id="contact"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            placeholder="Phone, email, website…"
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="logoUrl">
            Logo URL
          </label>
          <input
            id="logoUrl"
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            placeholder="https://…"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="h-10 w-full rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        {message && (
          <div
            role="alert"
            className={`sm:col-span-2 rounded-md border px-3 py-2 text-sm ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
